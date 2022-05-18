import request from 'supertest';
import { app } from '../../app';
import { signinHelper } from '../../test/signin-helper';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wraper';

it('Has a route handler listening to /api/tickets for post requests.', async () => {
  const resposnse = await request(app).post('/api/tickets').send({});
  expect(resposnse.status).not.toEqual(404);
});

it('Can only be accessed if user is singed in.', async () => {
  const resposnse = await request(app).post('/api/tickets').send({});
  expect(resposnse.status).toEqual(401);
});

it('Can be accessed if user is singed in and returns an status other than 401.', async () => {
  const resposnse = await request(app)
    .post('/api/tickets')
    .set('Cookie', signinHelper())
    .send({});
  expect(resposnse.status).not.toEqual(401);
});

it('Returns an error if an invalid title is provided.', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', signinHelper())
    .send({ title: '', price: 10 })
    .expect(400);
  await request(app)
    .post('/api/tickets')
    .set('Cookie', signinHelper())
    .send({ price: 10 })
    .expect(400);
});

it('Returns an error if an invalid price is provided.', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', signinHelper())
    .send({ title: 'this is title' })
    .expect(400);
  await request(app)
    .post('/api/tickets')
    .set('Cookie', signinHelper())
    .send({ title: 'this is title', price: -10 })
    .expect(400);
});

it('Creates a ticket with valid inputs.', async () => {
  let tickets = await Ticket.find({});

  expect(tickets.length).toEqual(0);
  const title = 'this is test title';
  await request(app)
    .post('/api/tickets')
    .set('Cookie', signinHelper())
    .send({ title: title, price: 10 });
  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].title).toEqual(title);
  expect(tickets[0].price).toEqual(10);
});

it('Publishes an event after new ticket created.', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', signinHelper())
    .send({
      title: 'test publise ticket',
      price: 120,
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
