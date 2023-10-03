/* termo */
import termoMain from '../../components/images/printingMethods/termo/main.webp';
import termo1 from '../../components/images/printingMethods/termo/1.webp';
import termo2 from '../../components/images/printingMethods/termo/2.webp';
import termo3 from '../../components/images/printingMethods/termo/3.webp';
import termo4 from '../../components/images/printingMethods/termo/4.webp';
import termo5 from '../../components/images/printingMethods/termo/5.webp';
import termo6 from '../../components/images/printingMethods/termo/6.webp';
/* vishivka */
import vishivkaMain from '../../components/images/printingMethods/vishivka/main.webp';
import vishivka1 from '../../components/images/printingMethods/vishivka/1.webp';
import vishivka2 from '../../components/images/printingMethods/vishivka/2.webp';
import vishivka3 from '../../components/images/printingMethods/vishivka/3.webp';
import vishivka4 from '../../components/images/printingMethods/vishivka/4.webp';
import vishivka5 from '../../components/images/printingMethods/vishivka/5.webp';
import vishivka6 from '../../components/images/printingMethods/vishivka/6.webp';
/* silk */
import silkMain from '../../components/images/printingMethods/silk/main.webp';
import silk1 from '../../components/images/printingMethods/silk/1.webp';
import silk2 from '../../components/images/printingMethods/silk/2.webp';
import silk3 from '../../components/images/printingMethods/silk/3.webp';
import silk4 from '../../components/images/printingMethods/silk/4.webp';
import silk5 from '../../components/images/printingMethods/silk/5.webp';
import silk6 from '../../components/images/printingMethods/silk/6.webp';
/* dtf */
import dtfMain from '../../components/images/printingMethods/DTF/main.webp';
import dtf1 from '../../components/images/printingMethods/DTF/1.webp';
import dtf2 from '../../components/images/printingMethods/DTF/2.webp';
import dtf3 from '../../components/images/printingMethods/DTF/3.webp';
import dtf4 from '../../components/images/printingMethods/DTF/4.webp';
import dtf5 from '../../components/images/printingMethods/DTF/5.webp';
import dtf6 from '../../components/images/printingMethods/DTF/6.webp';
/* dtg */
import dtgMain from '../../components/images/printingMethods/DTG/main.webp';
import dtg1 from '../../components/images/printingMethods/DTG/1.webp';
import dtg2 from '../../components/images/printingMethods/DTG/2.webp';
import dtg3 from '../../components/images/printingMethods/DTG/3.webp';
import dtg4 from '../../components/images/printingMethods/DTG/4.webp';
import dtg5 from '../../components/images/printingMethods/DTG/5.webp';
import dtg6 from '../../components/images/printingMethods/DTG/6.webp';
// точка, имитация пункта списка
const point = '\u{22C5}';
// неразрывный пробел
const nbsp = '\u{00A0}';
// мягкий перенос, через тире
const softHyphen = '\u{00AD}';
// возврат каретки, перенос без тире
const carriageReturn = '\u{000D}';

