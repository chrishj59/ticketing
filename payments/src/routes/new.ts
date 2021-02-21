import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { natsWrapper } from '../nats-wrapper';
import { stripe } from '../stripe';
import { Payment } from '../models/payment';
import {
	requireAuth,
	validateRequest,
	BadRequestError,
	NotAuthorizedError,
	NotFoundError,
	OrderStatus,
} from '@chjtickets/common';
import { Order } from '../models/order';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';

const router = express.Router();

router.post(
	'/api/payments',
	requireAuth,
	[body('token').not().isEmpty(), body('orderId').not().isEmpty()],
	validateRequest,
	async (req: Request, res: Response) => {
		const { token, orderId } = req.body;

		const order = await Order.findById(orderId);
		if (!order) {
			throw new NotFoundError();
		}
		if (order.userId !== req.currentUser!.id) {
			throw new NotAuthorizedError();
		}
		if (order.status === OrderStatus.Cancelled) {
			throw new BadRequestError('Cannot pay for a cancelled order');
		}

		// `source` is obtained with Stripe.js; see https://stripe.com/docs/payments/accept-a-payment-charges#web-create-token
		const charge = await stripe.charges.create({
			amount: order.price * 100,
			currency: 'gbp',
			source: token,
			description: `Ticketing`,
		});

		const payment = Payment.build({ orderId, stripeId: charge.id });
		await payment.save();

		new PaymentCreatedPublisher(natsWrapper.client).publish({
			id: payment.id,
			orderId: payment.orderId,
			stripeId: payment.stripeId,
		});

		res.status(201).send({ id: payment.id });
	}
);

export { router as createChargeRouter };
