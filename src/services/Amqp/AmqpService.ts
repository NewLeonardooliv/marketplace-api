import amqp from 'amqplib/callback_api';

export class AmqpService {
    private connection: amqp.Connection | null = null;
    private channel: amqp.Channel | null = null;

    RABBITMQ_HOST = process.env.RABBITMQ_HOST;
    RABBITMQ_PORT = process.env.RABBITMQ_PORT;
    RABBITMQ_VHOST = process.env.RABBITMQ_VHOST;
    RABBITMQ_USER = process.env.RABBITMQ_USER;
    RABBITMQ_PASSWORD = process.env.RABBITMQ_PASSWORD;

    public async publisher(queue: string, payload: any, messageProperties: amqp.Options.Publish = {}): Promise<void> {
        await this.connect();

        this.channel?.assertQueue(queue, { durable: true });
        this.channel?.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), messageProperties);

        this.closeConnection();
    }

    public async consumer(queue: string, callback: (payloadData: any) => void, tickets = 5, registerFail = true): Promise<void> {
        await this.connect();

        this.channel?.assertQueue(queue, { durable: true });
        if (tickets !== -1) this.channel?.prefetch(tickets);

        this.channel?.consume(queue, async (msg) => {
            if (msg !== null) {
                const content = msg.content.toString();
                const payload = JSON.parse(content);
                try {
                    await callback(payload);
                } catch (error) {
                    console.error(error);
                    if (registerFail) {
                        this.sendTicketToFailQueue(payload, error, queue);
                    }
                }

                this.channel?.ack(msg);
            }
        });

        console.log(`Aguardando mensagens em "${queue}".`);
    }

    private async sendTicketToFailQueue(payload: [], error: any, originQueue: string) {
        const messageToFail = { ...payload, error };
        this.channel?.assertQueue(`${originQueue}_fail`, { durable: true });
        this.channel?.sendToQueue(`${originQueue}_fail`, Buffer.from(JSON.stringify(messageToFail)));
    }

    private async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            amqp.connect(
                `amqp://${this.RABBITMQ_USER}:${this.RABBITMQ_PASSWORD}@${this.RABBITMQ_HOST}:${this.RABBITMQ_PORT}/${this.RABBITMQ_VHOST}`,
                (error, connection) => {
                    if (error) {
                        reject(error);
                    } else {
                        this.connection = connection;
                        this.connection.createChannel((err, channel) => {
                            if (err) {
                                reject(err);
                            } else {
                                this.channel = channel;
                                resolve();
                            }
                        });
                    }
                }
            );
        });
    }

    private closeConnection(): void {
        this.connection?.close();
    }
}
