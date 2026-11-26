/** При старте сервера запускаем повторную отправку заявок: иначе недоставленные ждали бы первой новой заявки. */
export async function register() {
  // Условие именно в такой форме: сборка для edge выбрасывает этот импорт, а в нём модули Node (fs, crypto).
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { ensureRetryLoop } = await import('@/app/api/orders/_lib/deliver');
    ensureRetryLoop();
  }
}
