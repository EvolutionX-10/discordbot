import { Message, User } from 'discord.js';

/**
 * Asks a sequence of text questions in one channel and collects one user's replies.
 * Requires message events, Message Content, and permission to send/read messages.
 * @example
 * ```ts
 * const answers = await new Prompt({ message, questions: ['How are you?'] }).run(user);
 * ```
 */
export class Prompt {
	/**
	 * Stores options and supplies a 60-second default timeout.
	 * @throws If questions is empty.
	 */
	public constructor(public readonly options: PromptOptions) {
		if (this.options.questions.length === 0) throw new Error('No valid questions to prompt!');

		this.options.time ??= 60_000;
	}

	/**
	 * Sends questions and starts a collector, resetting its timer after each answer.
	 * @param user Respondent; defaults to the source interaction user, then message author.
	 * @returns Answers in question order when complete or timed out; may be partial/empty.
	 * @throws If the initial channel is not sendable or sending the first question fails.
	 * Later async collector failures are not forwarded to this returned promise.
	 */
	public async run(user?: User) {
		const { message, time, questions, autoDelete } = this.options;

		if (message.interactionMetadata) {
			user ??= message.interactionMetadata.user;
		}

		user ??= message.author;
		const [q, ...rest] = questions;
		if (!message.channel.isSendable()) {
			throw new Error('Channel is not sendable');
		}
		await message.channel.send(typeof q === 'string' ? q : q!.question);

		const collector = message.channel.createMessageCollector({
			filter: (m) => m.author.id === user!.id,
			time: typeof q !== 'string' ? q!.time : time,
		});

		const answers: string[] = [];

		return new Promise<string[]>((resolve) => {
			collector.on('collect', async (m) => {
				if (!m.channel.isSendable()) {
					throw new Error('Channel is not sendable');
				}
				answers.push(m.content);
				if (autoDelete) await m.delete();
				const next = rest.shift();
				next
					? await m.channel.send(typeof next === 'string' ? next : next.question)
					: collector.stop('Collected All Answers');
				collector.resetTimer({
					time: typeof next !== 'string' ? next?.time : undefined,
				});
			});

			collector.on('end', async (c) => {
				if (!c.size) {
					if (!message.channel.isSendable()) {
						throw new Error('Channel is not sendable');
					}
					await message.channel.send('No response was recieved!');
				}
				resolve(answers);
			});
		});
	}
}

/** Configuration for a channel-based questionnaire. */
interface PromptOptions {
	/** Nonempty string questions or questions with per-question timeout values. */
	questions: string[] | Question[];
	/** Source message identifying the channel and default respondent. */
	message: Message;
	/** Default collector timeout in milliseconds for string questions; defaults to 60_000. */
	time?: number;
	/** Delete collected replies when true; requires permission to delete those messages. */
	autoDelete?: boolean;
}

/** Text and timeout for one step; its timeout is applied when that step starts. */
interface Question {
	question: string;
	time: number;
}
