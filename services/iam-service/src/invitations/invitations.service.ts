import { PrismaService } from '@app/providers/prisma/prisma.service';
import { Inject, Injectable } from '@nestjs/common';
import { invitationDto } from './dto/invintationDto';
import { v4 as uuidv4 } from 'uuid';
import { OrderDto } from './dto/test.dto';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

@Injectable()
export class InvitationsService {
  private client: ClientProxy;

  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://guest:guest@rabbitmq:5672'],
        queue: 'email_queue',
        queueOptions: { durable: true },
      },
    });
  }

  async sendInvitation(dto: invitationDto) {
    try {
    } catch (error) {
      throw error;
    }
  }

  async send(emailData: { to: string; subject: string; text: string }) {
    // публікуємо повідомлення у RabbitMQ
    this.client.emit('send_email', emailData);
    console.log(`Message queued for: ${emailData.to}`);
  }
}
