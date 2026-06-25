import request from 'supertest';
import { createApp } from '../app';
import { resetStore } from '../data/store';

describe('backend API', () => {
  const app = createApp();

  beforeEach(() => {
    resetStore();
  });

  it('registers a user and creates a narrative', async () => {
    const registerRes = await request(app).post('/api/auth/register').send({
      email: 'educator@example.com',
      password: 'Password123!',
      name: 'Educator',
      role: 'educator'
    });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body.token).toBeTruthy();

    const token = registerRes.body.token as string;
    const createRes = await request(app)
      .post('/api/narratives')
      .set('Authorization', 'Bearer ' + token)
      .send({
        title: 'Classroom story',
        content: 'A collaborative classroom narrative',
        category: 'teaching',
        tags: ['teaching', 'collaboration'],
        status: 'draft'
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.title).toBe('Classroom story');

    const publishRes = await request(app)
      .patch(`/api/narratives/${createRes.body.id}/publish`)
      .set('Authorization', 'Bearer ' + token);

    expect(publishRes.status).toBe(200);
    expect(publishRes.body.status).toBe('published');
  });
});
