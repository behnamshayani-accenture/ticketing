import { Order } from '../../../models/order';
import {
  ExpirationCompleteEvent,
  OrderCancelledEvent,
  OrderStatus,
} from '@behnamtickets/common';
import { Ticket } from '../../../models/ticket';
import mongoose from 'mongoose';
import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { natsWrapper } from '../../../nats-wraper';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  const ticket = Ticket.build({
    title: 'concert',
    price: 20,
    id: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();

  const order = Order.build({
    userId: 'dsfsdfdf',
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket,
  });
  await order.save();

  const expirationListener = new ExpirationCompleteListener(natsWrapper.client);

  const expiredEventData: ExpirationCompleteEvent['data'] = {
    orderId: order.id,
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { order, expirationListener, expiredEventData, msg };
};

it('Cancels the expired orders.', async () => {
  const { order, expirationListener, expiredEventData, msg } = await setup();

  await expirationListener.onMessage(expiredEventData, msg);

  const cancelledOrder = await Order.findById(order.id);
  expect(cancelledOrder!.status).toEqual(OrderStatus.Cancelled);
  expect(msg.ack).toHaveBeenCalled();
});

it('Does not cancel expired order if its paid, but acks the message!', async () => {
  const { order, expirationListener, expiredEventData, msg } = await setup();
  order.status = OrderStatus.Complete;
  await order.save();

  await expirationListener.onMessage(expiredEventData, msg);
  const loadedOrder = await Order.findById(order.id);

  expect(loadedOrder!.status).toEqual(OrderStatus.Complete);
  expect(natsWrapper.client.publish).not.toHaveBeenCalled();
  expect(msg.ack).toHaveBeenCalled();
});

it('Publishes an even when order is expired and cancelled', async () => {
  const { order, expirationListener, expiredEventData, msg } = await setup();

  await expirationListener.onMessage(expiredEventData, msg);
  const eventData: OrderCancelledEvent['data'] = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(eventData.status).toEqual(OrderStatus.Cancelled);
  expect(eventData.id).toEqual(order.id);
});
