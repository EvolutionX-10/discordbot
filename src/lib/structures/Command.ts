import { CommandType } from '#lib/enums';
import { AddUndefinedToPossiblyUndefinedPropertiesOfInterface } from 'discord-api-types/utils/internals';
import {
	ApplicationCommandOptionData,
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	Message,
	MessageContextMenuCommandInteraction,
	PermissionResolvable,
	UserContextMenuCommandInteraction,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	APIApplicationCommandOption,
	ApplicationCommandType,
	Awaitable,
} from 'discord.js';

export class Command<T extends CommandType = CommandType> {
	private data: CommandOptions<T>;
	public description?: string;
	public type: CommandType;
	public guildIds: string[] = [];
	public options?: ApplicationCommandOptionData[] = [];
	public permissions?: PermissionResolvable | null;
	public runInDM?: boolean;
	public aliases?: string[];
	public ownerOnly?: boolean;
	public commandRun?: (interaction: RunType[T]) => Awaitable<unknown>;
	public messageRun?: (
		message: Message<boolean>,
		args: string[]
	) => Awaitable<unknown>;
	public autoCompleteRun?: (
		interaction: AutocompleteInteraction
	) => Awaitable<unknown>;

	public constructor(data: CommandOptions<T>) {
		this.data = data;
		this.type = data.type;
		this.aliases = data.aliases ?? [];
		this.commandRun = data.commandRun as
			| ((interaction: RunType[T]) => Promise<unknown>)
			| undefined;
		this.messageRun = data.messageRun;
		this.autoCompleteRun = data.autoCompleteRun;
		this.permissions = data.defaultMemberPermissions ?? null;
		this.runInDM = data.dmPermission;
		this.ownerOnly = data.ownerOnly;

		if (data.type === CommandType.ChatInput) {
			this.description = (data as ChatInputCommandOptions).description;
			this.options = (data as ChatInputCommandOptions).options;
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

	public buildAPIApplicationCommand(): RESTPostAPIChatInputApplicationCommandsJSONBody {
		return {
			name: this.data.name!,
			description: this.description ?? '',
			default_member_permissions: this.permissions?.toString(),
			dm_permission: this.runInDM,
			options: this
				.options as AddUndefinedToPossiblyUndefinedPropertiesOfInterface<
				APIApplicationCommandOption[]
			>,
			type: this
				.type as unknown as AddUndefinedToPossiblyUndefinedPropertiesOfInterface<
				ApplicationCommandType.ChatInput | undefined
			>,
		};
	}
}

interface BaseCommandOptions<T extends CommandType> {
	type: T;
	name?: string;
	aliases?: string[];
	description?: string;
	defaultMemberPermissions?: PermissionResolvable;
	ownerOnly?: boolean;
	commandRun?: (interaction: RunType[T]) => Awaitable<unknown>;
	messageRun?: (message: Message<boolean>, args: string[]) => Awaitable<unknown>;
	autoCompleteRun?: T extends CommandType.ChatInput
		? (interaction: AutocompleteInteraction) => Awaitable<unknown>
		: never;
}

interface ChatInputCommandOptions
	extends BaseCommandOptions<CommandType.ChatInput> {
	description: string;
	options?: ApplicationCommandOptionData[];
	type: CommandType.ChatInput;
}

interface GlobalCommand {
	dmPermission?: false;
	guildIds?: never;
}

interface GuildCommand {
	dmPermission?: never;
	guildIds?: NonEmptyArray;
}

type CommandOptions<T extends CommandType> = T extends CommandType.ChatInput
	? ChatInputCommandOptions & BaseCommand
	: T extends CommandType.Legacy
	? BaseCommandOptions<T> &
			Required<Pick<BaseCommandOptions<T>, 'messageRun'>> &
			BaseCommand
	: BaseCommandOptions<T> &
			Required<Pick<BaseCommandOptions<T>, 'commandRun'>> &
			BaseCommand;

type BaseCommand = GuildCommand | GlobalCommand;

type NonEmptyArray<T extends string = string> = [T, ...T[]];

interface RunType {
	[CommandType.ChatInput]: ChatInputCommandInteraction;
	[CommandType.Message]: MessageContextMenuCommandInteraction;
	[CommandType.User]: UserContextMenuCommandInteraction;
	[CommandType.Legacy]: never;
}
