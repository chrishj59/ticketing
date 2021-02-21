import { Publisher, Subjects, TicketUpdatedEvent } from '@chjtickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
	readonly subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
