import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryotAsync = promisify(scrypt);

export class Password {
	static async tohash(password: string) {
		const salt = randomBytes(8).toString('hex');
		const buf = (await scryotAsync(password, salt, 64)) as Buffer;
		return `${buf.toString('hex')}.${salt}`;
	}
	static async compare(storedPassword: string, suppliedPassword: string) {
		const [hashedpassword, salt] = storedPassword.split('.');
		const buf = (await scryotAsync(suppliedPassword, salt, 64)) as Buffer;
		return buf.toString('hex') === hashedpassword;
	}
}
