import styles from './ProductContent.module.css';

function ProductContent(item) {
  return (
    <div className={styles.product_box}>
      <div className={styles.description}>
        <div>
          <h1>{item.name}</h1>
          <p>&#8213; {item.price}</p>
        </div>
        <p className={styles.text}>
          Универсальный солдат. Унисекс футболка прямого кроя с широким размерным рядом. Подойдет,
          как для мужчин, так и для женщин.
        </p>
      </div>
    </div>
  );
}

export default ProductContent;
