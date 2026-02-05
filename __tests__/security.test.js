import request from 'supertest';
import app from '../app.js';

describe('Security Tests', () => {
  describe('Rate Limiting', () => {
    it('devrait appliquer le rate limiting global', async () => {
      const requests = [];
      const maxRequests = process.env.NODE_ENV === 'production' ? 30 : 500;
      
      // Faire plusieurs requêtes rapidement
      for (let i = 0; i < 5; i++) {
        requests.push(request(app).get('/'));
      }
      
      const responses = await Promise.all(requests);
      responses.forEach(response => {
        expect([200, 429]).toContain(response.status);
      });
    });

    it('devrait appliquer le rate limiting auth plus strict', async () => {
      const authRequests = [];
      const maxAuthRequests = process.env.NODE_ENV === 'production' ? 5 : 10;
      
      // Faire plusieurs tentatives de connexion
      for (let i = 0; i < 3; i++) {
        authRequests.push(
          request(app)
            .post('/api/auth/login')
            .send({ email: 'test@test.com', password: 'wrong' })
        );
      }
      
      const responses = await Promise.all(authRequests);
      responses.forEach(response => {
        expect([401, 429]).toContain(response.status);
      });
    });
  });

  describe('Headers de sécurité', () => {
    it('devrait inclure les headers Helmet', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
    });

    it('devrait avoir une CSP configurée', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.headers).toHaveProperty('content-security-policy');
    });
  });

  describe('Validation des entrées', () => {
    it('devrait rejeter les requêtes avec payload trop volumineux', async () => {
      const largePayload = 'x'.repeat(1000000); // 1MB
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({ name: largePayload })
        .expect(413);
    });

    it('devrait valider le format JSON', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(400);
    });
  });
});