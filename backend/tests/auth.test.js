import request from 'supertest';
import app from '../src/index.js';
import prisma from '../src/utils/prisma.js';

describe('TaskFlow Authentication API Integration Tests', () => {
  // Test user credentials
  const testUser = {
    name: 'Test Candidate',
    email: 'test_candidate@example.com',
    password: 'testpassword123'
  };

  // Clean up any test records prior to running the test suite
  beforeAll(async () => {
    // Delete any users with test emails to avoid unique key constraints
    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: 'test_'
        }
      }
    });
  });

  // Clean up after the test suite completes and close the Prisma DB connections
  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: 'test_'
        }
      }
    });
    await prisma.$disconnect();
  });

  describe('POST /api/auth/signup', () => {
    it('should successfully register a new user and return a JWT token', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send(testUser);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.name).toBe(testUser.name);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should reject registration if the email already exists', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send(testUser); // Sending duplicate credentials

      expect(response.status).toBe(409); // Conflict
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already registered');
    });

    it('should reject registration if input fails Zod schemas', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'invalid-email',
          name: 'J',
          password: '123' // too short
        });

      expect(response.status).toBe(400); // Bad Request
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should authenticate user and return a token for valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.email).toBe(testUser.email);
    });

    it('should reject login for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid email or password');
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken = '';

    beforeAll(async () => {
      // Obtain a valid token to test protected routes
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      authToken = response.body.data.token;
    });

    it('should return user details for a valid Bearer token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(testUser.email);
      expect(response.body.data.user.name).toBe(testUser.name);
    });

    it('should return 401 when Authorization header is absent', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 for an invalid or expired token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken123');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
