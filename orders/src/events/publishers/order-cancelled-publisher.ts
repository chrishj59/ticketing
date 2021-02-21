import { Publisher, OrderCancelledEvent, Subjects } from '@chjtickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
	subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
