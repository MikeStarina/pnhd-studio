import React, { useEffect } from 'react';
import filterCircle from '../images/icons/filter-ellipse.svg';
import styles from './filter-select.module.css';

function FilterSelect(props) {
  const {
    defaultValue,
    options,
    onChange,
    count,
    dropdownVisible,
    setFilterVisible,
    setAdress,
  } = props;

  const toggle = () => {
    if (dropdownVisible === true) {
      setFilterVisible('close');
    }
    if (dropdownVisible === false) {
      setFilterVisible(defaultValue);
    }
  };

  const handleItemSelectClick = (option) => {
    onChange(option);
    setAdress();
    setFilterVisible('close');
  };

  useEffect(() => {}, [options, dropdownVisible]);
  return (
    <div className={styles.wrap}>
      <div
        className={
          count !== 0
            ? `${styles.dropdown_container} ${styles.dropdown_container_selected}`
            : `${styles.dropdown_container}`
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
            <div className={styles.dropdown_selected_value}>{defaultValue}</div>
            <div className={styles.dropdown_tools} />
          </div>
          {dropdownVisible && (
            <div className={styles.dropdown_menu}>
              {options.length > 0 &&
                options.map((option) => (
                  <div
                    className={styles.dropdown_item}
                    onClick={() => {
                      handleItemSelectClick(option);
                    }}
                    onKeyDown={() => {
                      handleItemSelectClick(option);
                    }}
                    key={option.category}
                    role="button"
                    tabIndex="0"
                  >
                    {option.selected ? (
                      <>
                        <img src={filterCircle} alt="выбранный_элемент" />
                        <span>{option.category}</span>
                      </>
                    ) : (
                      <span className={styles.dropdown_item_space}>
                        {option.category}
                      </span>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FilterSelect;
