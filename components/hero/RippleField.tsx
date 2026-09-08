'use client';

import { useEffect, useRef, useState } from 'react';

import { useMotion } from '@/components/motion/MotionProvider';

/**
 * The hero's background: a procedural gradient with a real water surface on it.
 *
 * WHY THE PHYSICS ARE ACTUALLY PHYSICS
 * ------------------------------------
 * The height field is not a decaying circle sprite. It integrates the damped
 * two-dimensional wave equation
 *
 *     d²h/dt² = c² * laplacian(h) - gamma * dh/dt
 *
 * on the GPU with the standard explicit finite-difference scheme: a five-point
 * Laplacian drives a velocity field, the velocity is damped, and the velocity
 * integrates into height. Because the medium itself is simulated rather than the
 * individual ripples, interference, reflection and dispersion all fall out for
 * free — two ripples crossing genuinely superpose instead of being drawn on top
 * of one another.
 *
 * STABILITY. The explicit scheme is conditionally stable: in 2D the Courant
 * number must satisfy c*dt/dx <= 1/sqrt(2), i.e. C <= 0.5 for the form used
 * here. WAVE_SPEED is held at 0.28, comfortably inside that bound. Raising it
 * past 0.5 does not make the water livelier, it makes the simulation explode.
 *
 * THE POINTER is a momentum kick, not a displacement: it adds to VELOCITY, which
 * is what a finger actually does to water, and is why the disturbance leaves as
 * an expanding ring rather than appearing as a static dent. The kick is applied
 * along the SEGMENT the pointer travelled since the previous frame, so a fast
 * swipe leaves a continuous wake instead of a dotted line of separate splashes.
 *
 * BOUNDARIES absorb rather than reflect. A sponge layer damps the outer band, so
 * waves leave the hero instead of bouncing back off the edges and revealing the
 * simulation as a rectangular box.
 *
 * OPTICS. The render pass takes the gradient of the height field as the surface
 * normal, then refracts the sampled point of the underlying colour gradient by
 * that slope — the small-angle approximation of Snell's law, which is accurate
 * for the shallow slopes real surface ripples have. A Blinn-Phong specular term
 * adds the glints, and the Laplacian adds caustics: converging wavefronts focus
 * light and brighten, diverging ones darken. That is the same quantity the
 * simulation already computes, reused for the thing it physically causes.
 *
 * WHY THIS CANNOT REPEAT THE OLD GROWING-CANVAS BUG
 * -------------------------------------------------
 * The previous WebGL hero measured its own container, while the container was
 * sized from its content, so the two fed each other and the hero grew on every
 * resize. Here the canvas is `position: absolute; inset: 0` — it is OUT OF FLOW
 * and mathematically cannot contribute to the height of anything. It reads its
 * size from the element it is pinned to and never writes back. Separately, the
 * SIMULATION resolution is fixed and independent of the display size, so the
 * physics cost does not change when the window does.
 */

/* -------------------------------------------------------------------------- */
/* TUNING                                                                      */
/* -------------------------------------------------------------------------- */

/** Courant number C. MUST stay <= 0.5 or the explicit scheme diverges. */
const WAVE_SPEED = 0.28;
/** Per-step velocity retention. Lower = shorter-lived ripples. */
const DAMPING = 0.997;
/**
 * Kinematic viscosity. This is the softness dial: it dissipates short
 * wavelengths much faster than long ones, so ripples smooth out as they
 * travel instead of ringing. Stable up to 0.25 for the explicit scheme.
 */
const VISCOSITY = 0.11;
/** Simulation steps per displayed frame. More = faster propagation. */
const STEPS_PER_FRAME = 2;
/** Height of the simulation lattice. Width follows from the aspect ratio. */
const SIM_HEIGHT = 256;
const SIM_WIDTH_MAX = 512;
/** Momentum added per frame under the pointer. */
const POINTER_STRENGTH = 0.04;
/** Radius of the pointer kick, in aspect-corrected UV. Wider = gentler swell. */
const POINTER_RADIUS = 0.075;
/** Cap the backing store so 4K displays do not render 4x the pixels for free. */
const MAX_DPR = 2;

/**
 * Brand palette, mirrored from the tokens in globals.css. Shaders cannot read
 * CSS custom properties, so these are duplicated deliberately — if the tokens
 * there change, change them here too.
 */
const PALETTE = {
  paper: [1.0, 1.0, 1.0],
  mint: [0.847, 0.937, 0.827], // soft tint of --accent
  sage: [0.929, 0.953, 0.918],
  accent: [0.439, 0.729, 0.396], // #70BA65
};

