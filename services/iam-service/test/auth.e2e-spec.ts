import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth Flow', () => {
  let app: INestApplication;
  let accessToken: string;

  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [PrismaService],
    }).compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
    await prismaService.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
    await prismaService.$disconnect();
  });

  describe('Authentication', () => {
    it('should sign up a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password@123',
          firstName: 'Test',
          lastName: 'User',
        })
        .expect(201);

      expect(response.body).toHaveProperty(
        'message',
        'User created successfully',
      );

      const user = await prismaService.user.findUnique({
        where: { email: 'test@example.com' },
      });

      expect(user).toBeDefined();
    });

    it('should sign in with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password@123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      accessToken = response.body.accessToken;
    });

    it('should access protected endpoint with valid token', async () => {
      await request(app.getHttpServer())
        .get('/user/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });

    it('should not access protected endpoint without token', async () => {
      await request(app.getHttpServer()).get('/user/me').expect(401);
    });

    it('should not access protected endpoint with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/user/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
