import mongoose from 'mongoose';
import { natsWrapper } from '../../../nats-wrapper';
import { Message } from 'node-nats-streaming';
import { OrderCreatedListener } from '../order-created-listener';
import { Ticket } from '../../../models/ticket';
import { OrderCreatedEvent, OrderStatus } from '@chjtickets/common';

const setup = async () => {
	// Create an instance of the listener
	const listener = new OrderCreatedListener(natsWrapper.client);

	// Create and save a ticket
	const ticket = Ticket.build({
		title: 'concert',
		price: 99,
		userId: 'asdf',
	});
	await ticket.save();

	// Create the fake data event
	const data: OrderCreatedEvent['data'] = {
		id: mongoose.Types.ObjectId().toHexString(),
		version: 0,
		status: OrderStatus.Created,
		userId: 'alskdfj',
		expiresAt: 'alskdjf',
		ticket: {
			id: ticket.id,
			price: ticket.price,
		},
	};

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, ticket, data, msg };
};

it('sets the orderId of the ticket', async () => {
	const { listener, data, msg, ticket } = await setup();
	await listener.onMessage(data, msg);

	const updatedTicket = await Ticket.findById(ticket.id);
	expect(updatedTicket!.orderId).toEqual(data.id);
});

it('it calls teh ack method', async () => {
	const { listener, data, msg } = await setup();
	await listener.onMessage(data, msg);
	expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
	const { listener, ticket, data, msg } = await setup();

	await listener.onMessage(data, msg);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
	console.log((natsWrapper.client.publish as jest.Mock).mock.calls);
	const ticketUpdatedData = JSON.parse(
		(natsWrapper.client.publish as jest.Mock).mock.calls[2][1]
	);
	console.log((natsWrapper.client.publish as jest.Mock).mock.calls[0]);
	console.log('data.id: ', data.id);
	expect(data.id).toEqual(ticketUpdatedData.orderId);
});
