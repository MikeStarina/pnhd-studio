import styles from './Button.module.css';

function Button({ children, className = '', onClickTo, type = 'empty' }) {
  const extClassName = className || '';
  return (
    <>
      {type === 'empty' && (
      <button className={`${styles.button} ${extClassName}`} onClick={onClickTo}>
        {children}
      </button>
      )}
      {type === 'callback' && (
      <button className={`${styles.button_callback} ${extClassName}`} onClick={onClickTo}>
        {children}
      </button>
      )}
      {
        type === 'transparent' && (
          <button className={`${styles.button_transparent} ${extClassName}`} onClick={onClickTo}>
            {children}
          </button>
        )
      }
    </>
  );
}

export default Button;
