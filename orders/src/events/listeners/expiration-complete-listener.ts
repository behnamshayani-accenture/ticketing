import {
  ExpirationCompleteEvent,
  Listener,
  NotFoundError,
  OrderStatus,
  Subjects,
} from '@behnamtickets/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { natsWrapper } from '../../nats-wraper';
import { OrderCancelledPublisher } from '../publishers/order-cancelled-publisher';
import { queueGroupName } from './queue-group-name';

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  readonly queueGroupName = queueGroupName;
  readonly subject = Subjects.ExpirationComplete;

  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId).populate('ticket');

    if (!order) {
      throw new NotFoundError();
    }

    if (order.status === OrderStatus.Complete) {
      msg.ack();
      return;
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      status: OrderStatus.Cancelled,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      ticket: {
        id: order.ticket.id,
        title: order.ticket.title,
        price: order.ticket.price,
      },
    });

    msg.ack();
  }
}
