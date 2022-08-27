import { CommandType } from '#lib/enums';
import { Command, Paginator } from '#lib/structures';
import { EmbedBuilder } from 'discord.js';
const strings = ['ok', 'bye', 'hi', 'hello', 'foo', 'bar'];
const template = new EmbedBuilder().setTitle('Pagination');

export default new Command({
	type: CommandType.ChatInput,
	description: 'Enjoy Pagination',
	aliases: ['p'],
	async messageRun(message) {
		const embeds = strings.map((x) =>
			new EmbedBuilder().setDescription(x).setColor('Random')
		);
		const pagination = new Paginator({ embeds });
		return pagination.run(message);
	},
	async commandRun(interaction) {
		const pagination = new Paginator({
			template,
			ephemeral: true,
			time: 60_000,
		}).setDescriptions(strings);
		return pagination.run(interaction);
	},
});
