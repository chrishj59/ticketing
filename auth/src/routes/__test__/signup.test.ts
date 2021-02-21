import request from 'supertest';
import { app } from '../../app';
it('returns 201 status on successful sigup', async () => {
	return request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'password',
		})
		.expect(201);
});

it('returns a 400 status with invalid email', async () => {
	return request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test',
			password: 'password',
		})
		.expect(400);
});
it('returns a 400 status with invalid password', async () => {
	return request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'p',
		})
		.expect(400);
});
it('returns a 400 status with missing emaul and password', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({ email: 'mytest@test.com' });
	return request(app)
		.post('/api/users/signup')
		.send({ password: 'password' })
		.expect(400);
});

it('disallows duplicate emails', async () => {
	await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'password',
		})
		.expect(201);
	await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test.com',
			password: 'password',
		})
		.expect(400);
});

it('Sets a cookie after successful signup', async () => {
	const response = await request(app)
		.post('/api/users/signup')
		.send({
			email: 'test@test1.com',
			password: 'password',
		})
		.expect(201);
	expect(response.get('Set-Cookie')).toBeDefined();
});
