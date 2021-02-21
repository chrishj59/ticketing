import { Publisher, Subjects, TicketCreatedEvent } from '@chjtickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
	readonly subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
