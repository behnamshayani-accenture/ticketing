import request from 'supertest';
import { app } from '../app';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

export const signinHelper = (): string[] => {
  const userId = new mongoose.Types.ObjectId();
  const payload = {
    id: userId,
    email: `behnam+${userId}@test.com`,
  };

  const token = jwt.sign(payload, process.env.JWT_KEY!);
  const sessionJson = JSON.stringify({ jwt: token });
  const sessionBase64 = Buffer.from(sessionJson).toString('base64');

  return [`session=${sessionBase64}`];
};
