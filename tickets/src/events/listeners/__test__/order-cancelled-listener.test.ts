import { OrderCancelledEvent, OrderStatus } from '@behnamtickets/common';
import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';
import { natsWrapper } from '../../../nats-wraper';
import { Message } from 'node-nats-streaming';
import { OrderCancelledListener } from '../order-cancelled-listener';

const setup = async () => {
  const orderId = new mongoose.Types.ObjectId().toHexString();

  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    userId: 'asdada234234',
  });

  ticket.set({ orderId });
  await ticket.save();

  const orderCancelledListener = new OrderCancelledListener(natsWrapper.client);

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  const orderCancelledData: OrderCancelledEvent['data'] = {
    id: orderId,
    version: 1,
    status: OrderStatus.Cancelled,
    userId: 'asdada',
    expiresAt: new Date().toISOString(),
    ticket: {
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
    },
  };

  return {
    orderCancelledListener,
    orderCancelledData,
    ticket,
    msg,
  };
};

it('Removes the order id from the ticket', async () => {
  const { orderCancelledListener, orderCancelledData, ticket, msg } =
    await setup();

  await orderCancelledListener.onMessage(orderCancelledData, msg);
  const cancelledTicket = await Ticket.findById(ticket.id);
  expect(cancelledTicket!.orderId).not.toBeDefined();
});

it('acks the orderCreated message', async () => {
  const { orderCancelledListener, orderCancelledData, msg } = await setup();

  await orderCancelledListener.onMessage(orderCancelledData, msg);

  expect(msg.ack).toHaveBeenCalledTimes(1);
});

it('Publishes a ticketUpdated event after un-reserving the ticket', async () => {
  const { orderCancelledListener, orderCancelledData, ticket, msg } =
    await setup();

  await orderCancelledListener.onMessage(orderCancelledData, msg);
  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(eventData.orderId).toBeUndefined();
  expect(eventData.id).toEqual(ticket.id);
});
