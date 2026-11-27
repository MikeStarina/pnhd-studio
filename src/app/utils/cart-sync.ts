import type { ICartOrderElement, IProduct } from './types';

const rub = (n: number) => `${n.toLocaleString('ru-RU').replace(/\s/g, ' ')} ₽`;

/**
 * Сверка корзины с каталогом. Корзина лежит в браузере неделями, а бэкенд берёт сумму заказа как есть:
 * без сверки покупатель оформил бы товар по старой цене или больше остатка.
 * Цена и остатки берутся из каталога, количество урезается до остатка; товар, которого больше нет
 * (или не осталось ни одной выбранной штуки), из корзины уходит.
 * @returns новая корзина и что изменилось — словами для покупателя; changes пуст — корзина актуальна.
 */
export function syncCartWithCatalog(order: ICartOrderElement[], products: IProduct[]): { order: ICartOrderElement[]; changes: string[] } {
  const changes: string[] = [];
  const next = order.flatMap((elem) => {
    const product = products.find((p) => p._id === elem.item._id);
    if (!product || product.price <= 0) {
      changes.push(`${elem.item.name}: больше не продаётся, убрали из корзины`);
      return [];
    }
    if (product.price !== elem.item.price) changes.push(`${elem.item.name}: цена теперь ${rub(product.price)}`);
    const sizes = elem.item.sizes.map((size) => {
      const stock = Math.max(0, product.sizes.find((s) => s.name === size.name)?.qty ?? 0);
      const wanted = size.userQty ?? 0;
      if (wanted > stock) {
        changes.push(stock > 0
          ? `${elem.item.name}: размера ${size.name} осталось ${stock} шт.`
          : `${elem.item.name}: размер ${size.name} закончился`);
      }
      return { ...size, qty: stock, userQty: Math.min(wanted, stock) };
    });
    if (!sizes.some((size) => size.userQty > 0)) {
      changes.push(`${elem.item.name}: убрали из корзины`);
      return [];
    }
    const stockChanged = sizes.some((size, i) => size.qty !== elem.item.sizes[i].qty);
    return product.price === elem.item.price && !stockChanged ? [elem] : [{ ...elem, item: { ...elem.item, price: product.price, sizes } }];
  });
  const same = next.length === order.length && next.every((elem, i) => elem === order[i]);
  return { order: same ? order : next, changes };
}
