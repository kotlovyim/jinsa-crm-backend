import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { createRoleDto } from './dto/createRoleDto';
import { JwtGuard } from '@app/auth/guards/jwtGuard';
import { RequirePermission } from '@app/auth/decorators/permissions/requirePermission.decorator';
import { Permission } from 'src/auth/decorators/permissions/permission.enum';
import { PermissionGuard } from 'src/auth/guards/permissionGuard';
import {
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Roles')
@UseGuards(JwtGuard, PermissionGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @ApiOperation({ summary: 'Get all roles' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Roles found successfully',
  })
  @RequirePermission(Permission.manage_roles)
  @Get()
  async findAllRoles() {
    return this.rolesService.findAllRoles();
  }

  @ApiOperation({ summary: 'Create role' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Role created successfully',
  })
  @RequirePermission(Permission.manage_roles)
  @Post()
  @ApiBody({ type: createRoleDto })
  async createRole(@Body() dto: createRoleDto) {
    return this.rolesService.createRole(dto);
  }

  @ApiOperation({ summary: 'Add permission for role' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Permission added for role successfully',
  })
  @RequirePermission(Permission.manage_roles)
  @Post('/:roleId/permissions/:permissionId')
  async addPermissionForRole(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Param('permissionId', ParseIntPipe) permissionId: number,
  ) {
    return this.rolesService.addPermissionForRole(roleId, permissionId);
  }

  @ApiOperation({ summary: 'Delete permission for role' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Permission deleted for role successfully',
  })
  @RequirePermission(Permission.manage_roles)
  @Delete('/:roleId/permissions/:permissionId')
  async deletePermissionForRole(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Param('permissionId', ParseIntPipe) permissionId: number,
  ) {
    return this.rolesService.deletePermissionForRole(roleId, permissionId);
  }

  @ApiOperation({ summary: 'Update role' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Role updated successfully',
  })
  @RequirePermission(Permission.manage_roles)
  @Patch(':id')
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: createRoleDto,
  ) {
    return this.rolesService.updateRole(id, dto);
  }

  @ApiOperation({ summary: 'Delete role' })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 200,
    description: 'Role deleted successfully',
  })
  @RequirePermission(Permission.manage_roles)
  @Delete(':id')
  async deleteRole(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.deleteRole(id);
  }
}
