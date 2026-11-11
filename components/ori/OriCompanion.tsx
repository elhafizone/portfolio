'use client';

import { useEffect, useRef } from 'react';
import type { Mesh, MeshStandardMaterial, WebGLRenderer } from 'three';

import { faceWeights, lidTopWeights, type ExpressionName, type Weights } from '@/components/ori/oriControls';
import { oriEmit, oriOn, type FlyTo } from '@/lib/ori/bus';
import { bounds, clampTo, pickWaypoint, stepRoam, type RoamState, type Vec } from '@/lib/ori/roam';

/**
 * ORI, the site's 3D companion (Level 2: roaming + guide hooks).
 *
 * Roams the viewport between random waypoints, is dragged by scrolling and springs back, and flies
 * beside a section the first time it scrolls in. The wrapper is pointer-events: none; only ORI's
 * body takes a click, which opens the guide bubble (components/ori/OriGuide.tsx) via lib/ori/bus.
 * While the bubble is open ORI parks in the bottom inline-start corner. Its eyes and head follow
 * the pointer and whatever link or button is hovered; it blinks and waves on arrival.
 *
 * three.js and the 1.6 MB model load only after the intro, in their own chunk. With reduced motion
 * ORI is drawn once, still, in the corner, and nothing animates or moves.
 */

type ClipName =
  | 'Idle_Float' | 'Look_Around' | 'Look_At_Target' | 'Curious' | 'Happy' | 'Surprised' | 'Think'
  | 'Point' | 'Present' | 'Wave' | 'Celebrate' | 'Magic_Charge' | 'Magic_Release';

// section id -> what ORI does the first time it scrolls into view
const SECTION_REACTIONS: Record<string, { clip: ClipName; mood: ExpressionName }> = {
  work: { clip: 'Point', mood: 'curious' },
  services: { clip: 'Present', mood: 'happy' },
  process: { clip: 'Think', mood: 'thoughtful' },
  reviews: { clip: 'Happy', mood: 'happy' },
  contact: { clip: 'Wave', mood: 'happy' },
};
const HOLD_CLIPS: ClipName[] = ['Point', 'Present', 'Think', 'Curious', 'Happy', 'Look_At_Target'];
const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, label, [data-ori-look]';
const MODEL_URL = '/ori/ORI.glb';
const YAW = 0.32; // ORI turns towards the page from its corner

