/* image, изображения */
import image1 from '../../components/images/typeOfPrint/images/1.webp';
import image2 from '../../components/images/typeOfPrint/images/2.webp';
import image3 from '../../components/images/typeOfPrint/images/3.webp';
import image4 from '../../components/images/typeOfPrint/images/4.webp';
import image5 from '../../components/images/typeOfPrint/images/5.webp';
import image6 from '../../components/images/typeOfPrint/images/6.webp';

/* inscriptions, надпись */
import inscriptions1 from '../../components/images/typeOfPrint/inscriptions/1.webp';
import inscriptions2 from '../../components/images/typeOfPrint/inscriptions/2.webp';
import inscriptions3 from '../../components/images/typeOfPrint/inscriptions/3.webp';
import inscriptions4 from '../../components/images/typeOfPrint/inscriptions/4.webp';
import inscriptions5 from '../../components/images/typeOfPrint/inscriptions/5.webp';
import inscriptions6 from '../../components/images/typeOfPrint/inscriptions/6.webp';

/* logo, логотип */
import logo1 from '../../components/images/typeOfPrint/logos/1.webp';
import logo2 from '../../components/images/typeOfPrint/logos/2.webp';
import logo3 from '../../components/images/typeOfPrint/logos/3.webp';
import logo4 from '../../components/images/typeOfPrint/logos/4.webp';
import logo5 from '../../components/images/typeOfPrint/logos/5.webp';
import logo6 from '../../components/images/typeOfPrint/logos/6.webp';

/* numberAndSurname, номер и фамилия */
import numberAndSurname1 from '../../components/images/typeOfPrint/numberAndSurname/1.webp';
import numberAndSurname2 from '../../components/images/typeOfPrint/numberAndSurname/2.webp';
import numberAndSurname3 from '../../components/images/typeOfPrint/numberAndSurname/3.webp';
import numberAndSurname4 from '../../components/images/typeOfPrint/numberAndSurname/4.webp';
import numberAndSurname5 from '../../components/images/typeOfPrint/numberAndSurname/5.webp';
import numberAndSurname6 from '../../components/images/typeOfPrint/numberAndSurname/6.webp';

/* photo, фото */
import photo1 from '../../components/images/typeOfPrint/photos/1.webp';
import photo2 from '../../components/images/typeOfPrint/photos/2.webp';
import photo3 from '../../components/images/typeOfPrint/photos/3.webp';
import photo4 from '../../components/images/typeOfPrint/photos/4.webp';
import photo5 from '../../components/images/typeOfPrint/photos/5.webp';
import photo6 from '../../components/images/typeOfPrint/photos/6.webp';

// точка, имитация пункта списка
// const point = '\u{22C5}';
// неразрывный пробел
const nbsp = '\u{00A0}';
// мягкий перенос, через тире
// const softHyphen = '\u{00AD}';
// возврат каретки, перенос без тире
// const carriageReturn = '\u{000D}';

