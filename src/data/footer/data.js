const footerData = [
  {
    name: 'Клиентам',
    styles: 'customer',
    list: [
      {
        type: 'Оптовый отдел',
        link: { pathname: 'https://pnhd.ru' },
        target: '_blank',
      },
      {
        type: 'Каталог',
        link: '/shop',
      },
      {
        type: 'Контакты',
        link: '#contacts',
      },
      {
        type: 'Оферта',
        link: '/oferta',
      },
      {
        type: 'Гид по размерам',
        link: '/size_chart',
        target: '_blank',
      },
    ],
  },
  {
    name: 'Печать',
    styles: 'print',
    style: 'styles.block_print',
    list: [
      {
        type: 'Флекс',
        link: '/termotransfernaya-pechat',
      },
      {
        type: 'Вышивка',
        link: '/vishivka',
      },
      {
        type: 'Шелкография',
        link: '/shelkografiya',
      },
      {
        type: 'DTG',
        link: '/pryamaya-dtg-pechat',
      },
      {
        type: 'DTF',
        link: '/dtf-pechat',
      },
    ],
  },
  {
    name: 'Принты',
    styles: 'printing',
    style: 'styles.block_printing',
    list: [
      {
        type: 'Печать изображений',
        link: '/pechat-printov',
      },
      {
        type: 'Печать фото',
        link: '/pechat-photo',
      },
      {
        type: 'Печать надписей',
        link: '/pechat-nadpisej',
      },
      {
        type: 'Печать имени и номера',
        link: '/pechat-familii',
      },
      {
        type: 'Печать логотипов',
        link: '/pechat-logotipa',
      },
    ],
  },
  {
    name: 'Текстиль',
    styles: 'textile',
    style: 'styles.block_textile',
    list: [
      {
        type: 'Печать на футболках',
        link: '/',
      },
      {
        type: 'Печать на худи',
        link: '/',
      },
      {
        type: 'Печать на свитшотах',
        link: '/',
      },
      {
        type: 'Печать на шопперах',
        link: '/',
      },
      {
        type: 'Печать кепках',
        link: '/',
      },
    ],
  },
];

export default footerData;
