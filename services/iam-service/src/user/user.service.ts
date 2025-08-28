import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { updateUserDto } from './dto/UpdateUserDto';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) {}

    async getUserData(user: any) {
        try {
            const userData = await this.prisma.user.findUnique({where: {
                id: user.userId
            }})

            return userData
        } catch(error) {
            throw error
        }
    }


    async updateNonCriticalData(dto:updateUserDto, user: any) {
        try {
            const update = await this.prisma.user.update({
                where: {
                    id: user.userId 
                }, data: {
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    position: dto.position
                }
            })

            return update
        } catch(error) {
            throw error
        }
    }
}
