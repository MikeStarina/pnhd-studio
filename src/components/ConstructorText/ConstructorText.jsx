import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styles from './ConstructorText.module.css';
import { SquareCircle } from '../../ui/icons/squareCircle';
import { Circle } from '../../ui/icons/circle';
import { Square } from '../../ui/icons/square';
import { WordT } from '../../ui/icons/wordT';
import { changeTextState } from '../../services/actions/editor-actions';

function ConstructorText(props) {
  const {
    onOpenText,
    initialText,
    activeView,
    squareMask,
    // onChangeFilter,
    circleMask,
    closeButtonVisibilityCircleSquare,
    closeButtonVisibilityOpenCircleSquare,
    getButtonVisibilityCircle,
    getButtonVisibilitySquare,
  } = props;
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [mainSquareCircleComponentColor, setMainSquareCircleComponentColor] = useState(false);
  const dispatch = useDispatch();

  const toggle = (e) => {
    e.stopPropagation();
    if (!dropdownVisible && !initialText) {
      setDropdownVisible((dropdownVisible) => true);
      onOpenText(activeView);
    }
    if (dropdownVisible) {
      setDropdownVisible((dropdownVisible) => false);
    }
    if (!dropdownVisible && initialText?.openText) {
      dispatch(changeTextState({
        ...initialText,
        openText: false,
      }, activeView));
    }
    if (!dropdownVisible && (initialText && !initialText.openText)) {
      setDropdownVisible((dropdownVisible) => true);
      dispatch(changeTextState({
        ...initialText,
        openText: true,
      }, activeView));
    }
  };

  const handleItemSelectClick = (e, type) => {
    e.stopPropagation();
  };

  useEffect(() => {}, [dropdownVisible]);

  return (
    <div className={styles.wrap}>
      <div
        onMouseEnter={() => setMainSquareCircleComponentColor(true)}
        onMouseLeave={() => setMainSquareCircleComponentColor(false)}
        className={
          dropdownVisible || (initialText && initialText.openText) ? `${styles.dropdown_container} ${styles.dropdown_container_selected}` : `${styles.dropdown_container}`
        }
      >
        <div onClick={(e) => toggle(e)} className={styles.dropdown_input}>
          <div className={styles.dropdown_item_wrapper}>
            <div className={styles.dropdown_selected_value}>
              <WordT className={styles.btn_svg} />
            </div>
            <div className={styles.dropdown_tools} />
          </div>
          {dropdownVisible && (
            <div className={styles.dropdown_menu}>
              <div
                className={styles.dropdown_item}
              >
                <form onClick={(e) => handleItemSelectClick(e)}>
                  <input
                    type="color"
                    value={initialText.setColor}
                    onChange={(e) => {
                      dispatch(changeTextState({
                        ...initialText,
                        setColor: e.target.value,
                      }, activeView));
                    }}
                  />
                </form>
              </div>
              <div
                className={styles.dropdown_item}
              >
                <form onClick={(e) => handleItemSelectClick(e)}>
                  <input
                    type="text"
                    onChange={(e) => {
                      dispatch(changeTextState({
                        ...initialText,
                        setText: e.target.value,
                      }, activeView));
                    }}
                    placeholder="Введите текст"
                  />
                </form>
              </div>
              <div
                className={styles.dropdown_item}
              >
                <form onClick={(e) => handleItemSelectClick(e)}>
                  <input
                    type="number"
                    onChange={(e) => {
                      dispatch(changeTextState({
                        ...initialText,
                        setSize: e.target.value * 1,
                      }, activeView));
                    }}
                    placeholder={initialText.setSize}
                  />
                </form>
              </div>
              <div
                className={styles.dropdown_item}
              >
                <button
                    onClick={(e) => {
                      handleItemSelectClick(e);
                      dispatch(changeTextState({
                        ...initialText,
                        downText: !initialText.downText,
                      }, activeView));
                    }}
                >
                  под
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConstructorText;
