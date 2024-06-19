const TelegramBot = require('node-telegram-bot-api');

// Inicializa o bot do Telegram
const initBot = (token) => {
  if (!token) {
    console.error("Telegram Bot Token not provided!");
    process.exit(1);
  }

  const bot = new TelegramBot(token, { polling: true });

  // Handler para o comando /start
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.chat.first_name || 'usuário';

    bot.sendMessage(chatId, `Olá, ${firstName}! Seu chat ID é ${chatId}.`);

    // Opcional: Log do chatId para o console ou armazenamento em banco de dados
    console.log(`Usuário ${firstName} iniciou o bot. chatId: ${chatId}`);
  });

  return bot;
};

module.exports = initBot;
