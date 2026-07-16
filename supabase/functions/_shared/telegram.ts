/**
 * Optional Telegram alerts for signup risk watch / auto-ban events.
 */

/**
 * @param {string} message
 */
export async function sendTelegramAlert(message) {
  const token = Deno.env.get('TELEGRAM_BOT_TOKEN');
  const chatId = Deno.env.get('TELEGRAM_CHAT_ID');

  if (!token || !chatId) {
    return;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          disable_web_page_preview: true,
        }),
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!response.ok) {
      const body = await response.text();
      console.error('telegram: send failed', response.status, body);
    }
  } catch (error) {
    console.error('telegram: send error', error);
  }
}
