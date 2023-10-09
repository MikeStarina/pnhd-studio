import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import useImage from 'use-image';
import styles from './ConstructorText.module.css';
import WordT from '../../ui/icons/wordT';
import {
  changeTextState,
  DELETE_FILE,
  getSize,
  textCostZero,
} from '../../services/actions/editor-actions';

function ConstructorText(props) {
  const {
    dropdownVisibleText,
    setDropdownVisibleText,
    itemColor,
    initialImageCoords,
    initialFilterCoords,
    onOpenText,
    onCloseText,
    initialText,
    activeView,
    file,
  } = props;
  const dispatch = useDispatch();
  const [imageTwo] = useImage(file, 'Anonymous');
  const toggle = (e) => {
    e.stopPropagation();
    if (!dropdownVisibleText && !initialText) {
      setDropdownVisibleText(true);
      onOpenText(initialImageCoords, activeView, initialFilterCoords);
    }
    if (dropdownVisibleText) {
      setDropdownVisibleText(false);
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
        onCloseText(initialImageCoords, initialFilterCoords);
      }
    }
    if (!dropdownVisibleText && (initialText && !initialText.openText)) {
      setDropdownVisibleText(true);
      onOpenText(initialImageCoords, activeView, initialFilterCoords);
    }
  };
  const handleItemSelectClick = (e) => {
    e.stopPropagation();
    // console.log('  Croissant One , Dela Gothic One  ');
  };
  useEffect(() => {
  }, [dropdownVisibleText]);
  return (
    <div className={styles.wrap}>
      <div
        className={
          dropdownVisibleText || (initialText && initialText.openText)
            ? `${styles.dropdown_container} ${styles.dropdown_container_selected}`
            : `${styles.dropdown_container}`
        }
      >
        <div
          onClick={(e) => toggle(e)}
          onKeyDown={(e) => toggle(e)}
          role="button"
          tabIndex="0"
          className={styles.dropdown_input}
        >
          <div className={styles.dropdown_item_wrapper}>
            <div className={styles.dropdown_selected_value}>
              <WordT className={styles.btn_svg} />
            </div>
            <div className={styles.dropdown_tools} />
          </div>
          {dropdownVisibleText && (
            <div
              className={styles.dropdown_menu}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={() => {}}
              role="button"
              tabIndex="0"
            >
              <div
                className={styles.dropdown_item}
              >
                <form
                  onClick={(e) => handleItemSelectClick(e)}
                  onKeyDown={() => {}}
                >
                  <label className={styles.dropdown_item_label} htmlFor="text">
                    Текст:
                    <input
                      id="text"
                      className={styles.input_text}
                      type="text"
                      onChange={(e) => {
                        dispatch(changeTextState({
                          ...initialText,
                          setText: e.target.value,
                        }, activeView));
                      }}
                      placeholder="Введите текст"
                    />
                  </label>
                </form>
              </div>
              <div
                className={styles.dropdown_item}
              >
                <form
                  onClick={(e) => handleItemSelectClick(e)}
                  onKeyDown={() => {}}
                >
                  <label className={styles.dropdown_item_label} htmlFor="font">
                    Шрифт:
                    <select
                      id="font"
                      className={styles.input_font_style}
                      value="Mous10"
                      onChange={() => {}}
                    >
                      <option>Mous1</option>
                      <option>Mous2</option>
                      <option>Mous3</option>
                      <option>Mous4</option>
                    </select>
                  </label>
                </form>
              </div>
              <div
                className={styles.dropdown_item}
              >
                <form
                  onClick={(e) => handleItemSelectClick(e)}
                  onKeyDown={() => {}}
                >
                  <label className={styles.dropdown_item_label} htmlFor="size">
                    Размер:
                    <input
                      id="size"
                      className={styles.input_color}
                      style={{ paddingLeft: 7 }}
                      type="number"
                      step={2}
                      min={10}
                      value={initialText.setSize}
                      onChange={(e) => {
                        dispatch(changeTextState({
                          ...initialText,
                          setSize: e.target.value * 1,
                        }, activeView));
                        dispatch(getSize(initialText, activeView, itemColor));
                      }}
                    />
                  </label>
                </form>
              </div>
              <div
                className={styles.dropdown_item}
              >
                <form
                  className={styles.form}
                  onClick={(e) => handleItemSelectClick(e)}
                  onKeyDown={() => {}}
                >
                  <label htmlFor="color" className={styles.dropdown_item_label}>
                    Цвет:
                    <input
                      id="color"
                      className={styles.input_color}
                      type="color"
                      value={initialText.setColor}
                      onChange={(e) => {
                        dispatch(changeTextState({
                          ...initialText,
                          setColor: e.target.value,
                        }, activeView));
                      }}
                    />
                  </label>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConstructorText;
