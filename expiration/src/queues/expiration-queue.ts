import Queue from 'bull';
import { natsWrapper } from '../nats-wrapper';
import { ExpirationCreatePublisher } from '../events/publishers/expiration-create-publisher';

interface Payload {
	orderId: string;
}

const expirationQueue = new Queue<Payload>('order:expiration', {
	redis: {
		host: process.env.REDIS_HOST,
	},
});

expirationQueue.process(async (job) => {
	new ExpirationCreatePublisher(natsWrapper.client).publish({
		orderId: job.data.orderId,
	});
});

export { expirationQueue };
