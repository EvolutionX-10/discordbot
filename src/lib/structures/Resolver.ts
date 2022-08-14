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

	/**
	 * Resolves a user from the content.
	 * @returns The collection of resolved {@link User users}.
	 */
	public get users(): Readonly<Collection<Snowflake, User>> {
		const collection = new Collection<Snowflake, User>();
		const regex = /<@!?(?<id>\d{17,20})>/g;

		const matches = this.content.matchAll(regex);
		const ids = Array.from(matches)
			.map((match) => match.groups?.id)
			.filter((e) => !!e) as string[];
		for (const id of ids) {
			const user = this.interaction.client.users.cache.get(id);
			if (user) {
				collection.set(id, user);
			}
		}
		return collection;
	}

	/**
	 * Resolves a member from the content.
	 * @returns The collection of resolved {@link GuildMember members}.
	 */
	public get members(): Readonly<Collection<Snowflake, GuildMember>> {
		const collection = new Collection<Snowflake, GuildMember>();
		const regex = /<@!?(?<id>\d{17,20})>/g;

		const matches = this.content.matchAll(regex);
		const ids = Array.from(matches)
			.map((match) => match.groups?.id)
			.filter((e) => !!e) as string[];
		for (const id of ids) {
			const member = this.interaction.guild?.members.cache.get(id);
			if (member) {
				collection.set(id, member);
			}
		}
		return collection;
	}

	/**
	 * Resolves a channel from the content.
	 * @returns The collection of resolved {@link GuildBasedChannel channels}.
	 */
	public get channels(): Readonly<Collection<Snowflake, GuildBasedChannel>> {
		const collection = new Collection<Snowflake, GuildBasedChannel>();
		const regex = /<#(?<id>\d{17,20})>/g;

		const matches = this.content.matchAll(regex);
		const ids = Array.from(matches)
			.map((match) => match.groups?.id)
			.filter((e) => !!e) as string[];
		for (const id of ids) {
			const channel = this.interaction.guild?.channels.cache.get(id);
			if (channel) {
				collection.set(id, channel);
			}
		}
		return collection;
	}

	/**
	 * Resolves a role from the content.
	 * @returns The collection of resolved {@link Role roles}.
	 */
	public get roles(): Readonly<Collection<Snowflake, Role>> {
		const collection = new Collection<Snowflake, Role>();
		const regex = /<@&(?<id>\d{17,20})>/g;

		const matches = this.content.matchAll(regex);
		const ids = Array.from(matches)
			.map((match) => match.groups?.id)
			.filter((e) => !!e) as string[];
		for (const id of ids) {
			const role = this.interaction.guild?.roles.cache.get(id);
			if (role) {
				collection.set(id, role);
			}
		}
		return collection;
	}
}
