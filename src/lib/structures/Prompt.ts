import { Message, User } from 'discord.js';

export class Prompt {
	public constructor(public readonly options: PromptOptions) {
		if (this.options.questions.length === 0)
			throw new Error('No valid questions to prompt!');

		this.options.time ??= 60_000;
	}

	public async run(user?: User) {
		const { message, time, questions, autoDelete } = this.options;

		if (message.interaction) {
			user ??= message.interaction.user;
		}

		user ??= message.author;
		const [q, ...rest] = questions;
		await message.channel.send(typeof q === 'string' ? q : q!.question);

		const collector = message.channel.createMessageCollector({
			filter: (m) => m.author.id === user!.id,
			time: typeof q !== 'string' ? q!.time : time,
		});

		const answers: string[] = [];

		return new Promise<string[]>((resolve) => {
			collector.on('collect', async (m) => {
				answers.push(m.content);
				if (autoDelete) await m.delete();
				const next = rest.shift();
				next
					? await m.channel.send(
							typeof next === 'string' ? next : next.question
					  )
					: collector.stop('Collected All Answers');
				collector.resetTimer({
					time: typeof next !== 'string' ? next?.time : undefined,
				});
			});

			collector.on('end', async (c) => {
				if (!c.size) {
					await message.channel.send('No response was recieved!');
				}
				resolve(answers);
			});
		});
	}
}

interface PromptOptions {
	questions: string[] | Question[];
	message: Message;
	time?: number;
	autoDelete?: boolean;
}

interface Question {
	question: string;
	time: number;
}
