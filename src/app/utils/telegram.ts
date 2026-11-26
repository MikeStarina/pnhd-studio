/**
 * Ник в Telegram в виде «@nick» или null, если это не ник. Принимаем, как люди его вставляют:
 * с «@», без него или ссылкой на профиль (t.me/nick). Правила Telegram: 5–32 знака, латиница, цифры и _, первая — буква.
 */
export const telegramNick = (value: string): string | null => {
  const nick = value.trim().replace(/^(https?:\/\/)?(www\.)?(t|telegram)\.me\//i, '').replace(/^@/, '');
  return /^[a-z][a-z0-9_]{4,31}$/i.test(nick) ? `@${nick}` : null;
};
