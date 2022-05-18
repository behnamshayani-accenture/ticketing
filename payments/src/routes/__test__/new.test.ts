import { OrderStatus } from '@behnamtickets/common';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order } from '../../models/order';
import { Payment } from '../../models/payment';
import { natsWrapper } from '../../nats-wraper';
import { stripe } from '../../stripe';
import { signinHelper } from '../../test/signin-helper';

jest.mock('../../nats-wraper');

it('Returns 401 when purchasing order with unauthorized users.', async () => {
  await request(app).post('/api/payments/').send({}).expect(401);
});

it('Returns 400 when purchasing order with missing input params.', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', signinHelper())
    .send({ orderId: 'asdadad' })
    .expect(400);

  await request(app)
    .post('/api/payments')
    .set('Cookie', signinHelper())
    .send({ token: 'asdadada' })
    .expect(400);
});

it('Returns 404 when purchasing an order that does not exists.', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', signinHelper())
    .send({
      token: 'adasd',
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it('Returns 404 when purchasing an order that does not belong to the user.', async () => {
  const { order } = await setup();

  await request(app)
    .post('/api/payments')
    .set('Cookie', signinHelper())
    .send({ token: 'asdad', orderId: order.id })
    .expect(404);
});

it('Returns 400 when purchasing an order that is already cancelled.', async () => {
  const { order } = await setup();
  order.status = OrderStatus.Cancelled;
  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', signinHelper(order.userId))
    .send({ token: 'adasda', orderId: order.id })
    .expect(400);
});

it('Calls stripe API to create a charge', async () => {
  const { userId, order } = await setup();

  await request(app)
    .post('/api/payments')
    .set('Cookie', signinHelper(userId))
    .send({ orderId: order.id, token: 'tok_visa' })
    .expect(201);

  let found = false;

  for await (const charge of stripe.charges.list({ limit: 5 })) {
    if (charge.amount === order.price * 100) {
      found = true;
      break;
    }
  }

  expect(found).toBeTruthy();
});

it('Creates a payment for the charged order', async () => {
  const { order, userId } = await setup();

  await request(app)
    .post('/api/payments')
    .set('Cookie', signinHelper(userId))
    .send({ orderId: order.id, token: 'tok_visa' })
    .expect(201);

  const payment = await Payment.findOne({ orderId: order.id });

  expect(payment).not.toBeNull();
});

it('Publishes a new event after payment is created', async () => {
  const { userId, order } = await setup();
  await request(app)
    .post('/api/payments')
    .set('Cookie', signinHelper(userId))
    .send({ orderId: order.id, token: 'tok_visa' })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

const setup = async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    version: 0,
    userId,
    price: Math.floor(Math.random() * (345666 - 10) + 10),
  });

  await order.save();

  return { userId, order };
};
