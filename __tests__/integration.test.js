import request from 'supertest';
import app from '../app.js';

describe('Integration Tests - Workflow Complet', () => {
  let userToken;
  let userId;
  let storyIds = [];

  const testUser = {
    name: 'Integration Test User',
    email: `integration${Date.now()}@example.com`,
    password: 'password123',
    role: 'product_owner'
  };

  describe('Workflow complet utilisateur', () => {
    it('1. Inscription utilisateur', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      userToken = response.body.data.token;
      userId = response.body.data.user.id;
    });

    it('2. Connexion utilisateur', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
    });

    it('3. Récupération profil', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.email).toBe(testUser.email);
    });

    it('4. Création de plusieurs user stories', async () => {
      const stories = [
        {
          title: 'Story 1 - Authentification',
          description: 'En tant qu\'utilisateur, je veux me connecter',
          priority: 'high',
          status: 'todo',
          story_points: 8
        },
        {
          title: 'Story 2 - Dashboard',
          description: 'En tant qu\'utilisateur, je veux voir mon tableau de bord',
          priority: 'medium',
          status: 'todo',
          story_points: 5
        },
        {
          title: 'Story 3 - Profil',
          description: 'En tant qu\'utilisateur, je veux modifier mon profil',
          priority: 'low',
          status: 'todo',
          story_points: 3
        }
      ];

      for (const story of stories) {
        const response = await request(app)
          .post('/api/userstories')
          .set('Authorization', `Bearer ${userToken}`)
          .send(story)
          .expect(201);

        expect(response.body.success).toBe(true);
        storyIds.push(response.body.data.id);
      }

      expect(storyIds).toHaveLength(3);
    });

    it('5. Récupération de toutes les stories', async () => {
      const response = await request(app)
        .get('/api/userstories')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);
    });

    it('6. Mise à jour du statut des stories (workflow Kanban)', async () => {
      // Story 1: todo -> in_progress
      await request(app)
        .put(`/api/userstories/${storyIds[0]}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'in_progress' })
        .expect(200);

      // Story 2: todo -> done
      await request(app)
        .put(`/api/userstories/${storyIds[1]}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'done' })
        .expect(200);

      // Vérifier les changements
      const response = await request(app)
        .get('/api/userstories')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const stories = response.body.data;
      const story1 = stories.find(s => s.id === storyIds[0]);
      const story2 = stories.find(s => s.id === storyIds[1]);
      const story3 = stories.find(s => s.id === storyIds[2]);

      expect(story1.status).toBe('in_progress');
      expect(story2.status).toBe('done');
      expect(story3.status).toBe('todo');
    });

    it('7. Filtrage par statut', async () => {
      const todoResponse = await request(app)
        .get('/api/userstories?status=todo')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const doneResponse = await request(app)
        .get('/api/userstories?status=done')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(todoResponse.body.data).toHaveLength(1);
      expect(doneResponse.body.data).toHaveLength(1);
    });

    it('8. Suppression d\'une story', async () => {
      await request(app)
        .delete(`/api/userstories/${storyIds[2]}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      // Vérifier que la story n'existe plus
      await request(app)
        .get(`/api/userstories/${storyIds[2]}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });

    it('9. Vérification finale du nombre de stories', async () => {
      const response = await request(app)
        .get('/api/userstories')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(2);
    });
  });

  describe('Tests de performance et limites', () => {
    it('devrait gérer la création de nombreuses stories', async () => {
      const promises = [];
      
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post('/api/userstories')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
              title: `Performance Story ${i}`,
              description: `Story de test performance ${i}`,
              priority: 'low',
              status: 'todo',
              story_points: 1
            })
        );
      }

      const responses = await Promise.all(promises);
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });
    });

    it('devrait supporter la pagination avec de nombreuses stories', async () => {
      const response = await request(app)
        .get('/api/userstories?page=1&limit=5')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });
  });
});