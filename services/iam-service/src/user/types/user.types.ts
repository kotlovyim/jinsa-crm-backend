import { User as PrismaUser, Role } from '@prisma/client';

export type User = PrismaUser & {
  roles: Role[];
};

export type CreateUserInput = Omit<
  User,
  'id' | 'createdAt' | 'updatedAt' | 'refreshToken'
> & {
  password: string;
};

export type UpdateUserInput = Partial<
  Omit<CreateUserInput, 'email' | 'password'>
>;

export type UserResponse = Omit<User, 'password' | 'refreshToken'>;
