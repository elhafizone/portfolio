'use client';

import { Component, type ReactNode } from 'react';

type Props = { children: ReactNode; fallback: ReactNode };
type State = { failed: boolean };

/**
 * Contains any WebGL failure - driver crash, context loss, chunk error - so a
 * broken 3D layer degrades to the SVG composition instead of taking the page
 * down with it. Content is never rendered inside this boundary, only decoration.
 */
export class CanvasBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[webgl] falling back to static visual:', error);
    }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
