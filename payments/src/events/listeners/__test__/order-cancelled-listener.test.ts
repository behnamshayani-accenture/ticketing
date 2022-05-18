import { OrderCancelledEvent, OrderStatus } from '@behnamtickets/common';
import mongoose from 'mongoose';
import { Order } from '../../../models/order';
import { Message } from 'node-nats-streaming';
import { natsWrapper } from '../../../nats-wraper';
import { OrderCancelledListener } from '../order-cancelled-listener';

const setup = async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    version: 0,
    userId: 'asdadasd',
    price: 12,
  });
  await order.save();

  const eventData: OrderCancelledEvent['data'] = {
    id: order.id,
    version: 1,
    status: OrderStatus.Cancelled,
    expiresAt: new Date().toISOString(),
    userId: 'asdadasd',
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
      title: 'concert',
      price: 12,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  const listener = new OrderCancelledListener(natsWrapper.client);

  return { listener, msg, eventData, order };
};

it('Cancels the order', async () => {
  const { listener, msg, eventData, order } = await setup();

  await listener.onMessage(eventData, msg);
  const cancelledOrder = await Order.findById(eventData.id);

  expect(cancelledOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message', async () => {
  const { listener, msg, eventData, order } = await setup();
  await listener.onMessage(eventData, msg);

  expect(msg.ack).toHaveBeenCalled();
});
