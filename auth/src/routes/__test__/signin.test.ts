import request from 'supertest';
import { app } from '../../app';

it('Fails to signin with an email that is not registered before.', async () => {
  await request(app)
    .post('/api/users/signin')
    .send({ email: 'test@test.com', password: 'testpass' })
    .expect(400);
});

it('Fails to signin with a password that is not correct for the supplied email.', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com', password: 'testpass' })
    .expect(201);
  await request(app)
    .post('/api/users/signin')
    .send({ email: 'test@test.com', password: 'testpas' })
    .expect(400);
});

it('Returns 200 and sets cookie with correct email password sign in.', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com', password: 'testpass' })
    .expect(201);
  const response = await request(app)
    .post('/api/users/signin')
    .send({ email: 'test@test.com', password: 'testpass' })
    .expect(200);

  expect(response.get('Set-Cookie')).toBeDefined();
});
