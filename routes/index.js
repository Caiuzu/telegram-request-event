const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

const bot = require('../telegram/bot')(process.env.TELEGRAM_BOT_TOKEN);

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
router.post('/send-message', (req, res) => {
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

module.exports = router;
