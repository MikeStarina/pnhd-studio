import { v4 as uuidv4 } from 'uuid';

const addToMemory = (variant, order, item, uuId, front_file, front_file_preview, back_file, back_file_preview, lsleeve_file, lsleeve_file_preview, rsleeve_file, rsleeve_file_preview, badge_file) => {
  window.dataLayer.push({
    ecommerce: {
      currencyCode: 'RUB',
      add: {
        products: [
          {
            id: item._id,
            name: item.name,
            price: item.price,
            size: order,
            category: item.category,
            variant,
          },
        ],
      },
    },
  });

  const data = {
    attributes: { ...item },
    cart_item_id: uuId,
  };
  data.attributes.size = order;
  data.attributes.key = uuidv4();

  data.print = {
    front: front_file,
    front_preview: front_file_preview,
    back: back_file,
    back_preview: back_file_preview,
    lsleeve: lsleeve_file,
    lsleeve_preview: lsleeve_file_preview,
    rsleeve: rsleeve_file,
    rsleeve_preview: rsleeve_file_preview,
    badge: badge_file,
  };

  return data;
};

export default addToMemory;
