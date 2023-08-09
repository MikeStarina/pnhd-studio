import styles from './moto.module.css';
import moto from '../../images/moto.png';

function Moto({ className = '' }) {
  const extClassName = className || '';
  return <img className={`${styles.moto} ${extClassName}`} src={moto} alt="Мотоцикл" />;
}

export default Moto;
