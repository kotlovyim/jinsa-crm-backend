import { Injectable } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, EventPattern, Payload, Transport } from '@nestjs/microservices';
import nodemailer from 'nodemailer'

@Injectable()
export class consumerService {
  private client: ClientProxy;

 private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.example.com', // ваш SMTP сервер
      port: 587,
      secure: false,
      auth: {
        user: 'your_email@example.com',
        pass: 'your_password',
      },
    });
  }
 
  @EventPattern('send_email')
  async handleSendEmail(@Payload() data: { to: string; subject: string; text: string }) {
    await this.transporter.sendMail({
      from: '"My App" <your_email@example.com>',
      to: data.to,
      subject: data.subject,
      text: data.text,
    });

    console.log(`Email sent to ${data.to}`);
  }
}
