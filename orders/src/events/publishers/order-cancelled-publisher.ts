import {
  OrderCancelledEvent,
  Publisher,
  Subjects,
} from '@behnamtickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
