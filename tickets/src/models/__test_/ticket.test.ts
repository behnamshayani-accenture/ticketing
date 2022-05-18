import mongoose from 'mongoose';
import { Ticket } from '../ticket';

it('Implements optimistic concurreny control', async () => {
  const userId = new mongoose.Types.ObjectId().toString();
  const ticket = Ticket.build({ title: 'test1', price: 20, userId });
  await ticket.save();

  const fetchedTicket1 = await Ticket.findById(ticket.id);
  const fetchedTicket2 = await Ticket.findById(ticket.id);

  fetchedTicket1!.title = 'new test1';
  await fetchedTicket1!.save();
  fetchedTicket2!.title = 'new test2';
  await expect(fetchedTicket2!.save()).rejects.toThrow();
});

it('Increments the version number after each save.', async () => {
  const ticket = Ticket.build({ title: 'test', price: 20, userId: 'sdfsdf32' });

  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
