import mongoose from 'mongoose';
import { Order } from '../../../models/order';
import { OrderStatus, PaymentCreatedEvent } from '@behnamtickets/common';
import { Ticket } from '../../../models/ticket';
import { PaymentCreatedListener } from '../payment-created-listener';
import { natsWrapper } from '../../../nats-wraper';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const ticketId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({ id: ticketId, title: 'concert', price: 223 });
  await ticket.save();
  const order = Order.build({
    userId,
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket,
  });

  await order.save();

  const listener = new PaymentCreatedListener(natsWrapper.client);

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  const paymentEventData: PaymentCreatedEvent['data'] = {
    paymentId: new mongoose.Types.ObjectId().toHexString(),
    orderId: order.id,
    stripeId: 'asdada33423e',
  };

  return { order, listener, paymentEventData, msg };
};

it('Sets order status to complete after payment event', async () => {
  const { order, listener, paymentEventData, msg } = await setup();

  await listener.onMessage(paymentEventData, msg);
  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Complete);
});
