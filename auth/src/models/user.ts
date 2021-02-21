import mongoose from 'mongoose';
import { Password } from '../services/password';

// An inteerface that defines the properties required for a new user

interface UserAttrs {
	email: string;
	password: string;
}

// an interface that describes properties the User model has
interface UserModel extends mongoose.Model<UserDoc> {
	build(attrs: UserAttrs): UserDoc;
}

// interface for a User Document
interface UserDoc extends mongoose.Document {
	email: string;
	password: string;
}

const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
	},
	{
		toJSON: {
			transform(doc, ret) {
				ret.id = ret._id;
				delete ret._id;
				delete ret.password;
				//delete ret.__v;
			},
			versionKey: false,
		},
	}
);

userSchema.pre('save', async function (done) {
	if (this.isModified('password')) {
		const hashed = await Password.tohash(this.get('password'));
		this.set('password', hashed);
	}
	done();
});

//news.olympus-imaging.eu/go/9/49RGX6XC-3YCEZWR0-41E7BV47-GNBNTQ.html?rid=KOF8DI3-8BS18F8_1V74N4Y-P8VAU&bpid=651dd54d-8247-823e-e100-00000ae3fe28

http: userSchema.statics.build = (attrs: UserAttrs) => {
	return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
