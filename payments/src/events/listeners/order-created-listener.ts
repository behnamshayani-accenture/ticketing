import { Listener, OrderCreatedEvent, Subjects } from '@behnamtickets/common';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';
import { queueGroupName } from './queue-group-name';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly queueGroupName = queueGroupName;
  readonly subject = Subjects.OrderCreated;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const order = Order.build({
      id: data.id,
      status: data.status,
      version: data.version,
      userId: data.userId,
      price: data.ticket.price,
    });

    await order.save();
    msg.ack();
  }
}
