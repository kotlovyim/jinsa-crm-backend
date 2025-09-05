import { Module } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { InvitationsController } from './invitations.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
          {
            name: 'MATH_SERVICE',
            transport: Transport.RMQ,
            options: {
              urls: ['amqp://guest:guest@rabbitmq:5672'],
              queue: 'orders-queue',
              queueOptions: {
                durable: true 
              },
            },
          },
        ]),
  ],
  controllers: [InvitationsController],
  providers: [InvitationsService],
})
export class InvitationsModule {}
