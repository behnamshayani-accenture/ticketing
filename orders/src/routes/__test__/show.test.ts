import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Ticket } from '../../models/ticket';
import { signinHelper } from '../../test/signin-helper';

it('Returns 401 error if the user is not authenticated.', async () => {
  const orderId = new mongoose.Types.ObjectId();
  await request(app).get(`/api/orders/${orderId}`).send().expect(401);
});

it('Returns 404 error if the order does not exists.', async () => {
  const orderId = new mongoose.Types.ObjectId();

  await request(app)
    .get(`/api/orders/${orderId}`)
    .set('Cookie', signinHelper())
    .send()
    .expect(404);
});

it('Returns 401 error if the order does not belong to the user.', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({ id, title: 'concert', price: 20 });
  await ticket.save();
  const user1Session = signinHelper();
  const user2Session = signinHelper();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user1Session)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user2Session)
    .send()
    .expect(401);
});

it('Returns order if it belongs to the user.', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({ id, title: 'concert', price: 20 });
  await ticket.save();
  const user1Session = signinHelper();

  const { body: createdOrder } = await request(app)
    .post('/api/orders')
    .set('Cookie', user1Session)
    .send({ ticketId: ticket.id })
    .expect(201);

  const { body: order } = await request(app)
    .get(`/api/orders/${createdOrder.id}`)
    .set('Cookie', user1Session)
    .send()
    .expect(200);

  expect(order.id).toEqual(createdOrder.id);
  expect(order.ticket.id).toEqual(ticket.id);
});
