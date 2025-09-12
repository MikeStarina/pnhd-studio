export const LocalBusinessJsonLD = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "PNHD>STUDIO",
  "description": "Печать на одежде на заказ от 1 штуки в Санкт-Петербурге по выгодной цене в Pinhead Studio. Сколько стоит печать на одежде смотрите онлайн на нашем сайте.",
  "url": "https://studio.pnhd.ru/",
  "telephone": "+78129046156",
  "email": "studio@pnhd.ru",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "ул. Чапыгина, д. 1",
    "addressLocality": "Санкт-Петербург",
    "postalCode": "197022",
    "addressCountry": "RU"
  },
  "openingHours": ["Пн-Пт 11:00-20:00"],
  "priceRange": "₽",
  "areaServed": "Санкт-Петербург и область"
}

export const WebPageJsonLD = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "PNHD>STUDIO",
  "description": "Печать на одежде на заказ от 1 штуки в Санкт-Петербурге по выгодной цене в Pinhead Studio. Сколько стоит печать на одежде смотрите онлайн на нашем сайте.",
  "url": "https://studio.pnhd.ru/",
  "mainEntity": {
    "@type": "Service",
    "name": "Печать на одежде",
    "description": "Печать на одежде в Санкт-Петербурге на заказ"
  }
}


export const FAQPageJsonLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Как к вам проехать?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Повернуть с Каменноостровского проспекта на улицу Чапыгина и пройти к следующему крыльцу после Wildberries"
      }
    },
    {
      "@type": "Question",
      "name": "Можно ли сделать шелкографию на 1 штуку?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Шелкография — тиражный метод печати, делаем её только для заказов от 50 штук. Ближайший аналог — DTF"
      }
    },
    {
      "@type": "Question",
      "name": "Есть ли доставка?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "По СПб можно вызвать к нам курьера любой службы. Укажи номер заказа в комментариях и вызови доставку до двери. По РФ доставляем через СДЭК. Если нужна другая транспортная компания, то её можно вызвать самостоятельно"
      }
    },
    {
      "@type": "Question",
      "name": "Можно ли вышить/напечатать логотип известного бренда?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Мы можем отказать в печати логотипа бренда, чтобы не нарушать авторские права, либо запросить подтверждение прав"
      }
    }
  ]
}

export const ServiceJsonLD = {
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Печать на одежде",
  "provider": {
    "@type": "LocalBusiness",
    "name": "PNHD>STUDIO"
  },
  "description": "Печать на одежде в Санкт-Петербурге на заказ",
  "areaServed": "Санкт-Петербург и область",
  "availableChannel": {
    "@type": "ServiceChannel",
    "serviceUrl": "https://studio.pnhd.ru/",
    "servicePhone": "+78129046156"
  }
}

export const CatalogPageBreadCrumbsJsonLD = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Главная",
      "item": "https://studio.pnhd.ru/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Каталог",
      "item": "https://studio.pnhd.ru/shop"
    }
  ]
}

export const CatalogPageNavigationJsonLD = {
  "@context": "https://schema.org",
  "@type": "SiteNavigationElement",
  "name": "Каталог",
  "url": "https://studio.pnhd.ru/shop",
  "description": "Каталог одежды и сумок для печати в Санкт-Петербурге. Печать на футболках,толстовках, шопперах на заказ от 1 штуки по выгодной цене в Pinhead Studio"
}