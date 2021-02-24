import mongoose from 'mongoose';
import { app } from './app';

const start = async () => {
	console.log('start up.........---- ');

	try {
		if (!process.env.JWT_KEY) {
			throw new Error('JWT_KEY must be defined');
		}

		if (!process.env.MONGO_URI) {
			throw new Error('MONGO_URI must be defined');
		}
		await mongoose.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useCreateIndex: true,
		});
		console.log('Connected to Mongo');
	} catch (e) {
		console.error(e);
	}

	app.listen(3000, () => {
		console.log('Auth listening on 3000!');
	});
};

start();
