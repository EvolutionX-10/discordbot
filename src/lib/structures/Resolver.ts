import {
	Collection,
	CommandInteraction,
	GuildBasedChannel,
	GuildMember,
	Role,
	User,
} from 'discord.js';
import type { Snowflake } from 'discord-api-types/v10';

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
			.filter(Boolean) as User[];

		return new Collection<Snowflake, User>(
			Array.from(users).map((user) => [user.id, user])
		);
	}

	/**
	 * Resolves a member from the content.
	 * @returns The collection of resolved {@link GuildMember members}.
	 */
	public get members(): Readonly<Collection<Snowflake, GuildMember>> {
		const members = this.getIds('User')
			.map((id) => this.interaction.guild?.members.cache.get(id))
			.filter(Boolean) as GuildMember[];

		return new Collection<Snowflake, GuildMember>(
			Array.from(members).map((member) => [member.id, member])
		);
	}

	/**
	 * Resolves a channel from the content.
	 * @returns The collection of resolved {@link GuildBasedChannel channels}.
	 */
	public get channels(): Readonly<Collection<Snowflake, GuildBasedChannel>> {
		const channels = this.getIds('User')
			.map((id) => this.interaction.guild?.channels.cache.get(id))
			.filter(Boolean) as GuildBasedChannel[];

		return new Collection<Snowflake, GuildBasedChannel>(
			Array.from(channels).map((channel) => [channel.id, channel])
		);
	}

	/**
	 * Resolves a role from the content.
	 * @returns The collection of resolved {@link Role roles}.
	 */
	public get roles(): Readonly<Collection<Snowflake, Role>> {
		const roles = this.getIds('Role')
			.map((id) => this.interaction.guild?.roles.cache.get(id))
			.filter(Boolean) as Role[];

		return new Collection<Snowflake, Role>(
			Array.from(roles).map((role) => [role.id, role])
		);
	}
}
