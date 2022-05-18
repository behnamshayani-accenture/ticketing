import { Subjects, TicketCreatedEvent, Publisher } from '@behnamtickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