/** CSS stand-in used for reduced motion and for any unsupported context. */
const STATIC_GRADIENT =
  'radial-gradient(58% 52% at 50% 50%, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0) 100%),' +
  'radial-gradient(62% 58% at 92% 6%, rgba(112,186,101,0.30) 0%, rgba(112,186,101,0.08) 46%, rgba(255,255,255,0) 78%),' +
  'radial-gradient(52% 48% at 6% 96%, rgba(112,186,101,0.22) 0%, rgba(255,255,255,0) 72%),' +
  'linear-gradient(168deg, #ffffff 0%, #f7fbf6 48%, #edf5eb 100%)';

const VERT = `#version 300 es
precision highp float;
out vec2 vUv;
void main() {
  // Fullscreen triangle from gl_VertexID - no vertex buffer needed.
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const SIM_FRAG = `#version 300 es
precision highp float;

in vec2 vUv;
out vec2 outState;

uniform sampler2D uState;
uniform vec2  uTexel;
uniform float uAspect;
uniform vec2  uPointer;
uniform vec2  uPointerPrev;
uniform float uPointerActive;
uniform float uStrength;
uniform float uRadius;
uniform float uSpeed;
uniform float uDamping;
uniform float uViscosity;

/** Distance to the segment the pointer swept, so fast moves leave a wake. */
float segmentDistance(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float t = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
  return length(pa - ba * t);
}

