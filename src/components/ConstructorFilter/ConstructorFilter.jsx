import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styles from './ConstructorFilter.module.css';
import SquareCircle from '../../ui/icons/squareCircle';
import Circle from '../../ui/icons/circle';
import Square from '../../ui/icons/square';
import { getSize } from '../../services/actions/editor-actions';

function ConstructorFilter(props) {
  const {
    dropdownVisibleFilter,
    setDropdownVisibleFilter,
    onOpenFilter,
    initialText,
    initialFilterCoords,
    initialImageCoords,
    activeView,
    itemColor,
    file,
    squareMask,
    onChangeFilter,
    circleMask,
    closeButtonVisibilityCircleSquare,
    closeButtonVisibilityOpenCircleSquare,
    getButtonVisibilityCircle,
    getButtonVisibilitySquare,
  } = props;
  const dispatch = useDispatch();
  const [mainSquareCircleComponentColor, setMainSquareCircleComponentColor] = useState(false);
  const openCircle = initialFilterCoords ? initialFilterCoords.openCircle : false;
  const openSquare = initialFilterCoords ? initialFilterCoords.openSquare : false;

  const toggle = () => {
    if (circleMask || openCircle || openSquare || squareMask) {
      dispatch(getSize(initialImageCoords, activeView, itemColor, initialText));
      closeButtonVisibilityCircleSquare();
      closeButtonVisibilityOpenCircleSquare();
      onChangeFilter({
        ...initialFilterCoords,
        positionX: 0,
        positionY: 0,
        openSquare: false,
        openCircle: false,
        openMask: false,
      });
    } else {
      setDropdownVisibleFilter((dropdownVisibleFilter) => !dropdownVisibleFilter);
      onOpenFilter(initialImageCoords, activeView, initialText);
    }
  };

  const handleItemSelectClick = (e, type) => {
    e.stopPropagation();
    if (file) {
      if (type.includes('circle')) {
        getButtonVisibilityCircle();
        onChangeFilter(initialImageCoords, initialText, {
          ...initialFilterCoords,
          openMask: true,
        });
      }
      if (type.includes('square')) {
        getButtonVisibilitySquare();
        onChangeFilter(initialImageCoords, initialText, {
          ...initialFilterCoords,
          openMask: true,
        });
      }
      setDropdownVisibleFilter(false);
    }
  };

  useEffect(() => {}, [dropdownVisibleFilter]);

  return (
    <div className={styles.wrap}>
      <div
        onMouseEnter={() => setMainSquareCircleComponentColor(true)}
        onMouseLeave={() => setMainSquareCircleComponentColor(false)}
        className={
          dropdownVisibleFilter || circleMask || openCircle || openSquare || squareMask ? `${styles.dropdown_container} ${styles.dropdown_container_selected}` : `${styles.dropdown_container}`
        }
      >
        <div onClick={() => toggle()} className={styles.dropdown_input}>
          <div className={styles.dropdown_item_wrapper}>
            <div className={styles.dropdown_selected_value}>
              <SquareCircle className={styles.btn_svg} style={{ color: dropdownVisibleFilter || openCircle || circleMask || openSquare || squareMask || mainSquareCircleComponentColor ? '#00ff00' : '#ffffff' }} />
            </div>
            <div className={styles.dropdown_tools} />
          </div>
          {dropdownVisibleFilter && (
            <div className={styles.dropdown_menu}>
              <div
                className={styles.dropdown_item}
                onClick={(e) => handleItemSelectClick(e, 'circle')}
              >
                <Circle className={styles.btn_svg} />
              </div>
              <div
                className={styles.dropdown_item}
                onClick={(e) => handleItemSelectClick(e, 'square')}
              >
                <Square className={styles.btn_svg} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConstructorFilter;
