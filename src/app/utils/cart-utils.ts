import { ICartOrderElement, IPrintFile, ICdekCitySearchResponse, ICdekPointsResponse, TUserOrderItem, IOrderBody } from "./types"
import { TCartState } from "@/redux/cart-slice/cart.slice";
import { v4 as uuidv4 } from 'uuid';
import { telegramNick } from './telegram';

export const getPreviewArrFunc = (prints?: IPrintFile[]): IPrintFile[] => {
    return (prints ?? []).filter((print) => print?.file?.url);
}


export const ruPrintPlace = (format: string): string => {
    
    const ruFormat = format === 'front' ? 'Грудь'
    : format === 'back' ? 'Спина'
    : format === 'lsleeve' ? 'Л. рукав'
    : format === 'rsleeve' ? 'П. рукав' : '';

    return ruFormat;
}


export const itemPrintUnitPrice = (elem: ICartOrderElement): number => {
    return (elem.prints ?? []).reduce((acc, print) => {
        if (!print?.file?.url) return acc;
        return acc + (print.cartParams?.price ?? 0);
    }, 0);
};

export const itemMissingPreview = (_elem: ICartOrderElement): boolean => false;

export const orderMissingPreview = (_order?: Array<ICartOrderElement>): boolean => false;

export const cartSummaryFunc = (order: Array<ICartOrderElement>): number => {
    const totalCartPrice = order?.reduce((acc, elem) => {
        const itemQty = elem.item.sizes.reduce((sizesAcc, size) => sizesAcc + size.userQty!, 0);
        const textileTotalPrice = itemQty * elem.item.price;
        const printsTotalPrice = itemPrintUnitPrice(elem) * itemQty;

        return acc + textileTotalPrice + printsTotalPrice;
    }, 0)

    return totalCartPrice;
}

const positionTotal = (elem: ICartOrderElement): number => {
    const qty = elem.item.sizes.reduce((acc, size) => acc + (size.userQty ?? 0), 0);
    return (elem.item.price + itemPrintUnitPrice(elem)) * qty;
};

/** Промокод на позицию: 'all' (или пусто) — на все, иначе совпадение с типом, _id или slug изделия. */
const promoCoversItem = (elem: ICartOrderElement, discountedItem: string): boolean =>
    !discountedItem || discountedItem === 'all' || [elem.item.type, elem.item._id, elem.item.slug].includes(discountedItem);

/**
 * Суммы заказа для экрана и для бэкенда. Бэкенд берёт их из заказа как есть (чек ЮKassa, сделка в Битриксе):
 * промокод 'freeShipping' обнуляет доставку, остальные умножают цену своих позиций на discount_ratio.
 */
export const orderPricing = (cart: TCartState) => {
    const order = cart.order ?? [];
    const promo = cart.validPromoCode;
    const total = cartSummaryFunc(order);
    const freeShipping = Boolean(promo.name) && promo.mechanic === 'freeShipping';
    const discounted = !promo.name || freeShipping
        ? total
        : Math.round(order.reduce((sum, elem) => sum + positionTotal(elem) * (promoCoversItem(elem, promo.discounted_item) ? promo.discount_ratio : 1), 0));
    const shipping = cart.isDelivery && !freeShipping ? cart.deliveryParams.deliveryPrice : 0;
    return { total, discounted, shipping, freeShipping };
};

export const orderHasPrints = (order: Array<ICartOrderElement> | undefined): boolean => {
    if (!order) return false;
    return order.some((elem) => elem.prints && getPreviewArrFunc(elem.prints).length > 0);
}

export const packagesWeightCalcFunc = (order: Array<ICartOrderElement>): Array<{weight: number}> => {
    const orderWeightArr = order.map((elem) => {
        const qty = elem.item.sizes.reduce((acc, curr) => (acc + curr.userQty!), 0)
        return {
            weight: elem.item.shippingParams.weight * qty
        }
    })

    return orderWeightArr;
}
export const checkoutOrderObjectCreateFunc = (cart: TCartState, roistat: string) => {

    const { order, validPromoCode, deliveryParams, userData, isDelivery } = cart;

    const pricing = orderPricing(cart);
    const nick = telegramNick(userData.telegram) ?? '';
    const name = `${userData.surname} ${userData.name}`;
    // Бэкенд каталога не хранит ник отдельно — дописываем к имени, чтобы менеджер видел его в Битриксе и письме.
    // Имя там до 40 знаков (длиннее — заказ не сохранится), поэтому без ника, если не помещается.
    const nameWithNick = `${name} · ${nick}`;

    let data: IOrderBody = {
        order_total_price: pricing.total,
        order_discounted_price: pricing.discounted,
        order_promocode: validPromoCode,
        owner_name: nick && nameWithNick.length <= 40 ? nameWithNick : name,
        owner_phone: userData.phone.substring(1, userData.phone.length),
        owner_email: userData.email,
        owner_telegram: nick,
        order_key: uuidv4(),
        items: [],
        isShipping: isDelivery,
        shipping_city: deliveryParams.validCityTo,
        shipping_point: deliveryParams.validDeliveryPoint,
        shipping_price: pricing.shipping,
        packages: [],
        roistat
      };

    order?.forEach((elem) => {
        let itemToAdd: TUserOrderItem = elem.item;
        //@ts-ignore
        const sizesToString = () => {
            let sizeString = '';
            elem.item.sizes.forEach((size) => {
                if (size.userQty! > 0) {
                    sizeString += `,размер:${size.name}`;
                }
            })

            sizeString += '.';
            return sizeString;
        }
        const stringSizes = sizesToString();
        const itemQty = elem.item.sizes.reduce((acc, { userQty }) => (acc + userQty!), 0); 
        
        const printPrice = itemPrintUnitPrice(elem) * itemQty;
        const prints = (elem.prints ?? [])
            .filter((print) => print.file?.url)
            .map((print) => ({
                file: print.file!.url,
                name: print.file!.name,
                size: print.cartParams?.size ?? "",
                format: print.cartParams?.format ?? "",
                price: print.cartParams?.price ?? 0,
            }));
            itemToAdd = {
                ...itemToAdd,
                textile: elem.item.name.concat(stringSizes),
                item_price: printPrice + (itemQty * elem.item.price),
                printPrice: printPrice,
                qty: elem.item.sizes,
                qtyAll: itemQty,
                front_print: "",
                back_print: "",
                lsleeve_print: "",
                rsleeve_print: "",
                prints,
            }
            data.items.push(itemToAdd)
            data.packages.push({
                height: '10',
                length: '10',
                weight: '1000',
                width: '10',
              });
    })  


    return data;

}

/**
 * допы
 * item_price - полноя стоимость айтема
 * printPrice - стоимость принтов айтема
 * qty - то же что и sizes (выбранные размеры)
 * qtyAll - общее количество текстиля
 * back_print, front_print и тд - строка с кратким описанием печати
 * textile - название и размеры
 */