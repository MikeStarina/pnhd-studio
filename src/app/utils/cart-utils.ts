import { ICartOrderElement, IPrintFile, ICdekCitySearchResponse, ICdekPointsResponse, TUserOrderItem, IOrderBody } from "./types"
import { TCartState } from "@/redux/cart-slice/cart.slice";
import { v4 as uuidv4 } from 'uuid';

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

    const orderTotalPrice = cartSummaryFunc(order!);

    let data: IOrderBody = {
        order_total_price: orderTotalPrice,
        order_discounted_price: validPromoCode.name ? orderTotalPrice * validPromoCode.discount_ratio : orderTotalPrice,
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