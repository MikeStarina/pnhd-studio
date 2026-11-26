import { PHOTO_SHAPES } from '../config/photo-shapes';
import type { PhotoShape } from '../model/types';
import styles from './shapes.module.css';

/** Выбор формы обрезки фото: «Без формы» и шесть контуров. */
export function ShapePicker({ value, onChange }: { value: PhotoShape | null; onChange: (s: PhotoShape | null) => void }) {
  return (
    <div className={styles.wrap} role="group" aria-label="Форма">
      <span className={styles.label}>Форма</span>
      <div className={styles.row}>
        <button
          type="button"
          className={styles.btn}
          title="Без формы"
          aria-label="Без формы"
          aria-pressed={value === null}
          onClick={() => onChange(null)}
        >
          <svg className={styles.icon} viewBox="0 0 100 100" aria-hidden="true">
            <rect x="6" y="6" width="88" height="88" rx="6" fill="none" stroke="currentColor" strokeWidth="8" />
          </svg>
        </button>
        {PHOTO_SHAPES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={styles.btn}
            title={s.label}
            aria-label={s.label}
            aria-pressed={value === s.id}
            onClick={() => onChange(s.id)}
          >
            <svg className={styles.icon} viewBox={`0 0 100 ${100 * s.aspect}`} aria-hidden="true">
              <path d={s.d} fill="currentColor" fillOpacity=".55" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
