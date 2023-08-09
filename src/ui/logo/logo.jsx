import styles from './logo.module.css';
import logoCdek from '../../images/logo.png';

function LogoCdek({ className = '' }) {
  const extClassName = className || '';
  return <img className={`${styles.logo} ${extClassName}`} src={logoCdek} alt="Логотип сдек" />;
}

export default LogoCdek;
