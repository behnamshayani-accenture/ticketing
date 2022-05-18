import {
  Listener,
  NotFoundError,
  Subjects,
  TicketUpdatedEvent,
} from '@behnamtickets/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { queueGroupName } from './queue-group-name';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  queueGroupName = queueGroupName;
  readonly subject = Subjects.TicketUpdated;

  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    const ticket = await Ticket.findByEvent(data);

    if (!ticket) {
      throw new NotFoundError();
    }

    ticket.set({ title: data.title, price: data.cost });
    await ticket.save();
    msg.ack();
  }
}
