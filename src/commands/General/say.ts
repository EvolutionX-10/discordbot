import { CommandType } from '#lib/enums';
import { Command } from '#lib/structures';

export default new Command({
	type: CommandType.Legacy,
	async messageRun(message, args) {
		if (!args.length)
			return message.reply("You didn't provide a message to say!");
		return message.channel.send(`You said: __${args.join(' ')}__`);
	},
});
