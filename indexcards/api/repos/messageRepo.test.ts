import messageRepo from './messageRepo.js';
import factories from '../../tests/factories/index.js';
import { db } from '../../api/data/database.js';

describe('messageRepo',() =>{
	describe('getMessage',() =>{
		it('returns a specific message for a specific person', async () => {
			const Person = await factories.person.create();
			const Message = await factories.message.create({ person: Person.id });
			const message = await messageRepo.getMessage(db, Message.id, Person.id);
			expect(message).not.toBeNull();
			expect(message?.id).toBe(Message.id);
		});
		it('returns null for a message that does not belong to the person', async () => {
			const Person1 = await factories.person.create();
			const Person2 = await factories.person.create();
			const Message = await factories.message.create({ person: Person1.id });
			const message = await messageRepo.getMessage(db, Message.id, Person2.id);
			expect(message).toBeUndefined();
		});
		it('returns null for a message that does not exist', async () => {
			const Person = await factories.person.create();
			const message = await messageRepo.getMessage(db, 9999, Person.id);
			expect(message).toBeUndefined();
		});
		it('returns a message when no person is specified', async () => {
			const Person = await factories.person.create();
			const Message = await factories.message.create({ person: Person.id });
			const message = await messageRepo.getMessage(db, Message.id);
			expect(message).not.toBeNull();
			expect(message?.id).toBe(Message.id);
		});
	});
	describe('getMessages',() =>{
		it('returns all messages for a specific person', async () => {
			const Person = await factories.person.create();
			await factories.message.create({ person: Person.id });
			await factories.message.create({ person: Person.id });
			const messages = await messageRepo.getMessages(db, Person.id);
			expect(messages.length).toBe(2);
		});
	});
});
