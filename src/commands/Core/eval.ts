import { Command } from '#lib/structures';
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
} from 'discord.js';
import { inspect } from 'node:util';

export const command = new Command({
	type: ApplicationCommandType.ChatInput,
	description: 'Eval Some Code',
	ownerOnly: true,
	options: [
		{
			name: 'code',
			description: 'The code to evaluate',
			required: true,
			type: ApplicationCommandOptionType.String,
		},
	],
	async commandRun(interaction) {
		const code = interaction.options.getString('code', true);

		await interaction.deferReply();

		let result = await eval(code);

		if (typeof result !== 'string') {
			result = inspect(result);
		}

		return interaction.editReply({
			embeds: [
				{
					description: `\`\`\`js\n${result}\n\`\`\``,
				},
			],
		});
	},
});