void main() {
  vec2 state = texture(uState, vUv).rg;
  float h = state.r;
  float v = state.g;

  // Five-point Laplacian, of BOTH fields: height drives the wave, velocity
  // drives the viscosity below.
  vec2 sl = texture(uState, vUv - vec2(uTexel.x, 0.0)).rg;
  vec2 sr = texture(uState, vUv + vec2(uTexel.x, 0.0)).rg;
  vec2 sd = texture(uState, vUv - vec2(0.0, uTexel.y)).rg;
  vec2 su = texture(uState, vUv + vec2(0.0, uTexel.y)).rg;

  float laplacianH = sl.r + sr.r + su.r + sd.r - 4.0 * h;
  float laplacianV = sl.g + sr.g + su.g + sd.g - 4.0 * v;

  // d²h/dt² = c² * laplacian  ->  velocity accumulates acceleration.
  v += laplacianH * uSpeed;

  /*
    Viscosity, and the reason the water reads as SOFT rather than sharp.

    Plain damping scales every wavelength equally, which keeps the hard, ringing
    edge of a ripple right up until it disappears. Real fluids do not behave that
    way: viscous dissipation goes as the square of the wavenumber, so short
    wavelengths die far faster than long ones and a disturbance smooths as it
    spreads. Diffusing the VELOCITY field reproduces exactly that — it is the
    nu * laplacian(v) term of the Navier-Stokes momentum equation.

    So this both softens the look and makes the simulation more correct, rather
    than being a blur pass bolted on afterwards. Explicit diffusion is stable for
    nu <= 0.25 in 2D.
  */
  v += laplacianV * uViscosity;

  // Pointer kick: momentum, not displacement. Aspect-corrected so the splash
  // is round on a wide hero rather than an ellipse.
  if (uPointerActive > 0.5) {
    vec2 p  = vec2(vUv.x * uAspect, vUv.y);
    vec2 a  = vec2(uPointerPrev.x * uAspect, uPointerPrev.y);
    vec2 b  = vec2(uPointer.x * uAspect, uPointer.y);
    float dist = segmentDistance(p, a, b);
    v += uStrength * exp(-(dist * dist) / (uRadius * uRadius));
  }

  v *= uDamping;
  h += v;

  // Absorbing sponge layer: waves leave the frame instead of echoing off it.
  vec2 edge = min(vUv, 1.0 - vUv);
  float sponge = smoothstep(0.0, 0.07, min(edge.x, edge.y));
  float absorb = mix(0.92, 1.0, sponge);
  h *= absorb;
  v *= absorb;

  outState = vec2(h, v);
}`;

const RENDER_FRAG = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 outColor;

uniform sampler2D uState;
uniform vec2  uTexel;
uniform float uAspect;
uniform vec3  uPaper;
uniform vec3  uMint;
uniform vec3  uSage;
uniform vec3  uAccent;
uniform float uTime;

/**
 * The still-water colour: the editorial gradient the ripples distort.
 *
 * The bloom radii are deliberately NOT scaled by the aspect ratio. Scaling them
 * made each bloom wider than the viewport on a laptop, so every pixel landed at
 * full mint and the "gradient" was a flat green field. Fixed radii keep the
 * colour in the corners where it belongs and leave real gradation between them.
 */
vec3 baseGradient(vec2 uv) {
  float A = uAspect;
  vec2 p = vec2(uv.x * A, uv.y);

  // Two brand blooms drifting very slowly, so the surface is never dead.
  vec2 b1 = vec2(0.88 * A + sin(uTime * 0.06) * 0.02, 0.12 + cos(uTime * 0.05) * 0.015);
  vec2 b2 = vec2(0.10 * A + cos(uTime * 0.04) * 0.02, 0.92 + sin(uTime * 0.07) * 0.015);

  float d1 = 1.0 - smoothstep(0.0, 0.78, length(p - b1));
  float d2 = 1.0 - smoothstep(0.0, 0.66, length(p - b2));

  vec3 col = mix(uPaper, uSage, smoothstep(0.0, 1.0, uv.y) * 0.65);
  col = mix(col, uMint, d1 * 0.92);
  col = mix(col, mix(uMint, uAccent, 0.22), d2 * 0.55);

  // Lift the middle back towards paper. The headline is centred, and it should
  // sit on something close to white rather than on the colour.
  float core = 1.0 - smoothstep(0.0, 0.66, length(p - vec2(0.5 * A, 0.5)));
  col = mix(col, uPaper, core * 0.58);
  return col;
}

void main() {
  float h  = texture(uState, vUv).r;
  float hl = texture(uState, vUv - vec2(uTexel.x, 0.0)).r;
  float hr = texture(uState, vUv + vec2(uTexel.x, 0.0)).r;
  float hd = texture(uState, vUv - vec2(0.0, uTexel.y)).r;
  float hu = texture(uState, vUv + vec2(0.0, uTexel.y)).r;

  /*
    Optics, tuned soft.

    Every constant below was roughly halved from the first pass. A steep normal
    scale plus a tight specular exponent is what made the surface read as
    hammered metal rather than water: it turned a millimetre of slope into a
    hard-edged highlight. Broad, shallow, low-contrast is what still water
    actually looks like.
  */
  // Central differences give the surface slope; the normal follows from it.
  vec2 slope = vec2(hr - hl, hu - hd);
  vec3 normal = normalize(vec3(-slope * 30.0, 1.0));

  // Small-angle Snell: displace the sampled point by the slope.
  vec3 col = baseGradient(vUv + slope * 0.34);

  // Blinn-Phong specular. A low exponent spreads the highlight out into a
  // sheen instead of concentrating it into a glint.
  vec3 lightDir = normalize(vec3(-0.35, 0.62, 0.70));
  vec3 viewDir  = vec3(0.0, 0.0, 1.0);
  vec3 halfway  = normalize(lightDir + viewDir);
  float spec = pow(max(dot(normal, halfway), 0.0), 45.0);
  col += vec3(0.92, 1.0, 0.94) * spec * 0.26;

  // Caustics: converging wavefronts (negative Laplacian at a crest) focus
  // light and brighten; diverging ones darken. Same quantity the simulation
  // already integrates, reused for the effect it physically produces.
  float laplacian = hl + hr + hu + hd - 4.0 * h;
  col -= laplacian * 2.4;

  outColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}`;

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function link(gl: WebGL2RenderingContext, fragSource: string) {
  const vs = compile(gl, gl.VERTEX_SHADER, VERT);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragSource);
  if (!vs || !fs) return null;
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  // The shaders are owned by the program once linked.
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

