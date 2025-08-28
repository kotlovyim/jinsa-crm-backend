import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient()

const roles = ['CEO', 'HR',  'TeamLead', 'TeamMember']
const permissions = ['create_project', 'approve_vacation_request']

async function fillInDefaultValues() {
    for (let role of roles) {
        const existing = await prisma.role.findUnique({where: {role: role}})
        if (!existing) {
            await prisma.role.create({data: {role}})
            console.log(`Created role: ${role}`);
        }
    }


    for (let perm of permissions) {
        const existing = await prisma.permission.findUnique({where: {title: perm}})
        if (!existing) {
            await prisma.permission.create({data: {title: perm, description: ''}})
            console.log(`create perm: ${perm}`);
            
        }
    }
    

}

fillInDefaultValues()
    .finally(async () => {
        await prisma.$disconnect()
    })