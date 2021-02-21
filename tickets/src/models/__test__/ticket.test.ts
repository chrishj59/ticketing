import { Ticket } from '../ticket';

it('implememnts optimistic concurrency control', async (done) => {
	// create instance of the ticket

	const ticket = Ticket.build({
		title: 'concert',
		price: 2,
		userId: '1234',
	});

	// save ticket to DB
	await ticket.save();

	// fetch ticket twice

	const firstInstance = await Ticket.findById(ticket.id);
	const secondInstance = await Ticket.findById(ticket.id);
	// male 2 changes to ticket

	firstInstance!.set({ price: 10 });
	secondInstance!.set({ price: 100 });

	//save 1st fetched ticket
	await firstInstance!.save();

	//save 2nd fetched ticket --> outdated version number
	try {
		await secondInstance!.save();
	} catch (err) {
		return done();
	}

	throw new Error('Should not reach this point');
});

it('increments version number on mutiple saves ', async () => {
	const ticket = Ticket.build({ title: 'concert', price: 10, userId: '1234' });
	await ticket.save();

	expect(ticket.version).toEqual(0);
	await ticket.save();
	expect(ticket.version).toEqual(1);
	await ticket.save();
	expect(ticket.version).toEqual(2);
});
