import { TicketUpdatedEvent } from '@behnamtickets/common';
import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wraper';
import { TicketUpdatedListener } from '../ticket-updated-listener';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  const tickeId = new mongoose.Types.ObjectId().toHexString();
  const userId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    id: tickeId,
    title: 'concert',
    price: 23,
  });
  await ticket.save();

  const listener = new TicketUpdatedListener(natsWrapper.client);

  const syncData: TicketUpdatedEvent['data'] = {
    id: tickeId,
    title: 'updated concert',
    cost: 230,
    version: ticket.version + 1,
    userId,
  };

  const outSyncData: TicketUpdatedEvent['data'] = {
    id: tickeId,
    title: 'not sync concert',
    cost: 234,
    version: ticket.version + 3,
    userId,
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, syncData, outSyncData, msg };
};

it('Does not update the ticket if the version is out of sync', async () => {
  const { outSyncData: data, listener, ticket, msg } = await setup();

  try {
    await listener.onMessage(data, msg);
  } catch (error) {}

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).not.toEqual(data.title);
});

it('Does not ack the message if the version is out of sync', async () => {
  const { outSyncData: data, listener, msg } = await setup();

  try {
    await listener.onMessage(data, msg);
  } catch (error) {}

  expect(msg.ack).not.toHaveBeenCalled();
});

it('Updates the ticket given correct version sequence', async () => {
  const { syncData: data, listener, msg, ticket } = await setup();
  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.cost);
  expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message if update is successful', async () => {
  const { syncData: data, listener, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
