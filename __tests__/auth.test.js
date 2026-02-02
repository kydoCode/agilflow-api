import request from 'supertest';
import app from '../app.js';

describe('Auth API Tests', () => {
  let authToken;
  const testUser = {
    name: 'Test User',
    email: `test${Date.now()}@example.com`,
    password: 'password123',
    role: 'developer'
  };

  // Test d'inscription
  describe('POST /api/auth/register', () => {
    it('devrait créer un nouvel utilisateur avec succès', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toHaveProperty('email', testUser.email);
      expect(response.body.data.user).not.toHaveProperty('password');
      
      authToken = response.body.data.token;
    });

    it('devrait rejeter une inscription avec email invalide', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, email: 'invalid-email' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('devrait rejeter une inscription avec mot de passe trop court', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, password: '123' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('devrait rejeter une inscription avec rôle invalide', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, email: `new${Date.now()}@example.com`, role: 'invalid_role' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  // Test de connexion
  describe('POST /api/auth/login', () => {
    it('devrait connecter un utilisateur avec des identifiants valides', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user).toHaveProperty('email', testUser.email);
    });

    it('devrait rejeter une connexion avec email inexistant', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('devrait rejeter une connexion avec mot de passe incorrect', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  // Test du profil utilisateur
  describe('GET /api/auth/profile', () => {
    it('devrait retourner le profil de l\'utilisateur authentifié', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('email', testUser.email);
      expect(response.body).toHaveProperty('name', testUser.name);
      expect(response.body).not.toHaveProperty('password');
    });

    it('devrait rejeter une requête sans token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('devrait rejeter une requête avec token invalide', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
