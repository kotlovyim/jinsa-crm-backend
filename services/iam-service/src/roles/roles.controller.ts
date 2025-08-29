import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { RolesService } from './roles.service';
import { createRoleDto } from './dto/createRoleDto';
import { Role } from 'src/auth/decorators/roles/role.enum';
import { Roles } from 'src/auth/decorators/roles/roles.decorator';
import { JwtGuard } from 'src/auth/guards/authGuard';
import { RolesGuard } from 'src/auth/guards/roleGuard';
import { Permissions } from 'src/auth/decorators/permissions/permission.decorator';
import { Permission } from 'src/auth/decorators/permissions/permission.enum';
import { PermissionGuard } from 'src/auth/guards/permissionGuard';

@UseGuards(JwtGuard, RolesGuard, PermissionGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  
  @Roles(Role.CEO)
  @Permissions(Permission.manage_roles)
  @Get()
  async findAllRoles() {
    return this.rolesService.findAllRoles();
  }

  @Post()
  async createRole(@Body() dto: createRoleDto) {
    return this.rolesService.createRole(dto);
  }

  @Post('/:roleId/permissions/:permissionId')
  async addPermissionForRole(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Param('permissionId', ParseIntPipe) permissionId: number
  ) {
    return this.rolesService.addPermissionForRole(roleId, permissionId)
  }

  @Delete('/:roleId/permissions/:permissionId')
  async deletePermissionForRole(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Param('permissionId', ParseIntPipe) permissionId: number
  ) {
    return this.rolesService.deletePermissionForRole(roleId, permissionId)

  }


  @Patch(':id')
  async updateRole(@Param('id', ParseIntPipe) id: number, @Body() dto: createRoleDto) {
    return this.rolesService.updateRole(id, dto);
  }

  @Delete(':id')
  async deleteRole(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.deleteRole(id);
  }
}
