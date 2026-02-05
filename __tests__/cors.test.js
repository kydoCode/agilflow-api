import request from 'supertest';
import app from '../app.js';

describe('CORS Tests', () => {
  describe('Origins autorisées', () => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://www.agilflow.app',
      'https://agilflow.app',
      'https://agilflow-react.vercel.app',
      'https://agilflow-react-git-main-kodys-projects-a2c5b5b8.vercel.app'
    ];

    allowedOrigins.forEach(origin => {
      it(`devrait autoriser ${origin}`, async () => {
        const response = await request(app)
          .options('/api/auth/profile')
          .set('Origin', origin)
          .set('Access-Control-Request-Method', 'GET')
          .expect(204);

        expect(response.headers['access-control-allow-origin']).toBe(origin);
      });
    });
  });

  describe('Origins non autorisées', () => {
    const blockedOrigins = [
      'https://malicious-site.com',
      'http://localhost:8080',
      'https://fake-agilflow.com'
    ];

    blockedOrigins.forEach(origin => {
      it(`devrait bloquer ${origin}`, async () => {
        await request(app)
          .options('/api/auth/profile')
          .set('Origin', origin)
          .set('Access-Control-Request-Method', 'GET')
          .expect(500);
      });
    });
  });

  it('devrait autoriser les requêtes sans origin (Postman, curl)', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);

    expect(response.text).toContain('Le serveur est en route');
  });
});