import React, { useState } from "react";
import { useEffect } from "react";
import { useViewOnClick } from "../../hooks/useViewOnClick";
import styles from './filter-select.module.css';

const FilterSelect = (props) => {
  const {
    defaultValue,
    options,
    onChange,
    extraClass = "",
    editValue,
    errBorder,
  } = props;
  const [selectedValue, setSelectedValue] = useState(null);
  const { toggle, isOpen } = useViewOnClick();
  const getSelectValue = () => {
    if (editValue != null) {      
      return editValue;
    }
    return defaultValue;
  };

  const handleItemSelectClick = (option) => {
    setSelectedValue(option.category);
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
        <div onClick={toggle} className={styles.dropdown_input}>
          
        <div className={styles.dropdown_item_wrapper}>
          <div className={styles.dropdown_selected_value}>
            {getSelectValue()}
          </div>
          <div className={styles.dropdown_tools}></div>          
          </div>
          {isOpen && (
            <div className={styles.dropdown_menu}>
              {options.length === 0 && (
                  <div className={styles.dropdown_item}>
                    <p>Категории не найдены</p>
                  </div>
              )}

              {options.length > 0 &&
                options.map((option) => (
                  <div
                    className={`${styles.dropdown_item} ${
                      selectedValue === option.name ? "selected" : ""
                    }`}
                    onClick={() => {
                      handleItemSelectClick(option.category);
                    }}
                    key={option.category}
                  >
                    {option.category}
                  </div>
                ))}             
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterSelect;