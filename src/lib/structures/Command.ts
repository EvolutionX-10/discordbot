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

/**
 * Defines an application command, message command, or both using typed handlers.
 * Default-export an instance from `src/commands/<category>/<name>.ts`.
 * @typeParam T Selects the interaction type and required handlers.
 * @example
 * ```ts
 * export default new Command({
 *   type: CommandType.ChatInput,
 *   description: 'Say hello',
 *   commandRun: (interaction) => interaction.reply('Hello!'),
 * });
 * ```
 */
export class Command<T extends CommandType = CommandType> {
	private data: CommandOptions<T>;
	/** Description used for slash command registration. */
	public description?: string;
	/** Command kind used by registration and handler inference. */
	public type: CommandType;
	/** Guild registration targets; an empty list means global registration. */
	public guildIds: string[] = [];
	/** Slash command options, including autocomplete configuration. */
	public options?: ApplicationCommandOptionData[] = [];
	/** Default Discord application-command member permissions, not a message-handler check. */
	public permissions?: PermissionResolvable | null;
	/** Legacy DM availability flag populated from dmPermission. */
	public runInDM?: boolean;
	/** Alternative names recognized only by the message dispatcher; defaults to an empty list. */
	public aliases?: string[];
	/** Restricts all supplied handlers to user IDs in client.ownerIds when true. */
	public ownerOnly?: boolean;
	/** Slash or context-menu handler; its argument follows the selected command type. */
	public commandRun?: (interaction: RunType[T]) => Awaitable<unknown>;
	/** Message handler receiving the source message and whitespace-separated arguments. */
	public messageRun?: (message: Message<boolean>, args: string[]) => Awaitable<unknown>;
	/** Responds to autocomplete requests for slash options configured with autocomplete. */
	public autoCompleteRun?: (interaction: AutocompleteInteraction) => Awaitable<unknown>;

	/**
	 * Stores command options without registering anything with Discord.
	 * @param data Handlers, permissions, and scope; discovery supplies an omitted name.
	 */
	public constructor(data: CommandOptions<T>) {
		this.data = data;
		this.type = data.type;
		this.aliases = data.aliases ?? [];
		this.commandRun = data.commandRun as ((interaction: RunType[T]) => Promise<unknown>) | undefined;
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

	/** Supplies a discovery name only when the options did not specify one. */
	public set name(name: string) {
		this.data.name = this.data.name ?? name;
	}

	/**
	 * Gets the configured or discovered name.
	 * @throws If read before a name is supplied.
	 */
	public get name(): string {
		if (!this.data.name) throw new Error('Command name is not set');
		return this.data.name;
	}

	/**
	 * Builds the raw registration payload used by the shortcut registry.
	 * Call after discovery has assigned a name; legacy commands are not API commands.
	 * This method serializes data only and performs no REST request.
	 * @returns The starter's application-command payload.
	 */
	public buildAPIApplicationCommand(): RESTPostAPIChatInputApplicationCommandsJSONBody {
		return {
			name: this.data.name!,
			description: this.description ?? '',
			default_member_permissions: this.permissions?.toString(),
			dm_permission: this.runInDM,
			options: this.options as AddUndefinedToPossiblyUndefinedPropertiesOfInterface<APIApplicationCommandOption[]>,
			type: this.type as unknown as AddUndefinedToPossiblyUndefinedPropertiesOfInterface<
				ApplicationCommandType.ChatInput | undefined
			>,
		};
	}
}

/** Shared command configuration; the generic selects the interaction callback type. */
interface BaseCommandOptions<T extends CommandType> {
	/** Application or legacy command kind. */
	type: T;
	/** Explicit name; otherwise the loader uses the filename. */
	name?: string;
	/** Additional message-command names, excluding prefixes. */
	aliases?: string[];
	description?: string;
	/** Default application-command permissions; does not authorize legacy handlers. */
	defaultMemberPermissions?: PermissionResolvable;
	/** Enables the dispatcher check against client.ownerIds. */
	ownerOnly?: boolean;
	/** Application interaction handler; required for context-menu command types. */
	commandRun?: (interaction: RunType[T]) => Awaitable<unknown>;
	/** Required for Legacy commands; optional alongside a slash/context-menu handler. */
	messageRun?: (message: Message<boolean>, args: string[]) => Awaitable<unknown>;
	/** Available only for ChatInput commands; pair it with an autocomplete-enabled option. */
	autoCompleteRun?: T extends CommandType.ChatInput
		? (interaction: AutocompleteInteraction) => Awaitable<unknown>
		: never;
}

/** Slash configuration requiring a description; options are optional. */
interface ChatInputCommandOptions extends BaseCommandOptions<CommandType.ChatInput> {
	description: string;
	options?: ApplicationCommandOptionData[];
	type: CommandType.ChatInput;
}

/** Global registration; dmPermission can disable DM availability. */
interface GlobalCommand {
	dmPermission?: false;
	guildIds?: never;
}

/** Guild registration; provide one or more guild IDs instead of dmPermission. */
interface GuildCommand {
	dmPermission?: never;
	guildIds?: NonEmptyArray;
}

/** Enforces required handlers and scope for each CommandType. */
type CommandOptions<T extends CommandType> = T extends CommandType.ChatInput
	? ChatInputCommandOptions & BaseCommand
	: T extends CommandType.Legacy
		? BaseCommandOptions<T> & Required<Pick<BaseCommandOptions<T>, 'messageRun'>> & BaseCommand
		: BaseCommandOptions<T> & Required<Pick<BaseCommandOptions<T>, 'commandRun'>> & BaseCommand;

type BaseCommand = GuildCommand | GlobalCommand;

type NonEmptyArray<T extends string = string> = [T, ...T[]];

interface RunType {
	[CommandType.ChatInput]: ChatInputCommandInteraction;
	[CommandType.Message]: MessageContextMenuCommandInteraction;
	[CommandType.User]: UserContextMenuCommandInteraction;
	[CommandType.Legacy]: never;
}
