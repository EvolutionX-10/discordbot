import { Command } from '#lib/structures';
import { ApplicationCommandType } from 'discord.js';

export const command = new Command({
	type: ApplicationCommandType.User,
	commandRun(interaction) {
		return interaction.reply({ content: 'Ping!?', ephemeral: true });
	},
});
