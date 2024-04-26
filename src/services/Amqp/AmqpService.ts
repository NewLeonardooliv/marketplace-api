import * as amqp from 'amqplib';

export async function enviarMensagem(fila: string, mensagem: any) {
    const RABBITMQ_HOST = process.env.RABBITMQ_HOST;
    const RABBITMQ_PORT = process.env.RABBITMQ_PORT;
    const RABBITMQ_VHOST = process.env.RABBITMQ_VHOST;
    const RABBITMQ_USER = process.env.RABBITMQ_USER;
    const RABBITMQ_PASSWORD = process.env.RABBITMQ_PASSWORD;

    const conexao = await amqp.connect(
        `amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}:${RABBITMQ_PORT}/${RABBITMQ_VHOST}`,
    ); // URL de conexão com o RabbitMQ
    const canal = await conexao.createChannel();


    await canal.assertQueue(fila, { durable: true });

    canal.sendToQueue(fila, Buffer.from(mensagem), { persistent: true });

    console.log(`Mensagem '${mensagem}' enviada para a fila '${fila}'`);

    // Fecha a conexão e o canal
    setTimeout(() => {
        conexao.close();
        process.exit(0);
    }, 500);
}

