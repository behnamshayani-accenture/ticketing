import request from 'supertest';
import { app } from '../../app';

it('Kills the cookie after succesful signout', async () => {
  const signupResponse = await request(app)
    .post('/api/users/signup')
    .send({ email: 'test@test.com', password: 'testpass' })
    .expect(201);

  expect(signupResponse.get('Set-Cookie')).toBeDefined();

  const logoutResponse = await request(app).post('/api/users/signout').send({});
  expect(logoutResponse.get('Set-Cookie')[0]).toEqual(
    'session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly'
  );
});
