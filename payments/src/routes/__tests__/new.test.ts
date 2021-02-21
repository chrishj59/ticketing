import request from 'supertest';
import mongoose from 'mongoose';
import { OrderStatus } from '@chjtickets/common';
import { Order } from '../../models/order';
import { app } from '../../app';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

//jest.mock('../../stripe');

it('returns a 400 when purchasing an invlid order id', async () => {
	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin())
		.send({ token: 'assdg', userId: mongoose.Types.ObjectId().toHexString() })
		.expect(400);
});

it('returns a 401 when purchasing another users order', async () => {
	const order = Order.build({
		id: mongoose.Types.ObjectId().toHexString(),
		version: 0,
		userId: mongoose.Types.ObjectId().toHexString(),
		price: 20,
		status: OrderStatus.Created,
	});
	await order.save();

	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin())
		.send({ token: order.id, orderId: order.id })
		.expect(401);
});

it('returns a 400 whehn purchasing a cancelled order', async () => {
	const userId = mongoose.Types.ObjectId().toHexString();

	const order = Order.build({
		id: mongoose.Types.ObjectId().toHexString(),
		version: 0,
		userId,
		price: 20,
		status: OrderStatus.Cancelled,
	});
	await order.save();

	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin(userId))
		.send({ token: order.id, orderId: order.id })
		.expect(400);
});

it('returns a 204 with valid inputs', async () => {
	const userId = mongoose.Types.ObjectId().toHexString();
	const price = Math.floor(Math.random() * 100000);
	const order = Order.build({
		id: mongoose.Types.ObjectId().toHexString(),
		version: 0,
		userId,
		price,
		status: OrderStatus.Created,
	});
	await order.save();
	await request(app)
		.post('/api/payments')
		.set('Cookie', global.signin(userId))
		.send({ token: 'tok_visa', orderId: order.id })
		.expect(201);

	const stripeCharges = await stripe.charges.list({ limit: 50 });
	const stripeCharge = stripeCharges.data.find((charge) => {
		return charge.amount === price * 100;
	});
	expect(stripeCharge).toBeDefined();
	expect(stripeCharge!.currency).toEqual('gbp');

	const payment = Payment.findOne({
		orderId: order.id,
		stripeId: stripeCharge!.id,
	});

	expect(payment).not.toBeNull();

	// const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
	// expect(chargeOptions.source).toEqual('tok_visa');
	// expect(chargeOptions.amount).toEqual(order.price * 100);
	// expect(chargeOptionstr.currency).toEqual('gbp');
});
