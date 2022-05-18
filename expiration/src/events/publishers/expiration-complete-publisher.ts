import {
  ExpirationCompleteEvent,
  Publisher,
  Subjects,
} from '@behnamtickets/common';

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
