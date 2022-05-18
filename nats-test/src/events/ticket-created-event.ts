import { Subjects } from './subjects';
export interface TicketCreatedEvent {
  subject: Subjects.TicketCreated;
  data: {
    id: string;
    title: string;
    cost: number;
    userId: string;
  };
}
