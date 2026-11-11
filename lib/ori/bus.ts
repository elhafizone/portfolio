/**
 * The tiny channel between the 3D companion and the guide bubble. Both are client islands mounted
 * separately, so they talk through window events instead of shared React state.
 */

export type OriEvent = 'open' | 'close' | 'card-open' | 'fly-to' | 'think' | 'reply';
export type FlyTo = { selector: string; clip?: string };

const PREFIX = 'ori:';

export function oriEmit(name: OriEvent, detail?: unknown): void {
  window.dispatchEvent(new CustomEvent(PREFIX + name, { detail }));
}

export function oriOn<T = unknown>(name: OriEvent, fn: (detail: T) => void): () => void {
  const handler = (e: Event) => fn((e as CustomEvent<T>).detail);
  window.addEventListener(PREFIX + name, handler);
  return () => window.removeEventListener(PREFIX + name, handler);
}
