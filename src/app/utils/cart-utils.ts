import { ICartOrderElement, IPrintFile, ICdekCitySearchResponse, ICdekPointsResponse, TUserOrderItem, IOrderBody } from "./types"
import { TCartState } from "@/redux/cart-slice/cart.slice";
import { v4 as uuidv4 } from 'uuid';

export const getPreviewArrFunc = (prints: {
    front: IPrintFile, back: IPrintFile, lsleeve: IPrintFile, rsleeve: IPrintFile 
}): Array<IPrintFile> => {
    const previewArr = [];

    prints?.front?.preview && previewArr.push(prints.front);
    prints?.back?.preview && previewArr.push(prints.back);
    prints?.lsleeve?.preview && previewArr.push(prints.lsleeve);
    prints?.rsleeve?.preview && previewArr.push(prints.rsleeve);

    return previewArr;
}


export const ruPrintPlace = (format: string): string => {
    
    const ruFormat = format === 'front' ? 'Грудь'
    : format === 'back' ? 'Спина'
    : format === 'lsleeve' ? 'Л. рукав'
    : format === 'rsleeve' ? 'П. рукав' : '';

    return ruFormat;
}


export const cartSummaryFunc = (order: Array<ICartOrderElement>): number => {
    const totalCartPrice = order?.reduce((acc, elem) => {
        const itemQty = elem.item.sizes.reduce((sizesAcc, size) => sizesAcc + size.userQty!, 0);
        const textileTotalPrice = itemQty * elem.item.price;
        const printsToArr = getPreviewArrFunc(elem.prints!);
        const printsTotalPrice = printsToArr.reduce((printsAcc, print) => printsAcc + print.cartParams?.price!, 0) * itemQty;

        return acc + textileTotalPrice + printsTotalPrice;
    }, 0)

    return totalCartPrice;
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
export const checkoutOrderObjectCreateFunc = (cart: TCartState) => {

    const { order, validPromoCode, deliveryParams, userData, isDelivery } = cart;

    const orderTotalPrice = cartSummaryFunc(order!);

    let data: IOrderBody = {
        order_total_price: orderTotalPrice,
        order_discounted_price: orderTotalPrice,
        order_promocode: validPromoCode,
        owner_name: `${userData.surname} ${userData.name}`,
        owner_phone: userData.phone.substring(1, userData.phone.length),
        owner_email: userData.email,
        order_key: uuidv4(),
        items: [],
        isShipping: isDelivery,
        shipping_city: deliveryParams.validCityTo,
        shipping_point: deliveryParams.validDeliveryPoint,
        shipping_price: deliveryParams.deliveryPrice,
        packages: [],
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
        
        const printPriceF = () => {
            let price = 0;
            if (elem.prints) {
                price = elem.prints?.front?.cartParams ?  elem.prints.front.cartParams.price : 0;
                price = elem.prints?.back?.cartParams ?  elem.prints.back.cartParams.price : 0;
                price = elem.prints?.lsleeve?.cartParams ?  elem.prints.lsleeve.cartParams.price : 0;
                price = elem.prints?.rsleeve?.cartParams ?  elem.prints.rsleeve.cartParams.price : 0;
            }
            return price;
        }

        const printToStringF = (print: IPrintFile | undefined, title: string) => {
            if (print) {
                return `${title}. Файл: ${print.file?.url}, Превью: ${print.preview}; Размер: ${print.cartParams?.size}`;
            } else {
                return '';
            }
        } 
        const printPrice = printPriceF() * itemQty;
            itemToAdd = {
                ...itemToAdd,
                textile: elem.item.name.concat(stringSizes),
                item_price: printPrice + (itemQty * elem.item.price),
                printPrice: printPrice,
                qty: elem.item.sizes,
                qtyAll: itemQty,
                front_print: printToStringF(elem.prints?.front, 'Печать на груди'),
                back_print: printToStringF(elem.prints?.back, 'Печать на спине'),
                lsleeve_print: printToStringF(elem.prints?.lsleeve, 'Печать на левом рукаве'),
                rsleeve_print: printToStringF(elem.prints?.rsleeve, 'Печать на правом рукаве'),
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