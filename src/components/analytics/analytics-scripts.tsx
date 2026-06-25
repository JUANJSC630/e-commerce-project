"use client"

import Script from "next/script"
import { usePathname, useSearchParams } from "next/navigation"
import { Suspense, useEffect } from "react"
import { GA_ID, META_PIXEL_ID, trackPageView } from "@/lib/analytics"

/** Fires a page view on every route change (App Router doesn't auto-track SPA nav). */
function RouteChangeTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    const query = searchParams.toString()
    trackPageView(query ? `${pathname}?${query}` : pathname)
  }, [pathname, searchParams])

  return null
}

/**
 * Injects GA4 (gtag.js) and Meta Pixel when their env-var IDs are set, and tracks
 * client-side route changes. Renders nothing when neither is configured.
 */
export function AnalyticsScripts() {
  if (!GA_ID && !META_PIXEL_ID) return null

  return (
    <>
      {GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}', { send_page_view: false });
            `}
          </Script>
        </>
      )}

      {META_PIXEL_ID && (
        <Script id="meta-pixel-init" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
          `}
        </Script>
      )}

      <Suspense fallback={null}>
        <RouteChangeTracker />
      </Suspense>
    </>
  )
}
