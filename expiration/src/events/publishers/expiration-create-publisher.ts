import {
	Publisher,
	ExpirationCompleteEvent,
	Subjects,
} from '@chjtickets/common';

export class ExpirationCreatePublisher extends Publisher<ExpirationCompleteEvent> {
	subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
