import request from 'supertest';
import { app } from '../app';
import jwt from 'jsonwebtoken';

export const signinHelper = (): string[] => {
  const payload = {
    id: 'asdada234234',
    email: 'behnam@test.com',
  };

  const token = jwt.sign(payload, process.env.JWT_KEY!);
  const sessionJson = JSON.stringify({ jwt: token });
  const sessionBase64 = Buffer.from(sessionJson).toString('base64');

  return [`session=${sessionBase64}`];
};
