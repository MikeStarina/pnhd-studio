import React, { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { useViewOnClick } from "../../hooks/useViewOnClick";
import filterCircle from '../../components/images/icons/filter-ellipse.svg'
import styles from "./filter-select.module.css";

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
  const { firstCount } = useSelector((store) => store.shopData);
  const { toggle, isOpen } = useViewOnClick();
  const getSelectValue = () => {
    if (editValue != null) {
      return editValue;
    }
    return defaultValue;
  };

  const handleItemSelectClick = (option) => {
    setSelectedValue(option.categorySelect);
    onChange(option);
  };

  useEffect(() => {}, [options]);
  return (
    <div className={styles.test}>
      <div className={firstCount!=0?`${styles.dropdown_container} ${styles.dropdown_container_selected}`:`${styles.dropdown_container}`}>
        <div onClick={toggle} className={styles.dropdown_input}>
          <div className={styles.dropdown_item_wrapper}>
            <div className={styles.dropdown_selected_value}>
              {getSelectValue()}
            </div>
            <div className={styles.dropdown_tools}></div>
          </div>
          {isOpen && (
            <div className={styles.dropdown_menu}>
              {options.length > 0 &&
                options.map((option) => (
                 
                  <div
                    className={`${styles.dropdown_item}`}
                    onClick={() => {
                      handleItemSelectClick(option);
                    }}
                    key={option.categorySelect}
                  >
                    {option.selected?<><img src={filterCircle} alt="выбранный_элемент" /><span>{option.categorySelect}</span></>:<span className={styles.dropdown_item_space}>{option.categorySelect}</span>} 
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
