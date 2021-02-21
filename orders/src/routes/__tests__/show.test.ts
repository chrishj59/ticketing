import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';

it('Fetches the ordr', async () => {
	// create a ticket
	const ticket = Ticket.build({
		id: mongoose.Types.ObjectId().toHexString(),
		title: 'Concert',
		price: 20,
	});
	await ticket.save();

	const userOne = global.signin();
	const userTwo = global.signin();

	// make a order with the ticket
	const { body: order } = await request(app)
		.post('/api/orders')
		.set('Cookie', userOne)
		.send({
			ticketId: ticket.id,
		})
		.expect(201);

	// make a request to fetch the order
	const { body: fetchedOrder } = await request(app)
		.get(`/api/orders/${order.id}`)
		.set('Cookie', userOne)
		.send()
		.expect(200);
	expect(fetchedOrder.id).toEqual(order.id);

	// check user two cant fetch user order
	await request(app)
		.get(`/api/orders/${order.id}`)
		.set('Cookie', userTwo)
		.send()
		.expect(401);
});

it('returns an error is user 2 attempts fetch another users order', async () => {
	// create a ticket
	const ticket = Ticket.build({
		id: mongoose.Types.ObjectId().toHexString(),
		title: 'Concert',
		price: 20,
	});
	await ticket.save();

	const userOne = global.signin();
	const userTwo = global.signin();

	// make a order with the ticket
	const { body: order } = await request(app)
		.post('/api/orders')
		.set('Cookie', userOne)
		.send({
			ticketId: ticket.id,
		})
		.expect(201);

	// check user two cant fetch user order
	await request(app)
		.get(`/api/orders/${order.id}`)
		.set('Cookie', userTwo)
		.send()
		.expect(401);
});
