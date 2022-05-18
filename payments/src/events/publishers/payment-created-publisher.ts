import {
  PaymentCreatedEvent,
  Publisher,
  Subjects,
} from '@behnamtickets/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
