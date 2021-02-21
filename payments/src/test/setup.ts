import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../app';

declare global {
	namespace NodeJS {
		interface Global {
			signin(id?: string): string[];
		}
	}
}

jest.mock('../nats-wrapper');

process.env.STRIPE_KEY =
	'sk_test_51IMeUwH8jfhs0V3ToPmLXpACe2ij6bmkqUe3T2RsNmMCr4c8W87RmSf1Zd3y9atb8YoQcoLYq0rUQ0WTKKHjbhXT00JtTyMQxR';
let mongo: any;
beforeAll(async () => {
	jest.clearAllMocks();
	process.env.JWT_KEY = 'myKey';
	mongo = new MongoMemoryServer();
	const mongoUri = await mongo.getUri();

	await mongoose.connect(mongoUri, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
});

beforeEach(async () => {
	const collections = await mongoose.connection.db.collections();
	for (let collection of collections) {
		await collection.deleteMany({});
	}
});

afterAll(async () => {
	await mongo.stop();
	await mongoose.connection.close();
});

global.signin = (id?: string) => {
	// build JWT payload {id email}
	const payload = {
		id: id || new mongoose.Types.ObjectId().toHexString(),
		email: 'test@test.com',
	};
	// Create JWT
	const token = jwt.sign(payload, process.env.JWT_KEY!);

	// build session object
	const session = { jwt: token };

	// turn session into json
	const sessionJSON = JSON.stringify(session);
	// take session and encode as base64
	const base64 = Buffer.from(sessionJSON).toString('base64');
	// return a string with the cookie encoded data
	return [`express:sess=${base64}`];
};