const methodsData = {
  termo: {
    metaTitle:
      'Термотрансферная печать на футболках в Санкт-Петербурге заказать в Studio Pinhead',
    metaKeywords:
      'термотрансферная печать на футболках, термотрансфер, флекс, флексопечать, нанесение, санкт-петербург',
    metaDescription:
      'Заказать термотрансферную печать на футболках в Санкт-Петербурге от 1 штуки можно у нас. Флекс печать (термотрансфер) на одежде на заказ в Studio Pinhead.',
    main_heading: `ТЕРМО—${carriageReturn}ТРАНСФЕРНАЯ ПЕЧАТЬ`,
    brief_subtitle:
      'Термотрансферная печать (флекс) — это отличный способ создать яркие, долговечные и высококачественные изображения на футболках. Studio Pinhead в Санкт-Петербурге предлагает услуги термотрансферной печати на футболках и другой одежде, заказать которые вы можете полностью онлайн на нашем сайте.',
    faq: {
      title: `Преимущества термо—${carriageReturn}трансферной печати на футболках`,
      variants: [
        {
          screen_heading: 'Качество и долговечность',
          screen_description:
            'Термотрансферная печать на одежде обеспечивает высокое качество изображения с четкими деталями и яркими цветами. Термопечать прочно закрепляется на ткани, что делает ее стойкой к истиранию.',
        },
        {
          screen_heading: 'Разнообразие дизайнов',
          screen_description:
            'С помощью флексопечати на футболках вы можете создавать разнообразные дизайны, включая сложные графические элементы и, логотипы с одним или двумя цветами.',
        },
        {
          screen_heading: 'Оперативность',
          screen_description:
            'Термотрансферная печать идеально подходит для срочного нанесения плашечных одноцветных логотипов и изображений на одежду в небольших тиражах.',
        },
        {
          screen_heading: 'Разнообразие цветов и эффектов',
          screen_description:
            'Доступна широкая гамма цветов и различных эффектов, таких как металлизированные оттенки или блестки, которые позволяют сделать дизайн футболки еще более привлекательным.',
        },
      ],
      description:
        'Если вы ищете надежную и профессиональную студию для заказа термотрансферной печати на футболках в Санкт-Петербурге, обратитесь к нам в Studio Pinhead. Мы гарантируем высокое качество, индивидуальный подход и оперативное выполнение заказа. Создайте яркий и оригинальный стиль вместе с нами!',
    },
    price: {
      A6: 400,
      A5: 500,
      A4: 650,
      A3: 750,
      A33: 900,
    },
    price_type: 'Термотрансфер',
    images: {
      main: termoMain,
      gallery: [termo1, termo2, termo3, termo4, termo5, termo6],
    },
  },
  vishivka: {
    metaTitle:
      'Вышивка на футболках на заказ в Санкт-Петербурге от 1 штуки недорого в Studio Pinhead',
    metaKeywords:
      'вышивка на футболках, на заказ, санкт-петербург, логотип, черный, белый, оверсайз, заказать, надпись, 1 штука, стоимость, цена, текст, одежда, худи',
    metaDescription:
      'Заказать вышивку на футболке в Санкт-Петербурге можно недорого в нашей студии. Вышивка на футболках и другой одежде на заказ от 1 штуки по выгодной цене в Studio Pinhead.',
    main_heading: 'ВЫШИВКА',
    brief_subtitle:
      'Studio Pinhead в Санкт-Петербурге предлагает заказать вышивку на футболках для тех, кто хочет создать неповторимый корпоративный стиль и уникальный дизайн одежды.',
    faq: {
      title: 'Преимущества вышивки',
      variants: [
        {
          screen_heading: 'Черное и белое',
          screen_description:
            'Одними из самых популярных вариантов являются черный и белый. Эти два цвета обеспечивают элегантность и контрастность, позволяя создавать выразительные и запоминающиеся изображения.',
        },
        {
          screen_heading: 'Оверсайз футболки',
          screen_description: [
            'Оверсайз футболки сочетают в себе комфорт и стиль, что делает их отличным выбором. Вышитый на заказ логотип или надпись на оверсайз футболке добавит индивидуальности и оригинальности образу',
            'Также у нас вы найдете классические модели одежды, поэтому выбирайте то, что лучше подойдет для вас или вашей компании.',
          ],
        },
        {
          screen_heading: 'Почему стоит доверять Studio Pinhead',
          screen_description: [
            'Команда студии Pinhead с радостью поможет вам реализовать любые идеи. Мы работаем с различными цветами и шрифтами, чтобы создать уникальные и запоминающиеся изображения. Вы можете заказать вышивку логотипа, надписи или другого текста.',
            'Помимо футболок, мы также предлагаем вышивку на худи, свитшотах и толстовках. Вы можете создать собственный стильный комплект, добавив индивидуальные вышитые элементы.',
            'Стоимость вышивки на одежде зависит от размера изображения, сложности дизайна и тиража. Мы предлагаем гибкую систему ценообразования, чтобы каждый мог выбрать оптимальное решение для себя и своего бизнеса. ',
            'Если вы хотите заказать вышивку на футболке или другой одежде, свяжитесь с нами прямо сейчас. Мы с удовольствием проконсультируем вас, поможем выбрать оптимальное решение и создадим вышивку, отражающую ваш индивидуальный стиль. Воплотите свои идеи в реальность с помощью Studio Pinhead!',
          ],
        },
      ],
      description: '',
    },
    price: {
      A6: 900,
      A5: 1100,
      A4: 1600,
      A3: 2100,
    },
    price_type: 'ВЫШИВКА',
    images: {
      main: vishivkaMain,
      gallery: [
        vishivka1,
        vishivka2,
        vishivka3,
        vishivka4,
        vishivka5,
        vishivka6,
      ],
    },
  },
  silk: {
    metaTitle:
      'Шелкография на футболках в Санкт-Петербурге на заказ от 1 штуки цена в Studio Pinhead',
    metaKeywords:
      'шелкография на футболках, санкт-петербург, печать, цена, трафаретный, нанесение, 1, стоимость, сделать, одежда',
    metaDescription:
      'Сделать шелкографию на футболке в Санкт-Петербурге по выгодной цене в Studio Pinhead. Нанесение печати на футболки методом шелкографии от 1 штуки.',
    main_heading: 'Шелкография',
    brief_subtitle:
      'Studio Pinhead в Санкт-Петербурге предлагает заказать шелкографию на футболках и другой одежде для создания уникальных дизайнов и логотипов.',
    faq: {
      title: 'Преимущества шелкографии',
      variants: [
        {
          screen_heading: 'Основные принципы печати',
          screen_description:
            'В основе шелкографии лежит использование трафарета — специальной формы, которая позволяет нанести рисунок на ткань. Трафарет изготавливается из специальной бумаги или ткани, на которую наносится рисунок. Затем он помещается на ткань, и краска наносится через специальные отверстия, создавая рисунок. ',
        },
        {
          screen_heading: 'Виды трафаретной печати на ткани',
          screen_description: [
            'Существует 2 вида трафаретной печати:',
            `${point} прямая печать – краска наносится непосредственно на ткань`,
            `${point} термопечать – рисунок наносится на ткань при помощи термического пресса.`,
          ],
        },
        {
          screen_heading: 'Преимущества шелкографии:',
          screen_description: [
            `${point} высокая точность и детализация рисунка на футболках и другой одежде`,
            `${point} возможность использования различных цветов и оттенков`,
            `${point} устойчивость к стирке и износу`,
          ],
        },
      ],
      description: '',
    },
    price_type: 'ШЕЛКОГРАФИЯ',
    price_var: 'Стоимость шелкографии на футболках',
    price:
      'Цена зависит от размера, сложности рисунка и объема тиража. Studio Pinhead в Санкт-Петербурге предлагает печать шелкографией на  футболках по выгодной цене от 1 штуки и гарантирует качество своих изделий. Создавайте уникальные дизайны и логотипы вместе с нами!',
    images: {
      main: silkMain,
      gallery: [silk1, silk2, silk3, silk4, silk5, silk6],
    },
  },
  dtg: {
    metaTitle:
      'Прямая DTG печать на футболках в Санкт-Петербурге от 1 штуки цена в Studio Pinhead ',
    metaKeywords:
      'прямая печать на футболках, dtg, дтг, цифровой, санкт-петербург, одежда',
    metaDescription:
      'Прямая цифровая печать на футболках в Санкт-Петербурге по выгодной цене в Studio Pinhead. Заказать прямую DTG печать на одежде от 1 штуки онлайн на сайте.',
    main_heading: `ПРЯМАЯ${carriageReturn}ПЕЧАТЬ${nbsp}(DTG)`,
    brief_subtitle:
      'Studio Pinhead в Санкт-Петербурге предлагает заказать прямую печать на футболках с использованием одной из самых популярных технологий — DTG (Direct To Garment). ',
    faq: {
      title: 'Преимущества DTG-печати',
      variants: [
        {
          screen_heading: 'В чем преимущества DTG печати',
          screen_description: [
            'Прямая печать позволяет создавать яркие и красочные принты на любых типах тканей и одежде. Это идеальный способ для создания уникальных и эксклюзивных вещей, таких как футболки, толстовки, свитшоты, худи',
            'Одной из главных преимуществ ДТГ печати является ее скорость и качество. Принты создаются непосредственно на ткани, что позволяет получить готовый продукт уже через несколько часов после заказа. Кроме того, качество печати очень высокое, так как чернила проникают глубоко в ткань и не стираются со временем.',
            'Если вы ищете способ создать уникальную футболку, то прямая печать — это отличный выбор. В Studio Pinhead в Санкт-Петербурге вы можете выбрать любой дизайн и цвет, который подходит именно вам. Также можно добавить различные элементы, такие как логотипы, изображения и надписи.',
          ],
        },
      ],
      description: '',
    },
    price_type: 'DTG',
    price: {
      onWhite: {
        A6: 300,
        A5: 400,
        A4: 500,
        A3: 650,
        A33: 750,
      },
      onColored: {
        A6: 400,
        A5: 500,
        A4: 650,
        A3: 750,
        A33: 900,
      },
    },
    images: {
      main: dtgMain,
      gallery: [dtg1, dtg2, dtg3, dtg4, dtg5, dtg6],
    },
  },
  dtf: {
    metaTitle:
      'DTF печать на футболках в Санкт-Петербурге от 1 штуки цена в Studio Pinhead ',
    metaKeywords:
      'dtf печать на футболках, дтф, пленка, термопленка, полноцветный, одежда, санкт-петербург',
    metaDescription:
      'Заказать DTF печать на футболке в Санкт-Петербурге по выгодной цене в Studio Pinhead. Полноцветная печать термопленкой на одежде от 1 штуки.',
    main_heading: `DTF${nbsp}печать`,
    brief_subtitle:
      'Studio Pinhead в Санкт-Петербурге предлагает заказать DTF-печать как на футболках, так и на другой одежде, включая худи, свитшоты и толстовки. Это инновационный метод нанесения изображений на ткань, который позволяет создавать яркие и красочные принты. Основан на использовании специальной термопленки и чернил, которые наносятся на ткань с помощью специального принтера ',
    faq: {
      title: 'Преимущества DTF-печати',
      variants: [
        {
          screen_heading: 'Высокая яркость и насыщенность цветов:',
          screen_description:
            ' ДТФ-чернила содержат специальные красители, которые позволяют создавать яркие и насыщенные цвета, которые не выцветают со временем.',
        },
        {
          screen_heading: 'Быстрое время печати:',
          screen_description:
            'принтер может печатать до 300 изображений в час, что позволяет быстро создавать большие партии одежды с яркими принтами.',
        },
        {
          screen_heading: 'Возможность создания полноцветных изображений:',
          screen_description:
            'благодаря использованию нескольких цветов, с помощью ДТФ-печати можно создавать полноцветные изображения, которые выглядят очень эффектно и привлекательно.',
        },
      ],
      description: [
        'В Studio Pinhead в Санкт-Петербурге вы можете заказать DTF-печать на футболках, худи, свитшотах и других видах одежды. Мы используем только качественные материалы и чернила, чтобы наши клиенты могли наслаждаться яркими и красочными принтами на своих вещах.',
        'Закажите DTF-печать уже сегодня и создайте свой уникальный образ!',
      ],
    },
    price_type: 'DTF',
    price: {
      A6: 400,
      A5: 500,
      A4: 650,
      A3: 750,
      A33: 900,
    },
    images: {
      main: dtfMain,
      gallery: [dtf1, dtf2, dtf3, dtf4, dtf5, dtf6],
    },
  },
};

export default methodsData;
