/** Пункт самовывоза: показывается в заявке, если клиент не выбрал доставку. */
export const PICKUP = {
  place: 'Pinhead Studio',
  address: 'Санкт-Петербург, ул. Чапыгина, 1',
  metro: 'м. Петроградская',
} as const;

export const pickupLine = () => `${PICKUP.place}, ${PICKUP.address} (${PICKUP.metro})`;
