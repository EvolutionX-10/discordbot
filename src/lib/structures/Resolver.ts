import type { Snowflake } from 'discord-api-types/v10';
import {
	Collection,
	CommandInteraction,
	GuildBasedChannel,
	GuildMember,
	Role,
	User,
} from 'discord.js';

/**
 * It resolves mentions from the content of a command
 * @example
 * ```ts
 * const resolved = new Resolver(content, interaction);
 * console.log(resolved.users); // Collection [Map] of users
 * ```
 */
export class Resolver {
	public constructor(
		private readonly content: string,
		private readonly interaction: CommandInteraction
	) {}

	readonly #regex = {
		Channel: /<#(?<id>\d{17,20})>/g,
		Role: /<@&(?<id>\d{17,20})>/g,
		User: /<@!?(?<id>\d{17,20})>/g,
	};

	private getIds(mentionType: 'Channel' | 'Role' | 'User'): string[] {
		const matches = this.content.matchAll(this.#regex[mentionType]);
		return Array.from(matches)
			.map((match) => match.groups?.id)
			.filter(Boolean) as string[];
	}

	/**
	 * Resolves a user from the content.
	 * @returns The collection of resolved {@link User users}.
	 */
	public get users(): Readonly<Collection<Snowflake, User>> {
		const users = this.getIds('User')
			.map((id) => this.interaction.client.users.cache.get(id))
			.filter(Boolean)
			.map((u) => [u!.id, u]) as [Snowflake, User][];

		return new Collection<Snowflake, User>(users);
	}

	/**
	 * Resolves a member from the content.
	 * @returns The collection of resolved {@link GuildMember members}.
	 */
	public get members(): Readonly<Collection<Snowflake, GuildMember>> {
		const members = this.getIds('User')
			.map((id) => this.interaction.guild?.members.cache.get(id))
			.filter(Boolean)
			.map((m) => [m!.id, m]) as [Snowflake, GuildMember][];

		return new Collection<Snowflake, GuildMember>(members);
	}

	/**
	 * Resolves a channel from the content.
	 * @returns The collection of resolved {@link GuildBasedChannel channels}.
	 */
	public get channels(): Readonly<Collection<Snowflake, GuildBasedChannel>> {
		const channels = this.getIds('Channel')
			.map((id) => this.interaction.guild?.channels.cache.get(id))
			.filter(Boolean)
			.map((c) => [c!.id, c]) as [Snowflake, GuildBasedChannel][];

		return new Collection<Snowflake, GuildBasedChannel>(channels);
	}

	/**
	 * Resolves a role from the content.
	 * @returns The collection of resolved {@link Role roles}.
	 */
	public get roles(): Readonly<Collection<Snowflake, Role>> {
		const roles = this.getIds('Role')
			.map((id) => this.interaction.guild?.roles.cache.get(id))
			.filter(Boolean)
			.map((r) => [r!.id, r]) as [Snowflake, Role][];

		return new Collection<Snowflake, Role>(roles);
	}

	/**
	 * Resolves a url from the content.
	 * @returns The resolved url.
	 */
	public get url(): Readonly<URL> | null {
		try {
			return new URL(this.content);
		} catch {
			return null;
		}
	}

	/**
	 * Resolves a date from the content.
	 * @returns The resolved date.
	 */
	public get date(): Readonly<Date> | null {
		try {
			return new Date(this.content);
		} catch {
			return null;
		}
	}
}
