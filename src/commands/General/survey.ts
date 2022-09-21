import { CommandType } from '#lib/enums';
import { Command, Prompt } from '#lib/structures';
import { Message } from 'discord.js';

const questions = [
	'How are you?',
	'How was your day?',
	'Do you find this prompt class useful?',
	'Final question, rate this class on a scale of 0-10',
];

export default new Command({
	type: CommandType.ChatInput,
	description: 'Survey time!',
	aliases: ['s'],
	async commandRun(interaction) {
		const message = await interaction.reply({
			content: 'starting the survey...',
			fetchReply: true,
		});

		return prompt(message);
	},
	async messageRun(message) {
		await message.reply({
			content: 'Starting the survey...',
			allowedMentions: { repliedUser: false },
		});
		return prompt(message);
	},
});

function prompt(message: Message) {
	new Prompt({ message, questions }).run().then((answers) => {
		if (!answers.length) return;

		return message.reply({
			content: `Survey Result\n${questions
				.map((q, i) => {
					const answer = answers[i] ?? 'No answer';
					return `**Q:** ${q}\n**A:** ${answer}`;
				})
				.join('\n\n')}`,
			allowedMentions: { repliedUser: false },
		});
	});
}
