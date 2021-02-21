import { Publisher, OrderCreatedEvent, Subjects } from '@chjtickets/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
	subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
