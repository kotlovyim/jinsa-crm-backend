import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const allPermissions = new Map<string, string[]>([
  [
    'CEO',
    [
      'create_project',
      'approve_vacation_request',
      'manage_roles',
      'manage_users',
    ],
  ],
  ['HR', ['approve_vacation_request']],
  [
    'TeamLead',
    ['create_project', 'manage_projects', 'manage_vacation_requests'],
  ],
  [
    'TeamMember',
    ['edit_profile', 'view_profile', 'view_projects', 'add_vacation_requests'],
  ],
]);

async function fillInDefaultValues() {
  for (let roleName of allPermissions.keys()) {
    const existing = await prisma.role.findUnique({
      where: { role: roleName },
    });
    if (!existing) {
      await prisma.role.create({ data: { role: roleName } });
      console.log(`Created role: ${roleName}`);
    }
  }

  for (let perm of allPermissions.values()) {
    for (let permission of perm) {
      const existing = await prisma.permission.findUnique({
        where: { title: permission },
      });
      if (!existing) {
        await prisma.permission.create({
          data: { title: permission, description: '' },
        });
        console.log(`Created permission: ${permission}`);
      }
    }
  }

  for (let [roleName, rolePermissions] of allPermissions) {
    const role = await prisma.role.findUnique({ where: { role: roleName } });
    if (!role) continue;

    for (let permissionTitle of rolePermissions) {
      const permission = await prisma.permission.findUnique({
        where: { title: permissionTitle },
      });
      if (!permission) continue;

      const existingRelation = await prisma.role.findUnique({
        where: { role: roleName },
        include: {
          permission: {
            where: { title: permissionTitle },
          },
        },
      });

      if (
        !existingRelation?.permission.some((p) => p.title === permissionTitle)
      ) {
        await prisma.role.update({
          where: { role: roleName },
          data: {
            permission: {
              connect: { title: permissionTitle },
            },
          },
        });
        console.log(
          `Mapped permission '${permissionTitle}' to role '${roleName}'`,
        );
      }
    }
  }
}

fillInDefaultValues().finally(async () => {
  await prisma.$disconnect();
});
