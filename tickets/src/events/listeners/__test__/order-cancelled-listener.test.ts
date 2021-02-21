import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderCancelledEvent } from '@chjtickets/common';
import { OrderCancelledListener } from '../../listeners/order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import { Listener } from '../../../../../nats-test/src/events/base-listener';

const setup = async () => {
	const listener = new OrderCancelledListener(natsWrapper.client);

	const orderId = mongoose.Types.ObjectId().toHexString();
	const ticket = Ticket.build({
		title: 'concert',
		price: 20,
		userId: '1wert',
	});
	ticket.set({ orderId: orderId });
	await ticket.save();

	const data: OrderCancelledEvent['data'] = {
		id: orderId,
		version: 0,
		ticket: {
			id: ticket.id,
		},
	};

	//@ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { msg, data, ticket, orderId, listener };
};

it('it updates the ticket, publishes an event and acks the message', async () => {
	const { msg, data, ticket, orderId, listener } = await setup();

	await listener.onMessage(data, msg);

	const updatedTicket = await Ticket.findById(ticket.id);

	expect(updatedTicket!.orderId).not.toBeDefined();
	expect(msg.ack).toHaveBeenCalled();
	expect(natsWrapper.client.publish).toHaveBeenCalled();
	console.log((natsWrapper.client.publish as jest.Mock).mock.calls);
});
