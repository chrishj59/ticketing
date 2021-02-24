import mongoose from 'mongoose';
import { app } from './app';

const start = async () => {
<<<<<<< HEAD
	console.log('start up.........---- ');
	console.log('start up 2');
=======
	console.log('start up.....-- ');
>>>>>>> 0c118ea5ef69a1d18606244d6a5c5a595663f774

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
