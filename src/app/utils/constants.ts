import { IProduct } from "./types";




export const apiBaseUrl = 'https://pnhdstudioapi.ru';
//export const apiBaseUrl = 'http://localhost:9000';

export const ACQUIRE_RATIO = 0.965 //комиссия эквайринга

export const checkResponse = (res: any) => {
    if (res.ok || res.created) {
      return res.json() as Array<IProduct>;
    }
    return res.json().then((err: any) => Promise.reject(err));
  };


  export const getShopData = async () => {
    const shopData = await fetch(`${apiBaseUrl}/api/products`, {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(checkResponse)

    return shopData.data;
}


export const tumblers = [ 'DTG', 'DTF', 'ТЕРМОПЕРЕНОС', 'ВЫШИВКА' ];

export const prices = [
    {
        name: 'DTG',
        prices: [
            {
                format: 'А6',
                price: '300 Р. / 400 Р.'
            },
            {
                format: 'А5',
                price: '400 Р. / 500 Р.'
            },
            {
                format: 'А4',
                price: '500 Р. / 650 Р.'
            },
            {
                format: 'А3',
                price: '650 Р. / 750 Р.'
            },
            {
                format: 'А3+',
                price: '750 Р. / 900 Р.'
            },
        ]
    },
    {
        name: 'DTF',
        prices: [
            {
                format: 'А6',
                price: '400 Р.'
            },
            {
                format: 'А5',
                price: '500 Р.'
            },
            {
                format: 'А4',
                price: '650 Р.'
            },
            {
                format: 'А3',
                price: '750 Р.'
            },
            {
                format: 'А3+',
                price: '900 Р.'
            },
        ]
    },
    {
        name: 'ТЕРМОПЕРЕНОС',
        prices: [
            {
                format: 'А6',
                price: '400 Р.'
            },
            {
                format: 'А5',
                price: '500 Р.'
            },
            {
                format: 'А4',
                price: '650 Р.'
            },
            {
                format: 'А3',
                price: '750 Р.'
            },
            {
                format: 'А3+',
                price: '900 Р.'
            },
        ]
    },
    {
        name: 'ВЫШИВКА',
        prices: [
            {
                format: 'А6',
                price: '900 Р.'
            },
            {
                format: 'А5',
                price: '1100 Р.'
            },
            {
                format: 'А4',
                price: '1600 Р.'
            },
            {
                format: 'А3',
                price: '2100 Р.'
            },
        ]
    },
]


export const feedbackArr = [
    {
        id: 1,
        name: 'наташа п.',
        feedback: 'Делала худи подарок. Качество огонь, клиент доволен :)',
    },
    {
        id: 2,
        name: 'дарья т.',
        feedback: 'Отличные футболки, особенно порадовал оверсайз (обычно его никто не делает) ну и качество печати!',
    },
    {
        id: 3,
        name: 'ира м.',
        feedback: 'Стирала толстовку уже раз 10. Печать как новая!',
    },
    {
        id: 4,
        name: 'саша м.',
        feedback: 'Ребята, спасибо! Очень выручили когда нужно было срочно напечатать! Качество отличное!',
    },
    {
        id: 5,
        name: 'елизавета к.',
        feedback: 'Хорошее место и очень приветливая девушка-администратор. Все показала, рассказала об уходе и красиво запаковала.',
    },
    {
        id: 6,
        name: 'дарья м.',
        feedback: 'Очень понравился сервис и результат печати. Всё качественно, быстро.',
    },
    {
        id: 7,
        name: 'соня к.',
        feedback: 'Обалденные ребята. Сделали качественно, недорого. Я считаю, что могли бы даже побольше взять…Однозначно рекомендую',
    },
]


export const faqArr = [
    {
        title: 'В какие дни работает студия?',
        text: 'Ежедневно с 11 до 21 часа. Без выходных',
    },
    {
        title: 'Как к вам проехать?',
        text: 'Повернуть с Каменноостровского проспекта на улицу Чапыгина и пройти к следующему крыльцу после Wildberries',
    },
    {
        title: 'Можно ли сделать шелкографию на 1 штуку?',
        text: 'Шелкография — тиражный метод печати, делаем её только для заказов от 50 штук. Ближайший аналог — DTF',
    },
    {
        title: 'Есть ли доставка?',
        text: `По СПб можно вызвать к нам курьера
            любой службы. Укажи номер заказа
            в комментариях и вызови доставку
            до двери.
            
            По РФ доставляем через СДЭК.
            Если нужна другая транспортная
            компания, то её можно вызвать самостоятельно`,
    },
    {
        title: 'Можно ли вышить/напечатать логотип известного бренда?',
        text: `Мы можем отказать в печати
        логотипа бренда, чтобы не нарушать
        авторские права, либо запросить
        подтверждение прав`,
    },
]


export function getCookie(cookie: string) {
    return cookie.split('; ').reduce((acc, item) => {
      const [name, value] = item.split('=')
      //@ts-ignore
      acc[name] = value
      return acc
    }, {})
}