# Telegram Request Event Project

Este projeto cria um bot do Telegram usando Node.js, Express, Nodemon, e a biblioteca `node-telegram-bot-api`. Além disso, usa `dotenv` para gerenciar variáveis de ambiente e `swagger-ui-express` para documentar a API.

## Pré-requisitos

- Node.js instalado
- Conta no Telegram para criar um bot e obter o token via BotFather

## Estrutura do Projeto

```
/telegram-request-event
|-- /config
|   |-- swagger.js
|-- /routes
|   |-- index.js
|-- /telegram
|   |-- bot.js
|-- index.js
|-- .env
|-- package.json
|-- package-lock.json
```

## Passo a Passo para Criar o Projeto

### 1. Criar um Bot no Telegram com BotFather

1. Abra o Telegram e pesquise por "BotFather".
2. Inicie uma conversa com o BotFather e envie o comando `/start`.
3. Envie o comando `/newbot` para criar um novo bot.
4. Siga as instruções para escolher um nome e um nome de usuário para o bot.
5. Após a criação, você receberá um token de API. **Guarde esse token**, pois você precisará dele para configurar seu bot.

### 2. Inicializar o Projeto Node.js

Crie uma nova pasta para o projeto e inicialize o projeto Node.js:

```sh
mkdir telegram-request-event
cd telegram-request-event
npm init -y
```

### 3. Instalar Dependências

Instale as dependências necessárias:

```sh
npm install express nodemon node-telegram-bot-api dotenv swagger-ui-express swagger-jsdoc
```

**Explicação das Dependências:**
- **express**: Framework web para Node.js, usado para criar o servidor e gerenciar rotas.
- **nodemon**: Ferramenta que reinicia automaticamente o servidor quando mudanças no código são detectadas.
- **node-telegram-bot-api**: Biblioteca para interagir com a API do Telegram.
- **dotenv**: Biblioteca para carregar variáveis de ambiente de um arquivo `.env`.
- **swagger-ui-express**: Middleware para servir a interface do Swagger.
- **swagger-jsdoc**: Biblioteca para gerar a documentação Swagger a partir de comentários JSDoc no código.

### 4. Configurar Scripts do Nodemon

Atualize o `package.json` para usar Nodemon:

```json
"scripts": {
  "start": "nodemon index.js"
}
```

### 5. Criar o Arquivo `.env`

Crie um arquivo `.env` na raiz do projeto e adicione o token do seu bot do Telegram:

```
TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN_HERE
```

### 6. Configurar Swagger

Crie uma pasta `config` e dentro dela um arquivo `swagger.js` para configurar o Swagger:

**/config/swagger.js**
```js
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Telegram Bot API',
      version: '1.0.0',
      description: 'API para enviar mensagens através do Telegram Bot',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./routes/*.js'], // Caminho para os arquivos da API
};

const specs = swaggerJsDoc(options);

const swaggerDocs = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};

module.exports = swaggerDocs;
```

### 7. Configurar Rotas da API

Crie uma pasta `routes` e dentro dela um arquivo `index.js` para definir as rotas da API:

**/routes/index.js**
```js
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
```

### 8. Configurar o Bot do Telegram

Crie uma pasta `telegram` e dentro dela um arquivo `bot.js` para definir a lógica do bot:

**/telegram/bot.js**
```js
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
```

### 9. Configurar o Arquivo Principal

Atualize o arquivo principal `index.js` para configurar o Express, o Swagger e carregar o bot do Telegram:

**index.js**
```js
const express = require('express');
const dotenv = require('dotenv');
const swaggerDocs = require('./config/swagger');
const routes = require('./routes');

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();
const port = 3000;

// Middleware para analisar JSON no corpo da requisição
app.use(express.json());

// Configurar Swagger
swaggerDocs(app);

// Configurar rotas
app.use('/', routes);

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
```

## Como Usar

### Iniciar o Servidor

1. **Instalar Dependências**
   Certifique-se de instalar todas as dependências:
   ```sh
   npm install
   ```

2. **Iniciar o Servidor**
   ```sh
   npm start
   ```

### Acessar a Documentação do Swagger

- Abra um navegador e vá para `http://localhost:3000/api-docs` para acessar a documentação interativa da API.

### Interagir com o Bot no Telegram

- Abra o Telegram e inicie uma conversa com o bot.
- Envie o comando `/start` para verificar o `chat_id`.

### Enviar uma Mensagem via API

- Use a interface do Swagger ou uma ferramenta como Postman para enviar uma requisição POST para o endpoint `/send-message` com o seguinte corpo JSON:
  ```json
  {
    "chatId": "YOUR_CHAT_ID",
    "message": "Hello, Telegram!"
  }
  ```

## Notas Importantes

- **Uso em Produção**: Não use sua conta pessoal para bots em produção. Crie uma conta separada e configure adequadamente para fins de segurança e gerenciamento.
- **Segurança**: Nunca compartilhe seu token de bot publicamente. Mantenha-o seguro e utilize variáveis de ambiente para gerenciá-lo.

### Conclusão

Este projeto cria um bot do Telegram com uma API documentada usando Swagger, permitindo que você envie mensagens para o Telegram via uma API. A estrutura modular facilita a manutenção e a expansão do projeto no futuro.
