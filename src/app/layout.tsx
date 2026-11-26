import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
// Шрифт текста — из npm-пакета: сборка не ходит в Google Fonts. Подмножества (кириллица, латиница) — по unicode-range.
import "@fontsource-variable/roboto-condensed/wght.css";
import "./globals.css";
import ReduxProvider from "@/redux/redux-provider";
import InfoBar from "@/components/shared-components/info-bar/info-bar";
import Popup from "@/components/shared-components/popup/popup";
import AuthInit from "@/components/shared-components/auth/auth-init";
import Script from "next/script";
import CookieNotice from "@/components/site/cookie-notice/cookie-notice";
import { ANALYTICS_OFF_KEY, METRIKA_ID } from "@/components/site/analytics";
import { SiteGoals } from "@/components/site/site-goals";
import { textileOptions } from "@/app/utils/textile-options-data";
import ContactButton from "@/components/site/contact-button/contact-button";
import ChromeGate from "@/components/site/chrome-gate";
import RevealObserver from "@/components/site/reveal/reveal-observer";
import SiteHeader from "@/components/site/site-header/site-header";
import PromoBar from "@/components/site/promo-bar/promo-bar";
import { promoActive } from "@/features/constructor/config/promo";
import SiteFooter from "@/components/site/site-footer/site-footer";
import SmoothScroll from "@/components/site/smooth-scroll/smooth-scroll";
import AnchorLinks from "@/components/site/smooth-scroll/anchor-links";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    verification: {
      yandex: "35381404e7bfd3a4",
      //google: "M4lIu49eO2o_XQZ5jyQ3zNkORxQftkEpEvf0E04pRFU",
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        {/* Включает скрытие блоков до первой отрисовки; если скрипт появления не запустился за 3 с — показывает всё */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.classList.add('js-reveal');setTimeout(function(){if(!window.__revealReady)document.documentElement.classList.add('reveal-all')},3000);",
          }}
        />
      </head>
      <ReduxProvider>
        <body>
          <ContactButton />
          <Suspense>
            <InfoBar />
          </Suspense>
          <CookieNotice />
          <SiteGoals />
          <RevealObserver />
          <SmoothScroll />
          <AnchorLinks />
          <AuthInit />
          <Popup />
          <PromoBar initiallyActive={promoActive()} />
          <ChromeGate part="header">
            <SiteHeader />
          </ChromeGate>
          <main>{children}</main>
          <ChromeGate part="footer">
            <SiteFooter />
          </ChromeGate>
          {/* Roistat и коллтрекинг UIS ставят свои cookie: после отказа в уведомлении о cookie их не загружаем, как и Метрику */}
          <Script id='roistat'>
            {`var analyticsOff = false;
          try { analyticsOff = localStorage.getItem("${ANALYTICS_OFF_KEY}") === "1"; } catch (e) {}
          if (!analyticsOff) (function(w, d, s, h, id) {
    w.roistatProjectId = id; w.roistatHost = h; w.roistatPage = d.location.href; w.roistatReferrer = d.referrer;
    var p = d.location.protocol == "https:" ? "https://" : "http://";
    var u = /^.*roistat_visit=[^;]+(.*)?$/.test(d.cookie) ? "/dist/module.js" : "/api/site/1.0/"+id+"/init?referrer="+encodeURIComponent(d.location.href);
    var js = d.createElement(s); js.charset="UTF-8"; js.async = 1; js.src = p+h+u; var js2 = d.getElementsByTagName(s)[0]; js2.parentNode.insertBefore(js, js2);
})(window, document, 'script', 'cloud.roistat.com', '86cd2ab6047bc5c2f8ea632e1183ac10');`
            }
          </Script>
          <Script async id="metrika-counter" strategy="afterInteractive">
            {`var analyticsOff = false;
          try { analyticsOff = localStorage.getItem("${ANALYTICS_OFF_KEY}") === "1"; } catch (e) {}
          if (analyticsOff) { window.ym = window.ym || function () {}; } else {
          (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
          (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

          ym(${METRIKA_ID}, "init", {
                referrer: document.referrer,
                url: location.href,
                clickmap:true,
                trackLinks:true,
                accurateTrackBounce:true,
                webvisor:true,
                ecommerce:"dataLayer"
          });
          }
          window.dataLayer = window.dataLayer || [];
          `}
          </Script>
          <noscript>
            <div>
              <img src={`https://mc.yandex.ru/watch/${METRIKA_ID}`} style={{ position: 'absolute', left: '-9999px' }} alt="" />
            </div>
          </noscript>
          <Script id="uiscom" strategy="afterInteractive">
            {`var analyticsOff = false;
          try { analyticsOff = localStorage.getItem("${ANALYTICS_OFF_KEY}") === "1"; } catch (e) {}
          if (!analyticsOff) {
            var cs = document.createElement("script");
            cs.async = true;
            cs.src = "https://app.uiscom.ru/static/cs.min.js?k=79obNG5YrzIplUgKXZYSiPbK7agWm7Dk";
            document.body.appendChild(cs);
          }`}
          </Script>
        </body>
      </ReduxProvider>
    </html>
  );
}

