'use client';

import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useEffect, useRef } from 'react';

import { trackMeta } from '@/lib/metaPixel';

/**
 * Meta (Facebook) Pixel.
 *
 * - The base code loads `lazyOnload`, after the page is idle, so it never
 *   competes with the hero for bandwidth.
 * - `PageView` fires once from the base code, then again on client-side route
 *   changes (home <-> privacy page).
 * - `Contact` fires when a visitor opens WhatsApp, email or a phone link.
 *   One delegated listener covers every such link on the site, present and
 *   future, without touching each component.
 * - `Lead` is fired by the contact form itself, only after the server accepts
 *   the message.
 */
export function MetaPixel({ id }: { id: string }) {
  const pathname = usePathname();
  const firstPath = useRef(true);

  useEffect(() => {
    if (firstPath.current) {
      firstPath.current = false;
      return;
    }
    trackMeta('PageView');
  }, [pathname]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.('a[href]');
      if (!link) return;
      const href = link.getAttribute('href') ?? '';
      let channel = '';
      if (/^https:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(href)) channel = 'whatsapp';
      else if (href.startsWith('mailto:')) channel = 'email';
      else if (href.startsWith('tel:')) channel = 'phone';
      if (channel) trackMeta('Contact', { content_name: channel });
    };
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  return (
    <>
      <Script id="meta-pixel" strategy="lazyOnload">
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${id}');fbq('track','PageView');`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          alt=""
          src={`https://www.facebook.com/tr?id=${id}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
