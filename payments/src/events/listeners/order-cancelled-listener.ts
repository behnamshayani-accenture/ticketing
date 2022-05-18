import {
  Listener,
  NotFoundError,
  OrderCancelledEvent,
  OrderStatus,
  Subjects,
} from '@behnamtickets/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { queueGroupName } from './queue-group-name';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly queueGroupName = queueGroupName;
  readonly subject = Subjects.OrderCancelled;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    const order = await Order.findByEvent({
      id: data.id,
      version: data.version - 1,
    });
    if (!order) {
      throw new NotFoundError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    msg.ack();
  }
}
