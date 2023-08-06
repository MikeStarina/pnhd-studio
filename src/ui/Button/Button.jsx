import styles from './Button.module.css';

function Button({ children, className = '', onClickTo }) {
  const extClassName = className || '';
  return (
    <button className={`${extClassName} ${styles.box} `} onClick={onClickTo}>
      {children}
    </button>
  );
}

export default Button;