export function RippleField({ className = '' }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { reduced, ready } = useMotion();
  /** Flips true only once the simulation is actually running and drawing. */
  const [live, setLive] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    if (!ready) return;
    if (reduced) {
      // Either the OS asked for reduced motion, or the frame-loop watchdog
      // found this device cannot sustain one. Both mean: gradient only.
      host.dataset.ripple = 'reduced-motion';
      return;
    }

    /*
      Why the water did not start, readable from the DOM as data-ripple on the
      host. Every bail-out below is a legitimate reason to show only the CSS
      gradient, and silently showing it is correct behaviour — but silently is
      also unbelievably hard to debug, so the reason is recorded.
    */
    const bail = (reason: string) => {
      host.dataset.ripple = reason;
    };

    const gl = canvas.getContext('webgl2', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
    }) as WebGL2RenderingContext | null;
    if (!gl) return bail('no-webgl2');

    // Rendering INTO a float texture needs this; without it the framebuffer is
    // incomplete and there is nothing to fall back to but the CSS gradient.
    if (!gl.getExtension('EXT_color_buffer_float') && !gl.getExtension('EXT_color_buffer_half_float')) {
      return bail('no-float-buffer');
    }

    const simProgram = link(gl, SIM_FRAG);
    const renderProgram = link(gl, RENDER_FRAG);
    if (!simProgram || !renderProgram) return bail('shader-compile-failed');

    /* --- simulation lattice ------------------------------------------- */
    const rect = host.getBoundingClientRect();
    const aspect = Math.max(0.2, rect.width / Math.max(1, rect.height));
    const simH = SIM_HEIGHT;
    const simW = Math.min(SIM_WIDTH_MAX, Math.max(128, Math.round(SIM_HEIGHT * aspect)));

    const makeTarget = () => {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RG16F, simW, simH, 0, gl.RG, gl.HALF_FLOAT, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const framebuffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
      return { texture, framebuffer };
    };

    let a = makeTarget();
    let b = makeTarget();

    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
      gl.deleteProgram(simProgram);
      gl.deleteProgram(renderProgram);
      return bail('framebuffer-incomplete');
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // A vertex array is still required in WebGL2 even for a buffer-less draw.
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const simUniforms = {
      state: gl.getUniformLocation(simProgram, 'uState'),
      texel: gl.getUniformLocation(simProgram, 'uTexel'),
      aspect: gl.getUniformLocation(simProgram, 'uAspect'),
      pointer: gl.getUniformLocation(simProgram, 'uPointer'),
      pointerPrev: gl.getUniformLocation(simProgram, 'uPointerPrev'),
      pointerActive: gl.getUniformLocation(simProgram, 'uPointerActive'),
      strength: gl.getUniformLocation(simProgram, 'uStrength'),
      radius: gl.getUniformLocation(simProgram, 'uRadius'),
      speed: gl.getUniformLocation(simProgram, 'uSpeed'),
      damping: gl.getUniformLocation(simProgram, 'uDamping'),
      viscosity: gl.getUniformLocation(simProgram, 'uViscosity'),
    };
    const renderUniforms = {
      state: gl.getUniformLocation(renderProgram, 'uState'),
      texel: gl.getUniformLocation(renderProgram, 'uTexel'),
      aspect: gl.getUniformLocation(renderProgram, 'uAspect'),
      paper: gl.getUniformLocation(renderProgram, 'uPaper'),
      mint: gl.getUniformLocation(renderProgram, 'uMint'),
      sage: gl.getUniformLocation(renderProgram, 'uSage'),
      accent: gl.getUniformLocation(renderProgram, 'uAccent'),
      time: gl.getUniformLocation(renderProgram, 'uTime'),
    };

    /* --- display sizing ------------------------------------------------ */
    // Reads the host's box and writes only to the canvas backing store. The
    // canvas is out of flow, so this can never change what it just measured.
    let displayW = 0;
    let displayH = 0;
    const resize = () => {
      const box = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const w = Math.max(1, Math.round(box.width * dpr));
      const h = Math.max(1, Math.round(box.height * dpr));
      if (w === displayW && h === displayH) return;
      displayW = w;
      displayH = h;
      canvas.width = w;
      canvas.height = h;
    };
    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(host);

    /* --- pointer -------------------------------------------------------- */
    const pointer = { x: 0.5, y: 0.5 };
    const pointerPrev = { x: 0.5, y: 0.5 };
    let pointerActive = false;
    /** Set on move, cleared after the frame consumes it. */
    let pointerMoved = false;

    const onPointerMove = (event: PointerEvent) => {
      const box = host.getBoundingClientRect();
      if (!box.width || !box.height) return;
      pointerPrev.x = pointer.x;
      pointerPrev.y = pointer.y;
      pointer.x = (event.clientX - box.left) / box.width;
      // GL's origin is bottom-left; the DOM's is top-left.
      pointer.y = 1 - (event.clientY - box.top) / box.height;
      if (!pointerActive) {
        pointerPrev.x = pointer.x;
        pointerPrev.y = pointer.y;
      }
      pointerActive = true;
      pointerMoved = true;
    };
    const onPointerLeave = () => {
      pointerActive = false;
      pointerMoved = false;
    };

    host.addEventListener('pointermove', onPointerMove, { passive: true });
    host.addEventListener('pointerdown', onPointerMove, { passive: true });
    host.addEventListener('pointerleave', onPointerLeave);
    host.addEventListener('pointercancel', onPointerLeave);

    /* --- run/pause gating ----------------------------------------------- */
    // Never simulate a hero that is scrolled away or on a hidden tab.
    let onScreen = true;
    const visibility = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    visibility.observe(host);

    let frame = 0;
    let disposed = false;
    const start = performance.now();

    const drawFullscreen = () => gl.drawArrays(gl.TRIANGLES, 0, 3);

    const loop = () => {
      if (disposed) return;
      frame = requestAnimationFrame(loop);
      if (!onScreen || document.hidden) return;

      resize();

      /* Simulation passes, ping-ponging between the two targets. */
      gl.useProgram(simProgram);
      gl.viewport(0, 0, simW, simH);
      gl.uniform2f(simUniforms.texel, 1 / simW, 1 / simH);
      gl.uniform1f(simUniforms.aspect, simW / simH);
      gl.uniform1f(simUniforms.strength, POINTER_STRENGTH);
      gl.uniform1f(simUniforms.radius, POINTER_RADIUS);
      gl.uniform1f(simUniforms.speed, WAVE_SPEED);
      gl.uniform1f(simUniforms.damping, DAMPING);
      gl.uniform1f(simUniforms.viscosity, VISCOSITY);
      gl.uniform1i(simUniforms.state, 0);

      for (let step = 0; step < STEPS_PER_FRAME; step += 1) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, b.framebuffer);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, a.texture);

        // The kick is spent on the first sub-step only, so STEPS_PER_FRAME
        // changes how fast waves travel, not how hard the pointer hits.
        const active = pointerActive && pointerMoved && step === 0;
        gl.uniform1f(simUniforms.pointerActive, active ? 1 : 0);
        gl.uniform2f(simUniforms.pointer, pointer.x, pointer.y);
        gl.uniform2f(simUniforms.pointerPrev, pointerPrev.x, pointerPrev.y);

        drawFullscreen();
        const swap = a;
        a = b;
        b = swap;
      }
      pointerMoved = false;

      /* Render the surface to the canvas. */
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, displayW, displayH);
      gl.useProgram(renderProgram);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, a.texture);
      gl.uniform1i(renderUniforms.state, 0);
      gl.uniform2f(renderUniforms.texel, 1 / simW, 1 / simH);
      gl.uniform1f(renderUniforms.aspect, displayW / Math.max(1, displayH));
      gl.uniform3fv(renderUniforms.paper, PALETTE.paper);
      gl.uniform3fv(renderUniforms.mint, PALETTE.mint);
      gl.uniform3fv(renderUniforms.sage, PALETTE.sage);
      gl.uniform3fv(renderUniforms.accent, PALETTE.accent);
      gl.uniform1f(renderUniforms.time, (performance.now() - start) / 1000);
      drawFullscreen();
    };

    frame = requestAnimationFrame(loop);
    host.dataset.ripple = 'live';
    setLive(true);

    return () => {
      disposed = true;
      host.dataset.ripple = 'idle';
      cancelAnimationFrame(frame);
      observer.disconnect();
      visibility.disconnect();
      host.removeEventListener('pointermove', onPointerMove);
      host.removeEventListener('pointerdown', onPointerMove);
      host.removeEventListener('pointerleave', onPointerLeave);
      host.removeEventListener('pointercancel', onPointerLeave);
      gl.deleteProgram(simProgram);
      gl.deleteProgram(renderProgram);
      gl.deleteTexture(a.texture);
      gl.deleteTexture(b.texture);
      gl.deleteFramebuffer(a.framebuffer);
      gl.deleteFramebuffer(b.framebuffer);
      gl.deleteVertexArray(vao);
      /*
        Deliberately NOT calling WEBGL_lose_context.loseContext() here.
        The canvas element outlives this effect, and React runs mount -> cleanup
        -> mount in development. Losing the context poisons the canvas for good,
        so the second mount got a dead context, bailed at the extension check,
        and the water never appeared. Deleting the resources is enough; the
        context is released with the element.
      */
      setLive(false);
    };
  }, [ready, reduced]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className={`pointer-events-auto absolute inset-0 overflow-hidden ${className}`}
      /* The CSS gradient is always painted underneath. If WebGL is missing,
         refused, or reduced motion is on, this IS the hero background and
         nothing announces that anything is absent. */
      style={{ background: STATIC_GRADIENT }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full transition-opacity duration-1000 ease-editorial"
        style={{ opacity: live ? 1 : 0 }}
      />
    </div>
  );
}
