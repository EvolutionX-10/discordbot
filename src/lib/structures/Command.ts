import {
	ApplicationCommandOptionData,
	ApplicationCommandType,
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	CommandInteraction,
	Message,
	MessageContextMenuCommandInteraction,
	PermissionResolvable,
	UserContextMenuCommandInteraction,
} from 'discord.js';

export class Command<T extends ApplicationCommandType | string = ''> {
	private data: CommandOptions<T>;
	public description?: string;
	public type: ApplicationCommandType | string;
	public guildIds: string | string[] = [];
	public options: ApplicationCommandOptionData[];
	public permissions?: PermissionResolvable;
	public runInDM?: boolean;
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
		this.options = data.options ?? [];
		this.commandRun = data.commandRun as any;
		this.messageRun = data.messageRun;
		this.autoCompleteRun = data.autoCompleteRun;
		this.permissions = data.defaultMemberPermissions;
		this.runInDM = data.dmPermission ?? undefined;
		this.ownerOnly = data.ownerOnly ?? undefined;

		if (data.type === ApplicationCommandType.ChatInput) {
			this.description = (data as ChatInputCommandOptions).description;
		}

		if (typeof this.data.guildIds === 'string') {
			this.data.guildIds = [this.data.guildIds];
		}

		this.guildIds = this.data.guildIds ?? ['991194621763919971']; // Keep it empty for global commands
	}

	public set name(name: string) {
		this.data.name = this.data.name ?? name;
	}

	public get name(): string {
		if (!this.data.name) throw new Error('Command name is not set');
		return this.data.name;
	}
}

interface BaseCommandOptions<T extends ApplicationCommandType | string> {
	type: T;
	name?: string;
	options?: T extends ApplicationCommandType.ChatInput
		? ApplicationCommandOptionData[]
		: never;
	guildIds?: string | string[];
	defaultMemberPermissions?: PermissionResolvable;
	dmPermission?: boolean;
	ownerOnly?: boolean;
	commandRun?: (interaction: RunType<T>) => Promise<void> | unknown;
	messageRun?: (
		message: Message<boolean>,
		args: string[]
	) => Promise<void> | unknown;
	autoCompleteRun?: (
		interaction: AutocompleteInteraction
	) => Promise<void> | unknown;
}

interface ChatInputCommandOptions
	extends BaseCommandOptions<ApplicationCommandType.ChatInput> {
	description: string;
	type: ApplicationCommandType.ChatInput;
}

type CommandOptions<T extends ApplicationCommandType | string> =
	T extends ApplicationCommandType.ChatInput
		? ChatInputCommandOptions
		: BaseCommandOptions<T>;

type RunType<T extends ApplicationCommandType | string> =
	T extends ApplicationCommandType.ChatInput
		? ChatInputCommandInteraction
		: T extends ApplicationCommandType.Message
		? MessageContextMenuCommandInteraction
		: T extends ApplicationCommandType.User
		? UserContextMenuCommandInteraction
		: CommandInteraction;
