import request from 'supertest';
import { app } from '../app';

export const signupHelper = async (): Promise<string[]> => {
  const username = 'test@test.com';
  const password = 'testpass';

  const response = await request(app)
    .post('/api/users/signup')
    .send({ email: username, password: password })
    .expect(201);
  const cookie = response.get('Set-Cookie');

  return cookie;
};
