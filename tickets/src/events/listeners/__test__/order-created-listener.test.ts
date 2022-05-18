import { OrderCreatedEvent, OrderStatus } from '@behnamtickets/common';
import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wraper';
import { OrderCreatedListener } from '../order-created-listener';
import { Message } from 'node-nats-streaming';
import { TicketUpdatedPublisher } from '../../publishers/ticket-updated-publisher';

const setup = async () => {
  const ticketUserId = new mongoose.Types.ObjectId().toHexString();
  const title = 'concert';
  const price = 20;
  const ticket = Ticket.build({
    title,
    price,
    userId: ticketUserId,
  });
  await ticket.save();
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: new mongoose.Types.ObjectId().toHexString(),
    expiresAt: new Date().toISOString(),
    ticket: {
      title,
      price,
      id: ticket.id,
    },
  };
  const listener = new OrderCreatedListener(natsWrapper.client);

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, ticket, msg };
};

it('Sets orderId on the ticket when order is created (to indicated ticket is reserved)', async () => {
  const { listener, data, ticket, msg } = await setup();

  await listener.onMessage(data, msg);

  const loadedTicket = await Ticket.findById(ticket.id);
  expect(loadedTicket!.orderId).toEqual(data.id);
});

it('Acks the message', async () => {
  const { listener, data, ticket, msg } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('Publishes an ticket updated event when ticket is reserved', async () => {
  const { listener, data, ticket, msg } = await setup();

  await listener.onMessage(data, msg);
  expect(natsWrapper.client.publish).toHaveBeenCalled();
  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(ticketUpdatedData.orderId).toEqual(data.id);
  expect(ticketUpdatedData.id).toEqual(data.ticket.id);
});
