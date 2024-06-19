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
