import request from 'supertest';
import app from '../app.js';
import { User } from '../models/index.js';

describe('UserStories API Tests', () => {
  let authToken;
  let userId;
  let storyId;
  
  const testUser = {
    name: 'Test User Stories',
    email: `teststories${Date.now()}@example.com`,
    password: 'password123',
    role: 'product_owner'
  };

  const testStory = {
    title: 'Test User Story',
    description: 'En tant qu\'utilisateur, je veux tester cette fonctionnalité',
    priority: 'high',
    status: 'todo',
    story_points: 5
  };

  beforeAll(async () => {
    // Créer un utilisateur de test
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    authToken = registerResponse.body.data.token;
    userId = registerResponse.body.data.user.id;
  });

  describe('POST /api/userstories', () => {
    it('devrait créer une nouvelle user story', async () => {
      const response = await request(app)
        .post('/api/userstories')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testStory)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe(testStory.title);
      expect(response.body.data.user_id).toBe(userId);
      
      storyId = response.body.data.id;
    });

    it('devrait rejeter une story sans authentification', async () => {
      const response = await request(app)
        .post('/api/userstories')
        .send(testStory)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('devrait valider les champs requis', async () => {
      const response = await request(app)
        .post('/api/userstories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: '' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('devrait valider les valeurs enum', async () => {
      const response = await request(app)
        .post('/api/userstories')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ...testStory, priority: 'invalid_priority' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/userstories', () => {
    it('devrait récupérer toutes les user stories de l\'utilisateur', async () => {
      const response = await request(app)
        .get('/api/userstories')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('devrait supporter la pagination', async () => {
      const response = await request(app)
        .get('/api/userstories?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });

    it('devrait supporter le filtrage par statut', async () => {
      const response = await request(app)
        .get('/api/userstories?status=todo')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      response.body.data.forEach(story => {
        expect(story.status).toBe('todo');
      });
    });
  });

  describe('GET /api/userstories/:id', () => {
    it('devrait récupérer une user story spécifique', async () => {
      const response = await request(app)
        .get(`/api/userstories/${storyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(storyId);
      expect(response.body.data.title).toBe(testStory.title);
    });

    it('devrait retourner 404 pour une story inexistante', async () => {
      const response = await request(app)
        .get('/api/userstories/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/userstories/:id', () => {
    it('devrait mettre à jour une user story', async () => {
      const updatedData = {
        title: 'Updated Test Story',
        status: 'in_progress',
        story_points: 8
      };

      const response = await request(app)
        .put(`/api/userstories/${storyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updatedData.title);
      expect(response.body.data.status).toBe(updatedData.status);
      expect(response.body.data.story_points).toBe(updatedData.story_points);
    });

    it('devrait empêcher la modification des stories d\'autres utilisateurs', async () => {
      // Créer un autre utilisateur
      const otherUser = {
        name: 'Other User',
        email: `other${Date.now()}@example.com`,
        password: 'password123',
        role: 'developer'
      };

      const otherUserResponse = await request(app)
        .post('/api/auth/register')
        .send(otherUser);

      const otherToken = otherUserResponse.body.data.token;

      const response = await request(app)
        .put(`/api/userstories/${storyId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ title: 'Hacked!' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/userstories/:id', () => {
    it('devrait supprimer une user story', async () => {
      const response = await request(app)
        .delete(`/api/userstories/${storyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('supprimée');
    });

    it('devrait retourner 404 pour une story déjà supprimée', async () => {
      const response = await request(app)
        .delete(`/api/userstories/${storyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  afterAll(async () => {
    // Nettoyer les données de test
    if (userId) {
      await User.destroy({ where: { id: userId } });
    }
  });
});