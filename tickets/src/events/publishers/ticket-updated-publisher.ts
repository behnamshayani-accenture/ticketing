import { Subjects, Publisher, TicketUpdatedEvent } from '@behnamtickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
