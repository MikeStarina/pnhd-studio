/* eslint-disable */
import React, { useState } from 'react';
import dtfCalcFunc from '../../utils/dtfCalcFunc';
import styles from './dtf-calc.module.css';

function DtfCalculator() {
  const [width, setWidth] = useState();
  const [height, setHeight] = useState();
  const [qty, setQty] = useState();

  const [printSize, setPrintSize] = useState();
  const [printOrientation, setPrintOrientation] = useState();
  const [filmPrice, setFilmPrice] = useState(0);
  const [printPrice, setPrintPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalFilmLength, setTotalFilmLength] = useState(0);
  const [error, setError] = useState('');
  console.log(error);

  const onSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (width && height && qty) {
      
      const result = dtfCalcFunc(width, height, qty);
      setPrintSize(result.printSize);
      setPrintOrientation(result.printOrientation);
      setFilmPrice(result.filmPrice);
      setPrintPrice(result.printPrice);
      setTotalPrice(result.totalPrice);
      setTotalFilmLength(result.filmTotalLength);
      setError(result.error);

      //e.target.reset();
      e.target.width.focus();

      return;
    } 
        
    
  };

  const onKeyDown = (e) => {
    
    if (e.key === 'Escape') {
        e.currentTarget.reset();
        setPrintSize('');
        setPrintOrientation('');
        setFilmPrice(0);
        setPrintPrice(0);
        setTotalPrice(0);
        setTotalFilmLength(0);
        setWidth(0);
        setHeight(0);
        setQty(0);

        e.currentTarget.width.focus();
    }

    
  };

  return (
    <section className={styles.screen} id="dtfcalc">
      <h4 className={styles.title}>
        <i>DTF</i> КАЛЬКУЛЯТОР
      </h4>
      <form className={styles.calc} onSubmit={onSubmit} onKeyDown={onKeyDown}>
        <label className={styles.input_label} htmlFor="width">Ширина (см.)</label>
          <input
            type="text"
            name="width"
            id="width"
            className={styles.input}
            onChange={(e) => setWidth(e.target.value)}
          />
        

        <label className={styles.input_label} htmlFor="length">Высота (см.)</label>
          <input
            type="text"
            name="length"
            id="length"
            className={styles.input}
            onChange={(e) => setHeight(e.target.value)}
          />
        

        <label className={styles.input_label} htmlFor="qty">Количество (шт.)</label>
          <input
            type="text"
            name="qty"
            id="qty"
            className={styles.input}
            onChange={(e) => setQty(e.target.value)}
          />
        

        <button className={styles.button} type="submit">
          Расчитать
        </button>
      </form>
      
      { !error ? (
      <div className={styles.calculations}>
        <div className={styles.calculations_wrapper}>
          <p className={styles.parameters}>
            Размер: {printSize}
          </p>
          <p className={styles.parameters}>
            Раскладка: {printOrientation}
          </p>
          <p className={styles.parameters}>
            Количество: {qty} шт.
          </p>
        </div>

        <div className={styles.calculations_wrapper}>
          <p className={styles.parameters}>
            Стоимость печати: {filmPrice} Р.
          </p>
          <p className={styles.parameters}>
            Стоимость переноса: {printPrice} Р.
          </p>
          <p className={styles.parameters}>
            Итоговая стоимость: {totalPrice} Р.
          </p>
        </div>
        <div className={styles.calculations_wrapper}>
          <h2 className={styles.calculations_result}>
            {totalFilmLength} м.
          </h2>
        </div>
      </div>
      ) : (
        <div className={styles.error_wrapper}>
            <p className={styles.error}>{error}</p>
        </div>
      )}
    </section>
  );
}

export default DtfCalculator;
