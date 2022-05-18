import request from 'supertest';
import { Ticket } from '../../models/ticket';
import { app } from '../../app';
import { OrderStatus, Subjects } from '@behnamtickets/common';
import mongoose from 'mongoose';
import { signinHelper } from '../../test/signin-helper';
import { Order } from '../../models/order';
import { natsWrapper } from '../../nats-wraper';

it('Returns 401 error if the user is not authorised.', async () => {
  const orderId = new mongoose.Types.ObjectId();
  await request(app).delete(`/api/orders/${orderId}`).send().expect(401);
});

it('Returns 404 if the order is not found', async () => {
  const orderId = new mongoose.Types.ObjectId();
  await request(app)
    .delete(`/api/orders/${orderId}`)
    .set('Cookie', signinHelper())
    .send()
    .expect(404);
});

it('Returns 401 error if the order does not belong to the user.', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({ id, title: 'concert', price: 20 });
  await ticket.save();

  const { body: createdOrder } = await request(app)
    .post('/api/orders')
    .set('Cookie', signinHelper())
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${createdOrder.id}`)
    .set('Cookie', signinHelper())
    .send()
    .expect(401);
});

it('Updates the order status to cancelled if it belongs to user.', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({ id, title: 'concert', price: 20 });
  await ticket.save();

  const session = signinHelper();

  const { body: createdOrder } = await request(app)
    .post('/api/orders')
    .set('Cookie', session)
    .send({ ticketId: ticket.id })
    .expect(201);

  const { body: cancelledOrder } = await request(app)
    .delete(`/api/orders/${createdOrder.id}`)
    .set('Cookie', session)
    .send()
    .expect(200);

  expect(cancelledOrder.status).toEqual(OrderStatus.Cancelled);
  const order = await Order.findById(createdOrder.id);
  expect(order!.status).toEqual(OrderStatus.Cancelled);
});

it('Publishes an order:cancelled event after cancel.', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({ id, title: 'concert', price: 30 });
  await ticket.save();

  const session = signinHelper();
  const natsWrapperSpy = jest.spyOn(natsWrapper.client, 'publish');

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', session)
    .send({ ticketId: ticket.id })
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', session)
    .send({})
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalledTimes(2);
  expect(natsWrapperSpy.mock.calls[1][0]).toEqual(Subjects.OrderCancelled);
});
