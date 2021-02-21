import { useEffect, useState } from 'react';
import StripeCheckout from 'react-stripe-checkout';
import { Router } from 'next/router';
import useRequest from '../../hooks/use-request';

const OrderShow = ({ order, currentUser }) => {
	const [timeLeft, setTimeLeft] = useState(0);
	const { doRequest, errors } = useRequest({
		url: '/api/payments',
		method: 'post',
		body: {
			orderId: order.id,
		},
		onSuccess: () => Router.push('/orders'),
	});

	useEffect(() => {
		const findTimeLeft = () => {
			const msLeft = new Date(order?.expiresAt) - new Date();
			setTimeLeft(Math.round(msLeft / 1000));
		};

		findTimeLeft();
		const timerId = setInterval(findTimeLeft, 1000);

		if (timeLeft < 0) {
			clearInterval(timerId);
		}
		return () => {
			// called when leaving the component or rerender
			clearInterval(timerId);
		};
	}, [order]);
	if (timeLeft < 0) {
		return <div>Order Expired</div>;
	}
	return (
		<div>
			Time left to pay: {timeLeft} seconds
			<StripeCheckout
				token={({ id }) => doRequest({ token: id })}
				stripeKey="pk_test_51IMeUwH8jfhs0V3TBsvrjG1W859w12Yk11MGZO4AW1sWzzql4s9hYYhQHyHR4C0jG38rVlHhAEyG5fR9VyE51y2S001V18CZCk"
				amount={order.ticket.price * 100}
				currency="GBP"
				email={currentUser.email}
			/>
			{errors}
		</div>
	);
};

OrderShow.getInitialProps = async (context, client) => {
	const { orderId } = context.query;
	const { data } = await client.get(`/api/orders/${orderId}`);

	return { order: data };
};
export default OrderShow;
