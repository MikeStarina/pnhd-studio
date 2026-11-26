'use client';
import { useId, useState } from 'react';
import { PRINT_FILES, PRINT_FILES_ACCEPT, printFileProblem } from '../config/print-files';
import { Icon } from './icons';
import st from './printFiles.module.css';

const size = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} КБ` : `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} МБ`;

/**
 * Поле «Файлы для печати»: клиент прикладывает свои макеты (PDF, AI, PSD…), они уходят в сделку вместе с заявкой.
 * Неподходящие файлы не добавляются — под полем пишется почему.
 */
export function PrintFilesField({ files, onChange, disabled, inputId, error }: {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
  /** id поля выбора: по нему оформление ставит фокус на первое неверное поле */
  inputId?: string;
  /** Файлы обязательны, а их нет — текст ошибки под полем */
  error?: string;
}) {
  const id = useId();
  const [problems, setProblems] = useState<string[]>([]);
  const [over, setOver] = useState(false);
  const message = [error && !files.length ? error : '', ...problems].filter(Boolean);

  const add = (picked: File[]) => {
    const found = picked.map(printFileProblem).filter(Boolean);
    const fresh = picked.filter((f) => !printFileProblem(f) && !files.some((x) => x.name === f.name && x.size === f.size));
    const room = PRINT_FILES.maxCount - files.length;
    if (fresh.length > room) found.push(`Не больше ${PRINT_FILES.maxCount} файлов — остальные пришли менеджеру ссылкой`);
    setProblems(found);
    if (fresh.length && room > 0) onChange([...files, ...fresh.slice(0, room)]);
  };

  return (
    <div className={st.root}>
      <label
        className={st.drop} data-over={over || undefined} data-disabled={disabled || undefined}
        data-invalid={(error && !files.length) || undefined}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); if (!disabled) add(Array.from(e.dataTransfer.files)); }}
      >
        <input
          id={inputId} className={st.input} type="file" multiple accept={PRINT_FILES_ACCEPT} disabled={disabled}
          aria-invalid={Boolean(error && !files.length)}
          aria-describedby={`${id}-hint${message.length ? ` ${id}-err` : ''}`}
          onChange={(e) => { add(Array.from(e.target.files ?? [])); e.target.value = ''; }}
        />
        <Icon name="upload" size={24} />
        <span className={st.text}>
          <span className={st.title}>Приложить файлы для печати</span>
          <span id={`${id}-hint`} className={st.hint}>
            PDF, AI, PSD, EPS, CDR, TIFF, PNG, JPG, SVG, ZIP — до {PRINT_FILES.maxCount} файлов по {PRINT_FILES.maxMb} МБ
          </span>
        </span>
      </label>
      {files.length > 0 && (
        <ul className={st.list} aria-label="Приложенные файлы">
          {files.map((f, i) => (
            <li key={`${f.name}-${f.size}`} className={st.item}>
              <span className={st.name}>{f.name}</span>
              <span className={st.size}>{size(f.size)}</span>
              <button
                type="button" className={st.remove} disabled={disabled} aria-label={`Убрать ${f.name}`} title="Убрать"
                onClick={() => onChange(files.filter((_, j) => j !== i))}
              >
                <Icon name="close" size={18} />
              </button>
            </li>
          ))}
        </ul>
      )}
      {message.length > 0 && (
        <p id={`${id}-err`} className={st.error} role="alert">{message.join('. ')}</p>
      )}
    </div>
  );
}
