import { Command, Paginator } from '#lib/structures';
import { ApplicationCommandType, EmbedBuilder } from 'discord.js';
const strings = ['ok', 'bye', 'hi', 'hello', 'foo', 'bar'];
const template = new EmbedBuilder().setTitle('Pagination');

export const command = new Command({
	type: ApplicationCommandType.ChatInput,
	description: 'Enjoy Pagination',
	aliases: ['p'],
	messageRun(message) {
		const embeds = strings.map((x) =>
			new EmbedBuilder().setDescription(x).setColor('Random')
		);
		const pagination = new Paginator({ embeds });
		return pagination.run(message);
	},
	commandRun(interaction) {
		const pagination = new Paginator({
			template,
			ephemeral: true,
			time: 60_000,
		}).setDescriptions(strings);
		return pagination.run(interaction);
	},
});
