import { OrderCreatedEvent, OrderStatus } from '@behnamtickets/common';
import mongoose from 'mongoose';
import { natsWrapper } from '../../../nats-wraper';
import { OrderCreatedListener } from '../order-created-listener';
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models/order';

const setup = () => {
  const listener = new OrderCreatedListener(natsWrapper.client);
  const eventData: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: '332324ddsfsdf',
    expiresAt: new Date().toISOString(),
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 21,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, eventData, msg };
};

it('Creates a new order in db', async () => {
  const { listener, eventData, msg } = setup();

  await listener.onMessage(eventData, msg);
  const createdOrder = await Order.findById(eventData.id);
  if (!createdOrder) {
    fail('Order was not created');
  }
  expect(createdOrder.id).toEqual(eventData.id);
  expect(createdOrder.price).toEqual(eventData.ticket.price);
});

it('acks the message', async () => {
  const { listener, eventData, msg } = setup();

  await listener.onMessage(eventData, msg);
  expect(msg.ack).toHaveBeenCalled();
});
