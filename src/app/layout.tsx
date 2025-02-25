import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/redux/redux-provider";
import InfoBar from "@/components/shared-components/info-bar/info-bar";
import Header from "@/components/shared-components/header/header";
import Footer from "@/components/shared-components/footer/footer";
import MobileMenu from "@/components/shared-components/mobile-menu/mobile-menu";
import CartIcon from "@/components/shared-components/cart-icon/cart-icon";
import Popup from "@/components/shared-components/popup/popup";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  verification: {
    yandex: "35381404e7bfd3a4",
    google: "M4lIu49eO2o_XQZ5jyQ3zNkORxQftkEpEvf0E04pRFU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ReduxProvider>
        <body className={inter.className}>
          <Suspense>
            <InfoBar />
          </Suspense>        
          <Popup />
          <MobileMenu />
          <main>
            <CartIcon />
            
            <Header />
            {children}
            <Footer />
          </main>
          {/* <Script id='roistat'>
            {`(function(w, d, s, h, id) {
                w.roistatProjectId = id;
                w.roistatHost = h;
                var p = d.location.protocol == "https:" ? "https://" : "http://";
                var u = /^.*roistat_visit=[^;]+(.*)?$/.test(d.cookie) ? "/dist/module.js" : "/api/site/1.0/"+id+"/init?referrer="+encodeURIComponent(d.location.href);
                var js = d.createElement(s);
                js.charset="UTF-8";
                js.async = 1;
                js.src = p+h+u;
                var js2 = d.getElementsByTagName(s)[0];
                js2.parentNode.insertBefore(js, js2);
            })(window, document, 'script', 'cloud.roistat.com', 'd377e83a9c9ee68536343fd69de092e3');`
          }
          </Script> */}
          <Script async id="metrika-counter" strategy="afterInteractive">
            {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
          (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

          ym(86217584, "init", {
                clickmap:true,
                trackLinks:true,
                accurateTrackBounce:true,
                webvisor:true,
                ecommerce:"dataLayer"
          });
          window.dataLayer = window.dataLayer || [];
          `}
          </Script>
          <Script async id="b24" strategy="afterInteractive">
            {`
                (function(w,d,u){
                        var s=d.createElement('script');s.async=true;s.src=u+'?'+(Date.now()/60000|0);
                        var h=d.getElementsByTagName('script')[0];h.parentNode.insertBefore(s,h);
                })(window,document,'https://cdn-ru.bitrix24.ru/b26302288/crm/site_button/loader_2_96njja.js');
            `}
          </Script>
          <Script type="text/javascript" async src="https://app.uiscom.ru/static/cs.min.js?k=79obNG5YrzIplUgKXZYSiPbK7agWm7Dk"></Script>
          {/* <Script
            id='andata'
            type="application/javascript"
            async
            src="//tagmanager.andata.ru/api/v1/container/9b6370c8-6f89-4792-b816-520e886444ad/published/code.js"
          ></Script> */}
        </body>
      </ReduxProvider>
    </html>
  );
}

