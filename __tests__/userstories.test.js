import request from 'supertest';
import app from '../app.js';

describe('User Stories API Tests', () => {
  let authToken;
  let createdStoryId;
  const testUser = {
    name: 'Story Tester',
    email: `storytest${Date.now()}@example.com`,
    password: 'password123',
    role: 'developer'
  };

  // Création d'un utilisateur de test avant tous les tests
  beforeAll(async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    authToken = response.body.data.token;
  });

  // Test de création d'une User Story
  describe('POST /api/userstories', () => {
    it('devrait créer une nouvelle User Story', async () => {
      const newStory = {
        action: 'créer un compte',
        need: 'accéder à l\'application',
        status: 'todo',
        priority: 'high',
        role: 'utilisateur'
      };

      const response = await request(app)
        .post('/api/userstories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newStory)
        .expect('Content-Type', /json/)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.action).toBe(newStory.action);
      expect(response.body.data.need).toBe(newStory.need);
      expect(response.body.data.status).toBe(newStory.status);
      expect(response.body.data.priority).toBe(newStory.priority);
      
      createdStoryId = response.body.data.id;
    });

    it('devrait rejeter une création sans token', async () => {
      const response = await request(app)
        .post('/api/userstories')
        .send({
          action: 'test',
          need: 'test',
          status: 'todo',
          priority: 'low'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('devrait rejeter une création avec status invalide', async () => {
      const response = await request(app)
        .post('/api/userstories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          action: 'test',
          need: 'test',
          status: 'invalid_status',
          priority: 'low'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('devrait rejeter une création avec priority invalide', async () => {
      const response = await request(app)
        .post('/api/userstories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          action: 'test',
          need: 'test',
          status: 'todo',
          priority: 'invalid_priority'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  // Test de récupération des User Stories
  describe('GET /api/userstories', () => {
    it('devrait retourner toutes les User Stories de l\'utilisateur', async () => {
      const response = await request(app)
        .get('/api/userstories')
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('userStories');
      expect(Array.isArray(response.body.data.userStories)).toBe(true);
      expect(response.body.data.userStories.length).toBeGreaterThan(0);
    });

    it('devrait supporter la pagination', async () => {
      const response = await request(app)
        .get('/api/userstories?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('pagination');
      expect(response.body.data.pagination).toHaveProperty('currentPage', 1);
      expect(response.body.data.pagination).toHaveProperty('limit', 5);
    });

    it('devrait supporter le filtrage par status', async () => {
      const response = await request(app)
        .get('/api/userstories?status=todo')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.userStories.forEach(story => {
        expect(story.status).toBe('todo');
      });
    });
  });

  // Test de récupération d'une User Story par ID
  describe('GET /api/userstories/:id', () => {
    it('devrait retourner une User Story spécifique', async () => {
      const response = await request(app)
        .get(`/api/userstories/${createdStoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(createdStoryId);
    });

    it('devrait retourner 404 pour un ID inexistant', async () => {
      const response = await request(app)
        .get('/api/userstories/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  // Test de mise à jour d'une User Story
  describe('PUT /api/userstories/:id', () => {
    it('devrait mettre à jour une User Story', async () => {
      const updatedData = {
        action: 'créer un compte utilisateur',
        need: 'accéder aux fonctionnalités',
        status: 'doing',
        priority: 'medium'
      };

      const response = await request(app)
        .put(`/api/userstories/${createdStoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.action).toBe(updatedData.action);
      expect(response.body.data.status).toBe(updatedData.status);
      expect(response.body.data.priority).toBe(updatedData.priority);
    });

    it('devrait rejeter une mise à jour avec status invalide', async () => {
      const response = await request(app)
        .put(`/api/userstories/${createdStoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'invalid_status' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('devrait retourner 404 pour un ID inexistant', async () => {
      const response = await request(app)
        .put('/api/userstories/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ action: 'test' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  // Test de suppression d'une User Story
  describe('DELETE /api/userstories/:id', () => {
    it('devrait supprimer une User Story', async () => {
      const response = await request(app)
        .delete(`/api/userstories/${createdStoryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('supprimée');
    });

    it('devrait retourner 404 pour un ID inexistant', async () => {
      const response = await request(app)
        .delete('/api/userstories/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('devrait rejeter une suppression sans token', async () => {
      const response = await request(app)
        .delete(`/api/userstories/${createdStoryId}`)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
