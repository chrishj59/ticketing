import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/buildClient';
import Header from '../components/header';

const TickettingApp = ({ Component, pageProps, currentUser }) => {
	return (
		<div>
			<Header currentUser={currentUser} />
			<div className="container">
				<Component currentUser={currentUser} {...pageProps} />
			</div>
		</div>
	);
};

TickettingApp.getInitialProps = async (appContext) => {
	const client = buildClient(appContext.ctx);
	const { data } = await client('/api/users/currentUser');
	let pageProps = {};
	if (appContext.Component.getInitialProps) {
		pageProps = await appContext.Component.getInitialProps(
			appContext.ctx,
			client,
			data.currentUser
		);
	}

	return { pageProps, ...data };
};

export default TickettingApp;
