import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import {
	OrderStatus,
	Subjects,
	ExpirationCompleteEvent,
} from '@chjtickets/common';
import { ExpirationCompleteListener } from '../../listeners/expiration-complete-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Order } from '../../../models/order';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
	const listener = new ExpirationCompleteListener(natsWrapper.client);

	const userId = mongoose.Types.ObjectId().toHexString();
	const ticketId = mongoose.Types.ObjectId().toHexString();
	// Create Ticket
	const ticket = Ticket.build({
		id: ticketId,
		title: 'concert',
		price: 20,
	});
	await ticket.save();
	// create order
	const order = Order.build({
		userId,
		status: OrderStatus.Cancelled,
		expiresAt: new Date(),
		ticket,
	});

	await order.save();

	// fake data Object

	const data: ExpirationCompleteEvent['data'] = {
		orderId: order.id,
	};
	//@ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { msg, data, order, ticket, listener };
};

it('updates the order status to cancelled', async () => {
	const { listener, order, ticket, data, msg } = await setup();

	await listener.onMessage(data, msg);
	const updatedOrder = await Order.findById(order.id);
	expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits an order cancelled event', async () => {
	const { listener, order, ticket, data, msg } = await setup();

	await listener.onMessage(data, msg);

	expect(natsWrapper.client.publish).toHaveBeenCalled();

	const eventData = JSON.parse(
		(natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
	);
	expect(eventData.id).toEqual(order.id);
});

it('ack the message', async () => {
	const { listener, order, ticket, data, msg } = await setup();

	await listener.onMessage(data, msg);
	expect(msg.ack).toHaveBeenCalled();
});
