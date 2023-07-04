import React, {useState} from "react";
import { useViewOnClick } from "../../hooks/useViewOnClick";
import styles from './shipping-select.module.css'

export const ShippingSelect = (props) => {
const {
  defaultValue,
  options,
  onChange,
  extraClass = "",
  editValue,
  errBorder
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


return (
  <div className={styles.test}>
    <div className={!errBorder? `${styles.dropdown_container} ${styles.dropdown_container_error}`:styles.dropdown_container}>
    <div onClick={toggle} className={styles.dropdown_input}>
      <div className={styles.dropdown_selected_value}>{getSelectValue()}</div>
      <div className={styles.dropdown_tools}></div>
      {isOpen && (
        <div className={styles.dropdown_menu}>
          {options.map((option) => (
            <div
              className={`${styles.dropdown_item} ${
                selectedValue === option.name ? "selected" : ""
              }`}
              onClick={() => {
                handleItemSelectClick(option);
              }}
              key={option.name}
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