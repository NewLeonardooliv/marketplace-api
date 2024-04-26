import express from 'express';
import cors from 'cors';
import { enviarMensagem } from 'src/services/Amqp/AmqpService';

const app = express();

require('dotenv/config');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// enviarMensagem('testes', 'Leonardo').catch(console.error);

 

export { app };