import { CommandType } from '#lib/enums';
import {
	ApplicationCommandOptionData,
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	CommandInteraction,
	Message,
	MessageContextMenuCommandInteraction,
	PermissionResolvable,
	UserContextMenuCommandInteraction,
} from 'discord.js';

export class Command<T extends CommandType = CommandType> {
	private data: CommandOptions<T>;
	public description?: string;
	public type: CommandType;
	public guildIds: string | string[] = [];
	public options?: ApplicationCommandOptionData[] = [];
	public permissions?: PermissionResolvable;
	public runInDM?: boolean;
	public aliases?: string[];
	public ownerOnly?: boolean;
	public commandRun?: (interaction: RunType<T>) => Promise<void> | unknown;
	public messageRun?: (
		message: Message<boolean>,
		args: string[]
	) => Promise<void> | unknown;
	public autoCompleteRun?: (
		interaction: AutocompleteInteraction
	) => Promise<void> | unknown;

	public constructor(data: CommandOptions<T>) {
		this.data = data;
		this.type = data.type;
		this.aliases = data.aliases ?? [];
		this.commandRun = data.commandRun as
			| ((interaction: RunType<T>) => Promise<void> | unknown)
			| undefined;
		this.messageRun = data.messageRun;
		this.autoCompleteRun = data.autoCompleteRun;
		this.permissions = data.defaultMemberPermissions ?? 0n;
		this.runInDM = data.dmPermission ?? undefined;
		this.ownerOnly = data.ownerOnly ?? undefined;

		if (data.type === CommandType.ChatInput) {
			this.description = (data as ChatInputCommandOptions).description;
			this.options = (data as ChatInputCommandOptions).options;
		}

		if (typeof this.data.guildIds === 'string') {
			this.data.guildIds = [this.data.guildIds];
		}

		this.guildIds = this.data.guildIds ?? []; // Keep it empty for global commands
	}

	public set name(name: string) {
		this.data.name = this.data.name ?? name;
	}

	public get name(): string {
		if (!this.data.name) throw new Error('Command name is not set');
		return this.data.name;
	}
}

interface BaseCommandOptions<T extends CommandType> {
	type: T;
	name?: string;
	guildIds?: string | string[];
	aliases?: string[];
	description?: string;
	defaultMemberPermissions?: PermissionResolvable;
	dmPermission?: boolean;
	ownerOnly?: boolean;
	commandRun?: T extends CommandType.Legacy
		? never
		: (interaction: RunType<T>) => Promise<void> | unknown;
	messageRun?: (
		message: Message<boolean>,
		args: string[]
	) => Promise<void> | unknown;
	autoCompleteRun?: T extends CommandType.ChatInput
		? (interaction: AutocompleteInteraction) => Promise<void> | unknown
		: never;
}

interface ChatInputCommandOptions
	extends BaseCommandOptions<CommandType.ChatInput> {
	description: string;
	options?: ApplicationCommandOptionData[];
	type: CommandType.ChatInput;
}

type CommandOptions<T extends CommandType> = T extends CommandType.ChatInput
	? ChatInputCommandOptions
	: T extends CommandType.Legacy
	? BaseCommandOptions<T> & Required<Pick<BaseCommandOptions<T>, 'messageRun'>>
	: BaseCommandOptions<T> & Required<Pick<BaseCommandOptions<T>, 'commandRun'>>;

type RunType<T extends CommandType> = T extends CommandType.ChatInput
	? ChatInputCommandInteraction
	: T extends CommandType.Message
	? MessageContextMenuCommandInteraction
	: T extends CommandType.User
	? UserContextMenuCommandInteraction
	: never;