export function OriCompanion({ active }: { active: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import('three');
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
      const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
      if (disposed) return;

      let renderer: WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
      } catch {
        wrap.style.display = 'none'; // no WebGL: ORI simply isn't there
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.NeutralToneMapping;
      renderer.setClearColor(0x000000, 0);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environment = envTex;
      scene.environmentIntensity = 0.55;
      scene.add(new THREE.HemisphereLight(0xffffff, 0xd9d9d3, 1.1));
      const key = new THREE.DirectionalLight(0xffffff, 2.4);
      key.position.set(2, 3, 4);
      const fill = new THREE.DirectionalLight(0xffffff, 0.7);
      fill.position.set(-3, 1, 2);
      const rim = new THREE.DirectionalLight(0x70ba65, 2.2); // the site's accent as a back light
      rim.position.set(-2.5, 1.5, -3);
      scene.add(key, fill, rim);

      const camera = new THREE.PerspectiveCamera(26, 1, 0.05, 20);
      camera.position.set(0.12, 0.6, 3.05);
      camera.lookAt(0.06, 0.52, 0);

      const gltf = await new GLTFLoader().loadAsync(MODEL_URL);
      if (disposed) {
        renderer.dispose();
        return;
      }
      const ori = gltf.scene;
      ori.rotation.y = YAW;
      scene.add(ori);

      const morphMeshes: Mesh[] = [];
      let seedMat: MeshStandardMaterial | undefined;
      ori.traverse((o) => {
        const mesh = o as Mesh;
        if (!mesh.isMesh) return;
        mesh.frustumCulled = false; // gestures leave the bind-pose bounds
        if (mesh.morphTargetDictionary) morphMeshes.push(mesh);
        const m = mesh.material as MeshStandardMaterial;
        if (m.name === 'ORI_MAT_Seed') seedMat = m;
      });
      const upper = ori.getObjectByName('Upper');
      const seedGlow = ori.getObjectByName('FX_Seed_Glow');

      const clock = new THREE.Clock();
      const mixer = new THREE.AnimationMixer(ori);
      const action = (name: ClipName) => mixer.clipAction(THREE.AnimationClip.findByName(gltf.animations, name));
      const idle = action('Idle_Float');
      idle.play();

      // ---- state
      let current: ReturnType<typeof action> | null = null;
      let busyUntil = 0;
      let mood: ExpressionName = 'neutral';
      let moodUntil = 0;
      const look = { x: 0, y: 0, tx: 0, ty: 0 };
      const turn = { yaw: 0, pitch: 0 };
      let face: Weights = faceWeights('neutral');
      let nextBlink = 1.5;
      let blinkAt = -1;
      let lastActivity = performance.now();
      let pointer: { x: number; y: number } | null = null;
      let hoverEl: Element | null = null;
      let overOri = false;

      const setMood = (m: ExpressionName, seconds: number) => {
        mood = m;
        moodUntil = clock.elapsedTime + seconds;
      };

      const play = (name: ClipName, holdSeconds = 1.2) => {
        if (reduced) return;
        const next = action(name);
        const from = current ?? idle;
        next.reset();
        next.setLoop(THREE.LoopOnce, 1);
        next.clampWhenFinished = true;
        next.play();
        next.crossFadeFrom(from, 0.3, false);
        current = next;
        const clip = next.getClip();
        busyUntil = clock.elapsedTime + clip.duration + (HOLD_CLIPS.includes(name) ? holdSeconds : 0);
      };

      const backToIdle = () => {
        if (!current) return;
        idle.reset();
        idle.play();
        idle.crossFadeFrom(current, 0.45, false);
        current = null;
      };

      // ---- the corner box: is a screen point over ORI, and where are its eyes?
      const eyeWorld = new THREE.Vector3();
      const eyeScreen = () => {
        const r = canvas.getBoundingClientRect();
        eyeWorld.set(0, 0.69, 0.33).applyAxisAngle(new THREE.Vector3(0, 1, 0), YAW);
        const p = eyeWorld.clone().project(camera);
        return { x: r.left + ((p.x + 1) / 2) * r.width, y: r.top + ((1 - p.y) / 2) * r.height, rect: r };
      };
      const inBox = (x: number, y: number) => {
        const r = canvas.getBoundingClientRect();
        return x > r.left + r.width * 0.2 && x < r.right - r.width * 0.2 && y > r.top + r.height * 0.1 && y < r.bottom - r.height * 0.05;
      };

      // ---- page events (read only; nothing is prevented)
      const onMove = (e: PointerEvent) => {
        pointer = { x: e.clientX, y: e.clientY };
        lastActivity = performance.now();
        const over = inBox(e.clientX, e.clientY);
        if (over && !overOri) setMood('excited', 1.6);
        overOri = over;
      };
      const onOver = (e: PointerEvent) => {
        const el = (e.target as Element | null)?.closest?.(INTERACTIVE) ?? null;
        if (el && el !== hoverEl) setMood(el.closest('form') ? 'focused' : 'curious', 2);
        hoverEl = el;
      };
      const onClick = (e: MouseEvent) => {
        lastActivity = performance.now();
        const target = e.target as Element | null;
        if (target?.closest?.('a, button')) setMood('happy', 1.4);
      };
      const onScroll = () => {
        lastActivity = performance.now();
      };
      document.addEventListener('pointermove', onMove, { passive: true });
      document.addEventListener('pointerover', onOver, { passive: true });
      document.addEventListener('click', onClick, { passive: true });
      window.addEventListener('scroll', onScroll, { passive: true });

      // ---- where ORI is on screen
      const rtl = () => document.documentElement.dir === 'rtl';
      const view = () => ({ w: window.innerWidth, h: window.innerHeight, mobile: window.innerWidth < 768 });
      const boxSize = () => ({ w: wrap.offsetWidth, h: wrap.offsetHeight });
      const navH = () => Math.max(0, document.querySelector('header')?.getBoundingClientRect().bottom ?? 0);
      const corner = (): Vec => {
        const b = bounds(view(), boxSize(), navH());
        return { x: rtl() ? b.maxX : b.minX, y: b.maxY };
      };
      type Mode = 'roam' | 'park' | 'fly';
      let mode: Mode = 'roam';
      let pending: { clip: ClipName; mood: ExpressionName; until: number } | null = null;
      const start = corner();
      let roam: RoamState = { pos: start, vel: { x: 0, y: 0 }, target: start, nextAt: 2.5 };
      let lastScroll = window.scrollY;
      const place = (p: Vec, bank = 0) => {
        wrap.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) rotate(${bank.toFixed(2)}deg)`;
      };
      place(start);
      wrap.style.visibility = 'visible';

      /** Fly beside an element (inline-end gutter at its top), then play a clip on arrival. */
      const flyBeside = (el: Element, clip: ClipName, m: ExpressionName) => {
        const r = (el.querySelector('h2') ?? el).getBoundingClientRect();
        const b = bounds(view(), boxSize(), navH());
        roam.target = clampTo(b, { x: rtl() ? b.minX : b.maxX, y: r.top - boxSize().h * 0.25 });
        mode = 'fly';
        pending = { clip, mood: m, until: clock.elapsedTime + 2.5 };
      };

      const seen = new Set<string>();
      const io = new IntersectionObserver(
        (entries) => {
          for (const en of entries) {
            const id = en.target.id;
            if (!en.isIntersecting || seen.has(id) || clock.elapsedTime < busyUntil || mode === 'park') continue;
            seen.add(id);
            const r = SECTION_REACTIONS[id];
            if (reduced) continue;
            flyBeside(en.target, r.clip, r.mood);
          }
        },
        { threshold: 0.3 },
      );

      // ---- the guide bubble drives ORI through the bus
      let flyTimer = 0;
      const offs = [
        oriOn('open', () => {
          mode = 'park';
          pending = null;
          setMood('happy', 2.4);
          play('Wave', 0);
        }),
        oriOn('close', () => {
          mode = 'roam';
          roam.nextAt = clock.elapsedTime + 1.5;
        }),
        oriOn<FlyTo>('fly-to', (d) => {
          // the guide has already started the (Lenis) scroll; fly once the section has settled
          // ...but never while the bubble holds ORI parked beside it
          const el = d && document.querySelector(d.selector);
          if (!el || reduced || mode === 'park') return;
          window.clearTimeout(flyTimer);
          flyTimer = window.setTimeout(() => {
            if (mode !== 'park') flyBeside(el, (d.clip as ClipName) ?? 'Point', 'curious');
          }, 900);
        }),
        oriOn('think', () => {
          setMood('thoughtful', 6);
          play('Think', 4);
        }),
        oriOn('reply', () => {
          setMood('happy', 2.4);
          play('Present');
        }),
        oriOn('card-open', () => {
          setMood('excited', 2.2);
          play('Celebrate');
        }),
      ];

      // ---- only ORI's actual body takes a click (raycast against the mesh, not a box): a press
      // on ORI opens the guide and never reaches the link underneath; every other press passes
      // straight through the pointer-events: none wrapper.
      const raycaster = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      const overBody = (x: number, y: number) => {
        const r = canvas.getBoundingClientRect();
        if (x < r.left || x > r.right || y < r.top || y > r.bottom) return false;
        ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
        raycaster.setFromCamera(ndc, camera);
        return raycaster.intersectObject(ori, true).length > 0;
      };
      const onPress = (e: PointerEvent | MouseEvent) => {
        if (!overBody(e.clientX, e.clientY)) return;
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'click') oriEmit('open');
      };
      window.addEventListener('pointerdown', onPress, true);
      window.addEventListener('click', onPress, true);
      for (const id of Object.keys(SECTION_REACTIONS)) {
        const el = document.getElementById(id);
        if (el) io.observe(el);
      }

      // ---- sizing
      const resize = () => {
        const { width, height } = canvas.getBoundingClientRect();
        if (!width || !height) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      const ro = new ResizeObserver(resize);
      ro.observe(canvas);
      resize();

      // ---- frame
      const qParent = new THREE.Quaternion();
      const qWorld = new THREE.Quaternion();
      const qDelta = new THREE.Quaternion();
      const euler = new THREE.Euler(0, 0, 0, 'YXZ');
      const ease = (v: number, target: number, rate: number, dt: number) => v + (target - v) * (1 - Math.exp(-rate * dt));
      let raf = 0;

      const applyFace = (w: Weights) => {
        for (const m of morphMeshes) {
          const dict = m.morphTargetDictionary!;
          const inf = m.morphTargetInfluences!;
          for (const k in w) {
            const i = dict[k];
            if (i !== undefined) inf[i] = w[k];
          }
        }
      };

      const frame = () => {
        const dt = Math.min(clock.getDelta(), 0.05);
        const t = clock.elapsedTime;
        mixer.update(dt);

        // ---- movement: roam / fly / park, dragged by scroll, always clamped on screen
        const v = view();
        const box = boxSize();
        const b = bounds(v, box, navH());
        const scrollDelta = window.scrollY - lastScroll;
        lastScroll = window.scrollY;
        if (mode === 'park') roam.target = corner();
        else if (mode === 'fly') {
          const arrived = Math.hypot(roam.target.x - roam.pos.x, roam.target.y - roam.pos.y) < 24;
          if (pending && (arrived || t > pending.until)) {
            setMood(pending.mood, 2.6);
            play(pending.clip);
            pending = null;
            roam.nextAt = t + 3.5; // hold beside the section, then wander again
            mode = 'roam';
          }
        } else if (t > roam.nextAt && !current) {
          let next = pickWaypoint(v, box, navH(), roam.pos, Math.random);
          const avoid = hoverEl?.getBoundingClientRect();
          if (avoid) {
            for (let i = 0; i < 4; i++) {
              const hitsIt = next.x < avoid.right && next.x + box.w > avoid.left && next.y < avoid.bottom && next.y + box.h > avoid.top;
              if (!hitsIt) break;
              next = pickWaypoint(v, box, navH(), roam.pos, Math.random);
            }
          }
          roam.target = next;
          roam.nextAt = t + (v.mobile ? 7 + Math.random() * 5 : 4 + Math.random() * 4);
        }
        roam.target = clampTo(b, roam.target);
        roam = stepRoam(roam, dt, scrollDelta, t, {
          stiffness: v.mobile ? 4 : 6,
          damping: 2 * Math.sqrt(v.mobile ? 4 : 6),
          scrollPush: v.mobile ? 0.35 : 0.6,
        });
        const clamped = clampTo(b, roam.pos);
        if (clamped.y !== roam.pos.y) roam.vel.y = 0;
        if (clamped.x !== roam.pos.x) roam.vel.x = 0;
        roam.pos = clamped;
        place(roam.pos, Math.max(-8, Math.min(8, roam.vel.x * 0.02)));

        if (current && t > busyUntil) backToIdle();
        if (t > moodUntil) mood = 'neutral';
        if (!reduced && !current && performance.now() - lastActivity > 9000) {
          lastActivity = performance.now();
          play('Look_Around', 0);
        }

        // gaze: hovered control > pointer > rest
        const eye = eyeScreen();
        let gx = 0;
        let gy = 0;
        const focus = hoverEl?.getBoundingClientRect();
        const tx = focus ? focus.left + focus.width / 2 : pointer?.x;
        const ty = focus ? focus.top + focus.height / 2 : pointer?.y;
        if (tx !== undefined && ty !== undefined) {
          gx = Math.max(-1, Math.min(1, (tx - eye.x) / 520));
          gy = Math.max(-1, Math.min(1, (ty - eye.y) / 420));
        }
        look.x = ease(look.x, gx, 9, dt);
        look.y = ease(look.y, gy, 9, dt);
        turn.yaw = ease(turn.yaw, look.x * 0.42, 3.5, dt);
        turn.pitch = ease(turn.pitch, look.y * 0.22, 3.5, dt);

        // head follows the eyes (added on top of the clip's own pose)
        if (upper && upper.parent) {
          ori.updateMatrixWorld(true);
          upper.parent.getWorldQuaternion(qParent);
          upper.getWorldQuaternion(qWorld);
          euler.set(turn.pitch, turn.yaw, 0);
          qDelta.setFromEuler(euler);
          qWorld.premultiply(qDelta);
          upper.quaternion.copy(qParent.invert().multiply(qWorld));
        }

        // face: mood + gaze, eased, with blinks
        const target = faceWeights(mood, [look.x, look.y]);
        for (const k in target) face[k] = ease(face[k] ?? 0, target[k], 14, dt);
        if (!reduced && t > nextBlink) {
          blinkAt = t;
          nextBlink = t + 2.4 + Math.random() * 3.6;
        }
        const out: Weights = { ...face };
        const bt = (t - blinkAt) / 0.15;
        if (blinkAt >= 0 && bt >= 0 && bt <= 1) {
          const a = bt < 0.45 ? bt / 0.45 : 1 - (bt - 0.45) / 0.55;
          for (const s of ['L', 'R'] as const) {
            const shut = lidTopWeights(s, 1);
            for (const k in shut) out[k] = out[k] + (shut[k] - out[k]) * a;
          }
        }
        applyFace(out);

        // the seed glows with its clip-driven FX bone (x = emissive intensity relative to 0.4)
        if (seedGlow && seedMat) seedMat.emissiveIntensity = seedGlow.scale.x / 0.4;

        renderer.render(scene, camera);
        if (!reduced && !document.hidden) raf = requestAnimationFrame(frame);
      };

      // reduced motion: one still frame in the corner; a bubble event re-renders a frame so moods show
      const still = () => {
        if (!reduced) return;
        roam.pos = roam.target = corner();
        place(roam.pos);
        frame();
      };
      const onVisible = () => {
        if (reduced || document.hidden) return;
        cancelAnimationFrame(raf);
        clock.getDelta(); // drop the hidden time
        lastScroll = window.scrollY;
        raf = requestAnimationFrame(frame);
      };
      document.addEventListener('visibilitychange', onVisible);
      window.addEventListener('resize', still);

      if (!reduced) {
        setMood('happy', 2.4);
        play('Wave', 0);
      }
      frame();
      if (reduced) mode = 'park';

      cleanup = () => {
        cancelAnimationFrame(raf);
        offs.forEach((off) => off());
        window.clearTimeout(flyTimer);
        window.removeEventListener('pointerdown', onPress, true);
        window.removeEventListener('click', onPress, true);
        document.removeEventListener('visibilitychange', onVisible);
        window.removeEventListener('resize', still);
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerover', onOver);
        document.removeEventListener('click', onClick);
        window.removeEventListener('scroll', onScroll);
        io.disconnect();
        ro.disconnect();
        mixer.stopAllAction();
        envTex.dispose();
        pmrem.dispose();
        ori.traverse((o) => {
          const mesh = o as Mesh;
          if (!mesh.isMesh) return;
          mesh.geometry.dispose();
          const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
          for (const m of mats) m.dispose();
        });
        renderer.dispose();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [active]);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      style={{ visibility: 'hidden' }}
      className="pointer-events-none fixed left-0 top-0 z-40 h-[clamp(140px,19vw,250px)] w-[clamp(116px,16vw,208px)] will-change-transform"
    >
      <div className="absolute inset-x-[22%] bottom-[2%] h-[7%] rounded-[50%] bg-[radial-gradient(closest-side,rgba(13,13,13,0.16),rgba(13,13,13,0))]" />
      {/* clicks on ORI are hit-tested against the mesh in the effect; keyboard users get the
          "Talk to ORI" button in OriGuide */}
      <canvas ref={canvasRef} data-ori-canvas className="relative block h-full w-full" />
    </div>
  );
}
