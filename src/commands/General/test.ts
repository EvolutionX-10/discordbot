import { Command } from "#lib/structures";

export const command = new Command({
	type: 'message',
	messageRun(message, args) {
		return message.channel.send('lol');
	},
	
})