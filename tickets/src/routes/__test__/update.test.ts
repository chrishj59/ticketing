import { requireAuth } from '@chjtickets/common';
import request from 'supertest';
import { app } from '../../app';
import mongoose, { Mongoose } from 'mongoose';
import { natsWrapper } from '../../nats-wrapper';
import { Ticket } from '../../models/ticket';

it('returns 404 is the ticket id does not exist', async () => {
	const id = new mongoose.Types.ObjectId().toHexString();
	const ticket = await request(app)
		.put(`/api/tickets/${id}`)
		.set('Cookie', global.signin())
		.send({ title: 'asgdsg', price: 13 })
		.expect(404);
});

it('returns 401 if the user is not authenticated', async () => {
	const id = new mongoose.Types.ObjectId().toHexString();
	const ticket = await request(app)
		.put(`/api/tickets/${id}`)

		.send({ title: 'asgdsg', price: 13 })
		.expect(401);
});

it('returns 401 if the user does not own the ticket', async () => {
	const ticket = await request(app)
		.post('/api/tickets')
		.set('Cookie', global.signin())
		.send({ title: 'sdhdhd', price: 25 });

	await request(app)
		.put(`/api/tickets/${ticket.body.id}`)
		.set('Cookie', global.signin())
		.send({ title: 'updated', price: 5 })
		.expect(401);
	// could also check the title of tick has not been updasted in DB
});

it('returns 401 if the user is not authorised', async () => {
	const cookie = global.signin();
	const ticket = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({ title: 'sdhdhd', price: 25 })
		.expect(201);
});

it('returns 400 if the user provides invalid toitle or price', async () => {
	const cookie = global.signin();
	const ticket = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({ title: 'sdhdhd', price: 25 })
		.expect(201);

	await request(app)
		.put(`/api/tickets/${ticket.body.id}`)
		.set('Cookie', cookie)
		.send({ title: '', price: 20 })
		.expect(400);

	await request(app)
		.put(`/api/tickets/${ticket.body.id}`)
		.set('Cookie', cookie)
		.send({ title: 'Too small', price: -20 })
		.expect(400);
});
it('returns updated ticket if provided valid input', async () => {
	const cookie = global.signin();

	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({ title: 'sdhdhd', price: 25 })
		.expect(201);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({ title: 'new Title', price: 200 })
		.expect(200);

	const ticketResponse = await request(app)
		.get(`/api/tickets/${response.body.id}`)
		.send()
		.expect(200);

	expect(ticketResponse.body.title).toEqual('new Title');
	expect(ticketResponse.body.price).toEqual(200);
});

it('Publishes an event', async () => {
	const cookie = global.signin();

	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({ title: 'sdhdhd', price: 25 })
		.expect(201);

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({ title: 'new Title', price: 200 })
		.expect(200);
	expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects updates if the ticket is reserved', async () => {
	const cookie = global.signin();

	const response = await request(app)
		.post('/api/tickets')
		.set('Cookie', cookie)
		.send({ title: 'sdhdhd', price: 25 })
		.expect(201);

	const ticket = await Ticket.findById(response.body.id);
	const orderId = mongoose.Types.ObjectId().toHexString();
	ticket!.set({ orderId: orderId });
	await ticket!.save();

	await request(app)
		.put(`/api/tickets/${response.body.id}`)
		.set('Cookie', cookie)
		.send({ title: 'new Title', price: 200 })
		.expect(400);
});
