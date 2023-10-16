// src/queue.service.ts
import { Injectable } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class QueueService {
  private readonly connection: amqp.Connection;
  private readonly channel: amqp.Channel;
  private readonly queueName: string = 'product_updates';

  constructor() {
    // RabbitMQ 연결 설정
    this.connection = amqp.connect('amqp://localhost');
    this.channel = this.connection.createChannel();

    // 큐 생성
    this.channel.assertQueue(this.queueName, { durable: true });
  }

  async sendMessage(message: string): Promise<void> {
    // 메시지 전송
    this.channel.sendToQueue(this.queueName, Buffer.from(message), {
      persistent: true,
    });
  }

  async consumeMessage(callback: (message: amqp.ConsumeMessage | null) => void): Promise<void> {
    // 메시지 소비
    this.channel.consume(this.queueName, callback, { noAck: false });
  }
}