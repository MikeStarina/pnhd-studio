'use client';
import { SIZE_CHART } from '../config/size-chart';
import s from './constructor.module.css';
import { useDismiss } from './useDismiss';

/** Модалка с таблицей обмеров. Показываем строки только тех размеров, что есть у выбранного цвета. */
export function SizeChart({ sizes, onClose }: { sizes: string[]; onClose: () => void }) {
  const { leaving, dismiss } = useDismiss();
  const close = () => dismiss(onClose);
  const rows = SIZE_CHART.filter((r) => !sizes.length || sizes.includes(r.size));
  return (
    <div className={s.modalBg} data-leaving={leaving || undefined} onClick={close}>
      <div className={s.modal} role="dialog" aria-label="Таблица размеров" onClick={(e) => e.stopPropagation()}>
        <h3>Таблица размеров</h3>
        <table className={s.chart}>
          <thead>
            <tr><th>Размер</th><th>Ширина по груди</th><th>Длина</th><th>Рукав</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.size}><th>{r.size}</th><td>{r.chest}</td><td>{r.length}</td><td>{r.sleeve}</td></tr>
            ))}
          </tbody>
        </table>
        <p className={s.muted}>Размеры в сантиметрах, замер изделия лёжа. Допуск ±1–2 см; у разных моделей крой отличается.</p>
        <button className={s.cta} onClick={close}>Понятно</button>
      </div>
    </div>
  );
}
