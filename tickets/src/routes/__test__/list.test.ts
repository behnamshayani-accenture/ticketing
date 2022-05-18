import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

it('Can fetch a list of all tickets.', async () => {
  const tickets = [
    {
      title: 'first ticket title',
      price: 10,
      userId: '122342535',
    },
    {
      title: 'second ticket title',
      price: 20,
      userId: '122342535',
    },
  ];

  tickets.map((ticketAttrs) => {
    const ticket = Ticket.build(ticketAttrs);
    ticket.save();
  });

  const response = await request(app).get('/api/tickets').send();

  expect(response.body.length).toEqual(2);
});
