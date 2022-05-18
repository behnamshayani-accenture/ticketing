import request from 'supertest';
import { Ticket } from '../../models/ticket';
import { signinHelper } from '../../test/signin-helper';
import { app } from '../../app';
import mongoose from 'mongoose';

it('Lists all orders for the user.', async () => {
  let id = new mongoose.Types.ObjectId().toHexString();
  const ticket1 = Ticket.build({ id, title: 'ticket1', price: 10 });
  await ticket1.save();

  id = new mongoose.Types.ObjectId().toHexString();
  const ticket2 = Ticket.build({ id, title: 'ticket2', price: 20 });
  await ticket2.save();

  id = new mongoose.Types.ObjectId().toHexString();
  const ticket3 = Ticket.build({ id, title: 'ticket3', price: 30 });
  await ticket3.save();

  const userSession1 = signinHelper();
  const userSession2 = signinHelper();

  await request(app)
    .post('/api/orders')
    .set('Cookie', userSession1)
    .send({ ticketId: ticket1.id })
    .expect(201);

  const { body: order1 } = await request(app)
    .post('/api/orders')
    .set('Cookie', userSession2)
    .send({ ticketId: ticket2.id })
    .expect(201);

  const { body: order2 } = await request(app)
    .post('/api/orders')
    .set('Cookie', userSession2)
    .send({ ticketId: ticket3.id })
    .expect(201);

  const orderListResponse = await request(app)
    .get('/api/orders')
    .set('Cookie', userSession2)
    .send()
    .expect(200);

  expect(orderListResponse.body.length).toEqual(2);
  expect(orderListResponse.body[0].id).toEqual(order1.id);
  expect(orderListResponse.body[1].id).toEqual(order2.id);
  expect(orderListResponse.body[0].ticket.id).toEqual(ticket2.id);
  expect(orderListResponse.body[1].ticket.id).toEqual(ticket3.id);
});
