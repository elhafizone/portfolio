/**
 * Element tags the polymorphic motion primitives are allowed to render as.
 *
 * Deliberately narrower than React's `ElementType`: that union includes void
 * elements like <br> and <img> whose `children` is typed `never`, which makes
 * every polymorphic component fail to type-check. Listing the container tags we
 * actually use keeps the components fully type-safe without casting to `any`.
 */
export type ContainerTag =
  | 'div'
  | 'span'
  | 'p'
  | 'section'
  | 'article'
  | 'header'
  | 'footer'
  | 'aside'
  | 'ul'
  | 'ol'
  | 'li'
  | 'figure'
  | 'figcaption'
  | 'blockquote'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6';
