/** Картинка позиции: ссылка на фото каталога или вложение письма (превью принта из заявки). */
export type MailImage = { url: string } | { cid: string; content: Buffer; contentType: string };

/** Позиция письма-подтверждения: изделие из каталога или изделие со своим принтом. */
export interface MailItem {
  /** «Футболка оверсайз» или «Худи — свой принт». */
  name: string;
  /** Строки под названием: цвет, размеры, печать. */
  details: string[];
  qty: number;
  /** Сумма позиции, ₽. */
  total: number;
  /** Сумма до скидки, ₽ — если позиция подешевела по промокоду или акции. */
  fullTotal?: number;
  image?: MailImage;
}

/** Всё, из чего собирается письмо покупателю после оформления корзины. */
export interface ConfirmationMail {
  to: string;
  /** Номера заявок на изделия с принтом; у заказа из каталога номера для покупателя нет. */
  numbers: string[];
  items: MailItem[];
  /** Доставка: самовывоз или СДЭК с адресом пункта. price null — стоимость рассчитает менеджер. */
  delivery: { kind: 'pickup' | 'delivery'; text: string; price: number | null };
  /** Итого к оплате с доставкой, ₽. */
  total: number;
}
