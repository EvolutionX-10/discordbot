import { Command } from '#lib/structures';

export const command = new Command({
	type: 'message',
	messageRun(message, args) {
		if (!args.length)
			return message.reply("You didn't provide a message to say!");
		return message.channel.send(`You said: __${args.join(' ')}__`);
	},
});
