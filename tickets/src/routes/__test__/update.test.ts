import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { signinHelper } from '../../test/signin-helper';
import { natsWrapper } from '../../nats-wraper';

it('Returns a 401 if the user is not authenticated.', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app).put(`/api/tickets/${id}`).send({}).expect(401);
});

it('Returns a 404 if the ticket does not exists.', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', signinHelper())
    .send({ title: 'updated title', price: 20 });
});

it('Returns a 401 if the ticket does not belong to the user.', async () => {
  const ticketAttrs = { title: 'tasda', price: 10, userId: '123342342' };
  const ticket = Ticket.build(ticketAttrs);
  await ticket.save();

  const existingId = ticket.id;

  await request(app)
    .put(`/api/tickets/${existingId}`)
    .set('Cookie', signinHelper())
    .send({
      title: 'new title',
      price: 10,
    })
    .expect(401);
});

it('Returns a 400 title or the price are not valid.', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', signinHelper())
    .send({ price: 12 })
    .expect(400);
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', signinHelper())
    .send({ title: 'sa' })
    .expect(400);
});

it('Updates the ticket with valid title and price.', async () => {
  const ticket = Ticket.build({
    title: 'old title',
    price: 10,
    userId: 'asdada234234',
  });
  await ticket.save();
  const existingId = ticket.id;
  await request(app)
    .put(`/api/tickets/${existingId}`)
    .set('Cookie', signinHelper())
    .send({
      title: 'new title',
      price: 12,
      id: existingId,
    })
    .expect(200);

  const response = await request(app).get(`/api/tickets/${existingId}`).send();
  expect(response.body.title).toEqual('new title');
  expect(response.body.price).toEqual(12);

  const updatedTicket = await Ticket.findById(existingId);
  if (updatedTicket) {
    expect(updatedTicket.title).toEqual('new title');
    expect(updatedTicket.price).toEqual(12);
  } else {
    fail('Ticket does not exist after update.');
  }
});

it('Publishes an event after ticket is updated.', async () => {
  const ticket = Ticket.build({
    title: 'old title',
    price: 10,
    userId: 'asdada234234',
  });
  await ticket.save();
  const existingId = ticket.id;
  await request(app)
    .put(`/api/tickets/${existingId}`)
    .set('Cookie', signinHelper())
    .send({
      title: 'new title',
      price: 12,
      id: existingId,
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('Does not update the ticket if it is locked (has an orderId)', async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 23,
    userId: 'asdada234234',
  });
  ticket.set({ orderId: 'asdasdasdasd' });
  await ticket.save();

  await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .set('Cookie', signinHelper())
    .send({ title: 'updated concert', price: 230 })
    .expect(400);

  const loadedTicket = await Ticket.findById(ticket.id);

  expect(loadedTicket!.title).toEqual('concert');
  expect(loadedTicket!.price).toEqual(23);
});
