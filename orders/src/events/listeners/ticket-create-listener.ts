import { Listener, Subjects, TicketCreatedEvent } from '@behnamtickets/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';

export class TicketCreateListener extends Listener<TicketCreatedEvent> {
  queueGroupName = queueGroupName;
  readonly subject = Subjects.TicketCreated;

  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    const { id, title, cost } = data;

    const ticket = Ticket.build({ id, title, price: cost });
    await ticket.save();
    if (ticket.id) {
      msg.ack();
    }
  }
}
