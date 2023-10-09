import React, { useState, useEffect } from 'react';
import useViewOnClick from '../../hooks/useViewOnClick';
import styles from './shipping-select.module.css';

function ShippingSelect(props) {
  const {
    defaultValue,
    options,
    onChange,
    editValue,
    errBorder,
  } = props;
  const [selectedValue, setSelectedValue] = useState(null);
  const { toggle, isOpen } = useViewOnClick();
  const getSelectValue = () => {
    if (editValue != null) {
      return editValue.name;
    }
    return defaultValue;
  };

  const handleItemSelectClick = (option) => {
    setSelectedValue(option);
    onChange(option);
  };

  useEffect(() => {}, [options]);
  return (
    <div className={styles.test}>
      <div
        className={
          !errBorder
            ? `${styles.dropdown_container} ${styles.dropdown_container_error}`
            : styles.dropdown_container
        }
      >
        <div
          onClick={toggle}
          onKeyDown={toggle}
          className={styles.dropdown_input}
          role="button"
          tabIndex="0"
        >
          <div className={styles.dropdown_item_wrapper}>
            <div className={styles.dropdown_selected_value}>
              {getSelectValue()}
            </div>
            <div className={styles.dropdown_tools} />
          </div>
          {isOpen && (
            <div className={styles.dropdown_menu}>
              {options.length === 0 && (
                <div className={styles.dropdown_item}>
                  <p>Пункты выдачи не найдены</p>
                </div>
              )}

              {options.length > 0 &&
                options.map((option) => (
                  <div
                    className={`${styles.dropdown_item} ${
                      selectedValue === option.name ? 'selected' : ''
                    }`}
                    onClick={() => {
                      handleItemSelectClick(option);
                    }}
                    onKeyDown={() => {
                      handleItemSelectClick(option);
                    }}
                    key={option.name}
                    role="button"
                    tabIndex="0"
                  >
                    {option.name}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ShippingSelect;
