import request from 'supertest';
import { app } from '../../app';
import { signinHelper } from '../../test/signin-helper';
import mongoose from 'mongoose';

it('Returns 404 if a ticket is not found.', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app).get(`/api/tickets/${id}`).send().expect(404);
});

it('Returns a ticket if its found.', async () => {
  const title = 'this is titke';
  const price = 10;
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', signinHelper())
    .send({ title, price })
    .expect(201);

  const lookupResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);

  expect(lookupResponse.body.title).toEqual(title);
  expect(lookupResponse.body.price).toEqual(price);
});
