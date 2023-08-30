import React, { useEffect, useState } from 'react';
import styles from './ConstructorFilter.module.css';
import { SquareCircle } from '../../ui/icons/squareCircle';
import { Circle } from '../../ui/icons/circle';
import { Square } from '../../ui/icons/square';
import { setFilterCoords } from '../../utils/utils';

function ConstructorFilter(props) {
  const {
    initialFilterCoords,
    // openSquare,
    squareMask,
    onChangeFilter,
    // openCircle,
    circleMask,
    closeButtonVisibilityCircleSquare,
    closeButtonVisibilityOpenCircleSquare,
    getButtonVisibilityCircle,
    getButtonVisibilitySquare,
  } = props;
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [mainSquareCircleComponentColor, setMainSquareCircleComponentColor] = useState(false);
  const openCircle = initialFilterCoords ? initialFilterCoords.openCircle : false;
  const openSquare = initialFilterCoords ? initialFilterCoords.openSquare : false;

  const toggle = () => {
    if (circleMask || openCircle || openSquare || squareMask) {
      closeButtonVisibilityCircleSquare();
      closeButtonVisibilityOpenCircleSquare();
      onChangeFilter({
        ...initialFilterCoords,
        positionX: 0,
        positionY: 0,
        openSquare: false,
        openCircle: false,
      });
    } else {
      setDropdownVisible((dropdownVisible) => !dropdownVisible);
    }
  };

  const handleItemSelectClick = (e, type) => {
    e.stopPropagation();
    if (type.includes('circle')) {
      getButtonVisibilityCircle();
    }
    if (type.includes('square')) {
      getButtonVisibilitySquare();
    }
    setDropdownVisible(false);
  };

  useEffect(() => {}, [dropdownVisible]);

  return (
    <div className={styles.wrap}>
      <div
        onMouseEnter={() => setMainSquareCircleComponentColor(true)}
        onMouseLeave={() => setMainSquareCircleComponentColor(false)}
        className={
          dropdownVisible || circleMask || openCircle || openSquare || squareMask ? `${styles.dropdown_container} ${styles.dropdown_container_selected}` : `${styles.dropdown_container}`
        }
      >
        <div onClick={() => toggle()} className={styles.dropdown_input}>
          <div className={styles.dropdown_item_wrapper}>
            <div className={styles.dropdown_selected_value}>
              <SquareCircle className={styles.btn_svg} style={{ color: dropdownVisible || openCircle || circleMask || openSquare || squareMask || mainSquareCircleComponentColor ? '#00ff00' : '#ffffff' }} />
            </div>
            <div className={styles.dropdown_tools} />
          </div>
          {dropdownVisible && (
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
                // key={option.category}
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
