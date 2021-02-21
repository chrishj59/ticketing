import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { TicketCreatedEvent } from '@chjtickets/common';
import { TicketCreatedListener } from '../../listeners/ticket-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
	// create an instance of the Listener
	const listener = new TicketCreatedListener(natsWrapper.client);

	// create a fake data event
	const data: TicketCreatedEvent['data'] = {
		version: 0,
		id: new mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 10,
		userId: new mongoose.Types.ObjectId().toHexString(),
	};

	// create a fake message object
	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(), // can whrite expectation that its called
	};

	return { listener, data, msg };
};

it('creates and saves a ticket', async () => {
	const { listener, data, msg } = await setup();

	// onMessage with data and message objects
	await listener.onMessage(data, msg);

	// write assetion that ticket was created
	const ticket = await Ticket.findById(data.id);
	expect(ticket).toBeDefined();
	expect(ticket!.title).toEqual(data.title);
	expect(ticket!.price).toEqual(data.price);
});

it('acks the message', async () => {
	const { data, listener, msg } = await setup();
	// onMessage with data and message objects
	await listener.onMessage(data, msg);
	// assert that ack method called
	expect(msg.ack).toBeCalled();
});