const typeOfPrintData = {
  numberAndSurname: {
    metaTitle:
      'Печать имен фамилий на футболках в Санкт-Петербурге от 1 штуки цена в Studio Pinhead',
    metaKeywords:
      'печать фамилии на футболке, имя, номер, фио, одежда, санкт-петербург',
    metaDescription:
      'Заказать печать имени, фамилии, номера на футболке в Санкт-Петербурге по выгодной цене в Studio Pinhead. Печать ФИО на одежде от 1 штуки.',
    main_heading: 'Печать фамилии и номера',
    brief_subtitle:
      'В Studio Pinhead в Санкт-Петербурге можно заказать печать фамилии, имени и номера на футболке от 1 штуки. Эта услуга стала востребованной не только среди спортсменов, но и среди тех, кто хочет подчеркнуть свою индивидуальность и стиль.',
    faq: {
      title: 'Процесс создания футболки',
      subtitle: [
        'На нашем сайте вы можете выбрать футболку, которую вы хотите использовать для печати ФИО или номера. Мы предлагаем широкий выбор моделей разных цветов, размеров и стилей.',
        'Затем разрабатывается дизайн, который будет соответствовать вашим пожеланиям. Вы также можете сделать макет самостоятельно с помощью удобного онлайн-конструктора на нашем сайте.',
        'После утверждения дизайна, начинается процесс печати вашей футболки с именем или номером. В производстве используются современное оборудование и качественные материалы, чтобы обеспечить высокое качество изделий. Вы можете быть уверены, что ваша фамилия и номер будут выглядеть ярко и четко на вашей футболке.',
        'Чтобы заказать футболку с печатью ФИО и номера, вы можете оставить заявку на сайте или написать нам в мессенджере. После согласования деталей вы сможете оплатить заказ и выбрать удобный способ доставки.',
        'Печать фамилий и номеров на футболках — это отличный способ подчеркнуть свою индивидуальность. Обращайтесь к нам, и мы сделаем все возможное, чтобы вы остались довольны результатом.',
      ],
      description: false,
    },
    price_type: 'Термотрансфер',
    images: {
      // main: termoMain,
      gallery: [
        numberAndSurname1,
        numberAndSurname2,
        numberAndSurname3,
        numberAndSurname4,
        numberAndSurname5,
        numberAndSurname6,
      ],
    },
  },
  photo: {
    metaTitle:
      'Печать фотографий на футболках в Санкт-Петербурге от 1 штуки цена в Studio Pinhead',
    metaKeywords:
      'печать фото на футболке, санкт-петербург, цена, фотография, одежда, худи',
    metaDescription:
      'Заказать печать фото на футболке в Санкт-Петербурге по выгодной цене в Studio Pinhead. Печать фотографий на футболках, худи и другой одежде от 1 штуки.',
    main_heading: 'Печать фотографий',
    brief_subtitle:
      'Фотографии являются уникальным способом сохранить воспоминания о наших самых ярких моментах. А что может быть лучше, чем превратить эти моменты в стильную одежду? Studio Pinhead в Санкт-Петербурге предлагает заказать печать фото на любой одежде, включая футболки, худи, свитшоты, толстовки.',
    faq: {
      title: 'Качество и индивидуальный подход',
      subtitle: [
        'Печать фотографий позволяет создать уникальную одежду, которая будет неповторимой и персональной. Это отличный способ выразить свою индивидуальность и подчеркнуть значимость важных моментов в жизни.',
        'Печать фото на футболках — это высокое качество и долговечность изображений. Фотографии передаются с яркостью и детализацией, сохраняя свою интенсивность даже после многократных стирок.',
        'Studio Pinhead в Санкт-Петербурге предлагает услуги печати фотографий на футболках с гарантированным качеством и индивидуальным подходом. Цены варьируются в зависимости от размера фото, количества цветов и объема тиража. Пришлите нам свои фото через форму заявки на сайте или в мессенджере и получите качественную и индивидуальную печать на вашей любимой одежде.',
      ],
      description: false,
    },
    price_type: 'ВЫШИВКА',
    images: {
      // main: vishivkaMain,
      gallery: [photo1, photo2, photo3, photo4, photo5, photo6],
    },
  },
  image: {
    metaTitle:
      'Печать принтов на футболках в Санкт-Петербурге на заказ от 1 штуки цена в Studio Pinhead',
    metaKeywords:
      'печать принта на футболке, санкт-петербург, цена, изображение, рисунок, одежда',
    metaDescription:
      'Заказать печать принта на футболке в Санкт-Петербурге по выгодной цене в Studio Pinhead. Печать изображений и рисунков на одежде от 1 штуки.',
    main_heading: `Печать${nbsp}принтов`,
    brief_subtitle:
      'В студии Pinhead в Санкт-Петербурге можно заказать печать принтов на футболках и другой одежде и создать уникальный продукт, который будет выделять вас и вашу компанию.',
    faq: {
      title: 'Что можно выбрать',
      subtitle: [
        'Печать принтов на футболках предоставляет безграничные возможности для самовыражения. Вы можете выбрать любое изображение, рисунок или дизайн, который отражает вашу индивидуальность и стиль. Будь то логотип, иллюстрация, цитата или фотография, печать принтов позволяет вам создать уникальную одежду, которая отличается от массовых предложений.',
        'Одним из ключевых преимуществ печати принтов на заказ является возможность полного контроля над дизайном. Вы можете выбрать цвета, размеры и масштабы изображения, а также его расположение на футболке. Это дает вам свободу воплотить любую творческую идею и создать уникальный стиль, который подчеркнет вашу индивидуальность.',
        'Обращайтесь в Studio Pinhead в Санкт-Петербурге, чтобы заказать футболку со своим принтом и создать уникальный стиль одежды.',
      ],
      description: false,
    },
    price_type: 'ШЕЛКОГРАФИЯ',
    images: {
      // main: silkMain,
      gallery: [image1, image2, image3, image4, image5, image6],
    },
  },
  logo: {
    metaTitle:
      'Печать логотипа на футболках в Санкт-Петербурге от 1 штуки цена в Studio Pinhead',
    metaKeywords:
      'печать логотипа на футболках, санкт-петербург, лого, эмблема, одежда',
    metaDescription:
      'Заказать печать логотипа на футболке в Санкт-Петербурге по выгодной цене в Studio Pinhead. Печать лого, эмблемы на одежде от 1 штуки.',
    main_heading: `Печать${nbsp}логотипа`,
    brief_subtitle:
      'Создание логотипа является одним из наиболее эффективных способов продвижения бренда и увеличения его узнаваемости. Studio Pinhead в Санкт-Петербурге предоставляет услуги по печати логотипов на футболках и другой одежде небольшими тиражами от 1 штуки.',
    faq: {
      title: 'Возможности выбора',
      subtitle: [
        'Первый шаг в создании лого или эмблемы — это выбор подходящего шрифта и цветовой гаммы. От этого зависит не только внешний вид изделия, но и его восприятие клиентами.',
        'Главное преимущество печати логотипа на футболке это возможность создания уникального дизайна. Это позволяет выделиться на фоне конкурентов и привлечь внимание целевой аудитории. Кроме того, печать лого и эмблем увеличивает узнаваемость бренда и повышает его статус.',
        'Мы используем все методы нанесения печати на одежду, каждый из которых имеет свои преимущества и недостатки, поэтому важно выбрать тот, который лучше всего подходит для вашего бизнеса.',
        'Заказывайте печать логотипов на футболках и другой одежде в Studio Pinhead в Санкт-Петербурге. Отзывы клиентов о нашей работе подтверждают высокое качество печати и профессионализм сотрудников. Если вы ищете надежную и профессиональную студию для создания своего логотипа, обращайтесь к нам!',
      ],
      description: false,
    },
    price_type: 'DTG',
    images: {
      // main: logoMain,
      gallery: [logo1, logo2, logo3, logo4, logo5, logo6],
    },
  },
  inscriptions: {
    metaTitle:
      'Печать надписей на футболках в Санкт-Петербурге от 1 штуки цена в Studio Pinhead',
    metaKeywords: 'печать надписей на футболках, текст, санкт-петербург',
    metaDescription:
      'Заказать печать надписей на футболке в Санкт-Петербурге по выгодной цене в Studio Pinhead. Печать надписей, текста на одежде от 1 штуки.',
    main_heading: `Печать${nbsp}надписей`,
    brief_subtitle:
      'Studio Pinhead в Санкт-Петербурге предлагает заказать печать надписей на футболках, чтобы создать свой стиль или подчеркнуть индивидуальность компании. Мы предлагаем широкий выбор дизайнов, цветов и шрифтов, чтобы вы могли создать уникальный и неповторимый образ.',
    faq: {
      title: 'Методы печати надписей',
      variants: [
        {
          screen_heading: 'Прямая печать:',
          screen_description:
            'Позволяет нанести изображение или текст непосредственно на ткань. Используется для создания ярких и насыщенных цветов, а также для создания объемных эффектов.',
        },
        {
          screen_heading: 'Шелкография:',
          screen_description: [
            'Основана на использовании трафаретов и специальных красок. Позволяет создавать яркие и четкие надписи на футболках, а также использовать различные цвета и текстуры.',
            'Выбирайте понравившийся метод и заказывайте футболки с надписями в Studio Pinhead в Санкт-Петербурге.',
          ],
        },
        {
          screen_heading: 'Термотрансферная печать:',
          screen_description:
            'Этот метод заключается в нанесении изображения или текста на специальную бумагу, а затем переносе его на ткань с помощью термопресса. Он позволяет создавать стойкие и долговечные надписи, которые не выцветают со временем.',
        },
      ],
      description: true,
    },
    price_type: 'DTF',
    images: {
      // main: dtfMain,
      gallery: [
        inscriptions1,
        inscriptions2,
        inscriptions3,
        inscriptions4,
        inscriptions5,
        inscriptions6,
      ],
    },
  },
};

export default typeOfPrintData;
