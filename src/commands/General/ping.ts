import { CommandType } from '#lib/enums';
import { Command } from '#lib/structures';
import { ApplicationCommandOptionType } from 'discord.js';

export default new Command({
	type: CommandType.ChatInput,
	description: 'Ping Pong!!',
	options: [
		{
			name: 'pong',
			description: 'Pong!',
			type: ApplicationCommandOptionType.String,
			autocomplete: true,
			required: false,
		},
	],
	async commandRun(interaction) {
		return interaction.reply({ content: 'Pong!', ephemeral: true });
	},
	async messageRun(message) {
		return message.channel.send('Pong!');
	},
	async autoCompleteRun(interaction) {
		const focus = interaction.options.getFocused();
		const choices = ['pong', 'ping'];
		const filtered = choices.filter((choice) => choice.startsWith(focus));
		return interaction.respond(
			filtered.map((choice) => ({
				name: choice,
				value: choice,
			}))
		);
	},
});
