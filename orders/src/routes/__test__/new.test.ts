import request from 'supertest';
import { app } from '../../app';
import { signinHelper } from '../../test/signin-helper';
import mongoose from 'mongoose';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats-wraper';

it('Returns 401 error if the user is not authenticated to create order.', async () => {
  await request(app)
    .post('/api/orders')
    .send({ ticketId: new mongoose.Types.ObjectId().toHexString() })
    .expect(401);
});

it('Returns 400 erros if the input data is not valid.', async () => {
  await request(app)
    .post('/api/orders')
    .set('Cookie', signinHelper())
    .send({ tickerId: 'sad33sd233' })
    .expect(400);
});

it('Returns 404 error if the ticket is not found.', async () => {
  const ticketId = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .post('/api/orders')
    .set('Cookie', signinHelper())
    .send({ ticketId })
    .expect(404);
});

it('Returns 400 error if the ticket is already reserved.', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({ id, title: 'concert', price: 20 });
  await ticket.save();

  const order = Order.build({
    userId: '33dsdfff',
    status: OrderStatus.Created,
    ticket,
    expiresAt: new Date(),
  });
  await order.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', signinHelper())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it('Reserves and places an order for a ticket.', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({ id, title: 'concert', price: 20 });
  await ticket.save();

  const response = await request(app)
    .post('/api/orders')
    .set('Cookie', signinHelper())
    .send({ ticketId: ticket.id })
    .expect(201);

  const createdOrder = response.body;
  expect(createdOrder.status).toEqual(OrderStatus.Created);

  const lookupOrder = await Order.findById(createdOrder.id);
  expect(lookupOrder).not.toBeNull();
});

it('Publishes an event after reserving an order', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({ id, title: 'concert', price: 23 });
  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', signinHelper())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
