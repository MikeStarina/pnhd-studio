import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useImage from 'use-image';
import styles from './ConstructorText.module.css';
import { WordT } from '../../ui/icons/wordT';
import { changeTextState, DELETE_FILE, getSize, textCostZero } from '../../services/actions/editor-actions';

function ConstructorText(props) {
  const {
    dropdownVisibleText,
    setDropdownVisibleText,
    itemColor,
    initialImageCoords,
    initialFilterCoords,
    onOpenText,
    initialText,
    activeView,
    file,
  } = props;
  const [mainSquareCircleComponentColor, setMainSquareCircleComponentColor] = useState(false);
  const dispatch = useDispatch();

  const [imageTwo] = useImage(file, 'Anonymous');

  const toggle = (e) => {
    e.stopPropagation();
    if (!dropdownVisibleText && !initialText) {
      setDropdownVisibleText((dropdownVisibleText) => true);
      onOpenText(initialImageCoords, activeView, initialFilterCoords);
    }
    if (dropdownVisibleText) {
      setDropdownVisibleText((dropdownVisible) => false);
    }
    if (!dropdownVisibleText && initialText?.openText) {
      dispatch(changeTextState({
        ...initialText,
        openText: false,
      }, activeView));
      if (!imageTwo) {
        dispatch({
          type: DELETE_FILE,
          view: activeView,
        });
      } else {
        dispatch(textCostZero(activeView));
      }
    }
    if (!dropdownVisibleText && (initialText && !initialText.openText)) {
      setDropdownVisibleText((dropdownVisibleText) => true);
      onOpenText(initialImageCoords, activeView, initialFilterCoords);
    }
  };

  const handleItemSelectClick = (e, type) => {
    e.stopPropagation();
  };

  useEffect(() => {}, [dropdownVisibleText]);

  return (
    <div className={styles.wrap}>
      <div
        onMouseEnter={() => setMainSquareCircleComponentColor(true)}
        onMouseLeave={() => setMainSquareCircleComponentColor(false)}
        className={
          dropdownVisibleText || (initialText && initialText.openText) ? `${styles.dropdown_container} ${styles.dropdown_container_selected}` : `${styles.dropdown_container}`
        }
      >
        <div onClick={(e) => toggle(e)} className={styles.dropdown_input}>
          <div className={styles.dropdown_item_wrapper}>
            <div className={styles.dropdown_selected_value}>
              <WordT className={styles.btn_svg} />
            </div>
            <div className={styles.dropdown_tools} />
          </div>
          {dropdownVisibleText && (
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
                      dispatch(getSize(initialText, activeView, itemColor));
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
