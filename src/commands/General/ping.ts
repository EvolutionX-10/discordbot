import { Command } from '#lib/structures';
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
} from 'discord.js';

export const command = new Command({
	type: ApplicationCommandType.ChatInput,
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
	commandRun(interaction) {
		interaction.reply({ content: 'Pong!', ephemeral: true });
	},
	messageRun(message) {
		message.channel.send('Pong!');
	},
	autoCompleteRun(interaction) {
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
