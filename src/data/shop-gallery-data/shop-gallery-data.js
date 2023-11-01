/* главная страница */
import all from '../../components/images/all.webp';
import man from '../../components/images/man.webp';
import wman from '../../components/images/wman.webp';
import acc from '../../components/images/acc.webp';

const shopGalleryData = {
  mainPage: [
    { id: 1, img: all, head: 'ВСЕ ТОВАРЫ /', headItalic: 'ALL', link: '/shop' },
    { id: 2, img: man, head: 'МУЖСКОЕ /', headItalic: 'MAN', link: '/shop?category=Мужское' },
    { id: 3, img: wman, head: 'ЖЕНСКОЕ /', headItalic: 'WOMAN', link: '/shop?category=Женское' },
    { id: 4, img: acc, head: 'АКСЕССУАРЫ /', headItalic: '??', link: '/shop?category=Аксессуары' },
  ],
  futbolki: [
    { id: 1, img: all, head: 'ВСЕ ТОВАРЫ /', headItalic: 'ALL', link: '/shop?type=Футболка' },
    { id: 2, img: man, head: 'МУЖСКОЕ /', headItalic: 'MAN', link: '/shop?category=Мужское&type=Футболка' },
    { id: 3, img: wman, head: 'ЖЕНСКОЕ /', headItalic: 'WOMAN', link: '/shop?category=Женское&type=Футболка' },
    { id: 4, img: acc, head: 'ДЕТСКОЕ /', headItalic: 'KIDS', link: '/shop?category=Детское&type=Футболка' },
  ],
  hudi: [
    { id: 1, img: all, head: 'ВСЕ ТОВАРЫ /', headItalic: 'ALL', link: '/shop?type=Худи' },
    { id: 2, img: man, head: 'МУЖСКОЕ /', headItalic: 'MAN', link: '/shop?category=Мужское&type=Худи' },
    { id: 3, img: wman, head: 'ЖЕНСКОЕ /', headItalic: 'WOMAN', link: '/shop?category=Женское&type=Худи' },
    { id: 4, img: acc, head: 'ДЕТСКОЕ /', headItalic: 'KIDS', link: '/shop?category=Детское&type=Худи' },
  ],
  sweatshirt: [
    { id: 1, img: all, head: 'ВСЕ ТОВАРЫ /', headItalic: 'ALL', link: '/shop?type=Свитшот' },
    { id: 2, img: man, head: 'МУЖСКОЕ /', headItalic: 'MAN', link: '/shop?category=Мужское&type=Свитшот' },
    { id: 3, img: wman, head: 'ЖЕНСКОЕ /', headItalic: 'WOMAN', link: '/shop?category=Женское&type=Свитшот' },
    { id: 4, img: acc, head: 'ДЕТСКОЕ /', headItalic: 'KIDS', link: '/shop?category=Детское&type=Свитшот' },
  ],
  shopper: [
    { id: 1, img: all, head: 'ВСЕ ТОВАРЫ /', headItalic: 'ALL', link: '/shop?type=Шоппер' },
    { id: 2, img: man, head: 'МУЖСКОЕ /', headItalic: 'MAN', link: '/shop?category=Мужское&type=Шоппер' },
    { id: 3, img: wman, head: 'ЖЕНСКОЕ /', headItalic: 'WOMAN', link: '/shop?category=Женское&type=Шоппер' },
    { id: 4, img: acc, head: 'ДЕТСКОЕ /', headItalic: 'KIDS', link: '/shop?category=Детское&type=Шоппер' },
  ],
  cap: [
    { id: 1, img: all, head: 'ВСЕ ТОВАРЫ /', headItalic: 'ALL', link: '/shop?type=Кепка' },
    { id: 2, img: man, head: 'МУЖСКОЕ /', headItalic: 'MAN', link: '/shop?category=Мужское&type=Кепка' },
    { id: 3, img: wman, head: 'ЖЕНСКОЕ /', headItalic: 'WOMAN', link: '/shop?category=Женское&type=Кепка' },
    { id: 4, img: acc, head: 'ДЕТСКОЕ /', headItalic: 'KIDS', link: '/shop?category=Детское&type=Кепка' },
  ],
};

export default shopGalleryData;
