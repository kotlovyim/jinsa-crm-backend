import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { PermissionGuard } from '@app/auth/guards/permissionGuard';
import { JwtGuard } from '@app/auth/guards/jwtGuard';
import { invitationDto } from './dto/invintationDto';
import { OrderDto } from './dto/test.dto';
import { EventPattern, Payload } from '@nestjs/microservices';

@UseGuards(PermissionGuard, JwtGuard)
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  // @RequirePermission(Permission.invite_user)
  @Post()
  async sendInvitation(@Body() dto: invitationDto) {
    return this.invitationsService.sendInvitation(dto)
  }
  


   @Post('check')
  async send(@Body() body: { to: string; subject: string; text: string }) {
    await this.invitationsService.send(body);
    return { message: `Email queued for ${body.to}` };
  }

}
