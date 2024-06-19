const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const dotenv = require('dotenv');
const swaggerSetup = require('./swagger');

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();
const port = 3000;

// Token do bot do Telegram
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Middleware para analisar JSON no corpo da requisição
app.use(express.json());

// Configurar Swagger
swaggerSetup(app);

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       required:
 *         - chatId
 *         - message
 *       properties:
 *         chatId:
 *           type: string
 *           description: ID do chat no Telegram
 *         message:
 *           type: string
 *           description: Mensagem a ser enviada
 */

/**
 * @swagger
 * /send-message:
 *   post:
 *     summary: Envia uma mensagem para um chat específico no Telegram
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Message'
 *     responses:
 *       200:
 *         description: Mensagem enviada com sucesso
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro ao enviar mensagem
 */
app.post('/send-message', (req, res) => {
  const { chatId, message } = req.body;

  if (!chatId || !message) {
    return res.status(400).send('chatId e message são necessários');
  }

  bot.sendMessage(chatId, message)
    .then(() => {
      res.status(200).send('Mensagem enviada com sucesso');
    })
    .catch((error) => {
      res.status(500).send(`Erro ao enviar mensagem: ${error.message}`);
    });
});

// Handler para o comando /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.chat.first_name || 'usuário';

  bot.sendMessage(chatId, `Olá, ${firstName}! Seu chat ID é ${chatId}.`);
  
  // Opcional: Log do chatId para o console ou armazenamento em banco de dados
  console.log(`Usuário ${firstName} iniciou o bot. chatId: ${chatId}`);
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
