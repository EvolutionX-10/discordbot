import {
	ActionRow,
	ActionRowBuilder,
	APISelectMenuOption,
	APIStringSelectComponent,
	ButtonBuilder,
	ButtonStyle,
	CommandInteraction,
	EmbedBuilder,
	Message,
	MessageActionRowComponent,
	RestOrArray,
	SelectMenuComponentOptionData,
	SelectMenuOptionBuilder,
	StringSelectMenuBuilder,
	User,
} from 'discord.js';

export class Paginator {
	private currentCount: number = 0;
	private selectMenuOptions?: RestOrArray<
		| SelectMenuOptionBuilder
		| APISelectMenuOption
		| SelectMenuComponentOptionData
	>;
	private descriptions?: string[];

	public get pages() {
		return (this.options.embeds?.length ?? this.descriptions?.length)!;
	}

	public constructor(private readonly options: PaginatorOptions = {}) {
		this.options.emojis ??= ['⏮', '◀', '⏹', '▶', '⏭'];
		this.options.embeds &&= this.options.embeds.map((embed, i) =>
			new EmbedBuilder(embed.data).setFooter({
				text: `Page ${i + 1}/${this.options.embeds!.length}`,
			})
		);

		if (this.pages > 25) this.options.includeSelectMenu = false;
	}

	public setEmbeds(embeds: EmbedBuilder[]): this {
		this.options.embeds = embeds;
		return this;
	}

	public setDescriptions(descriptions: string[]): this {
		this.descriptions = descriptions;
		return this;
	}

	public setCurrentCount(count: number): this {
		this.currentCount = --count;
		return this;
	}

	public setSelectMenuOptions(
		...options: RestOrArray<
			| SelectMenuOptionBuilder
			| APISelectMenuOption
			| SelectMenuComponentOptionData
		>
	): this {
		this.selectMenuOptions = options;
		return this;
	}

	public async run(
		messageOrInteraction: Message | CommandInteraction,
		user?: User
	) {
		this.sanityChecks();

		const target = user
			? user
			: messageOrInteraction instanceof Message
			? messageOrInteraction.author
			: messageOrInteraction.user;

		const embeds = this.options.embeds ?? this.buildEmbeds()!;

		const rows = Boolean(this.buildSelect())
			? [this.buildButtons(), this.buildSelect()!]
			: [this.buildButtons()];

		if (messageOrInteraction instanceof Message) {
			const message = await this.handleMessage(
				messageOrInteraction,
				embeds,
				rows
			);

			return this.handleCollector(message, target);
		} else {
			const message = await this.handleInteraction(
				messageOrInteraction,
				embeds,
				rows
			);
			return this.handleCollector(message, target);
		}
	}

	private async handleMessage(
		message: Message,
		embeds: EmbedBuilder[],
		rows: (
			| ActionRowBuilder<StringSelectMenuBuilder>
			| ActionRowBuilder<ButtonBuilder>
		)[]
	) {
		const msg = await message.channel.send({
			embeds: [embeds![this.currentCount]],
			components: rows,
		});
		return msg;
	}

	private async handleInteraction(
		interaction: CommandInteraction,
		embeds: EmbedBuilder[],
		rows: (
			| ActionRowBuilder<StringSelectMenuBuilder>
			| ActionRowBuilder<ButtonBuilder>
		)[]
	) {
		let msg: Message<boolean>;
		if (interaction.replied || interaction.deferred) {
			msg = await interaction.editReply({
				embeds: [embeds[this.currentCount]],
				components: rows,
			});
		} else
			msg = await interaction.reply({
				embeds: [embeds[this.currentCount]],
				components: rows,
				fetchReply: true,
				ephemeral: Boolean(this.options.ephemeral),
			});
		return msg;
	}

	private handleCollector(message: Message, user: User) {
		const embeds = this.options.embeds ?? this.buildEmbeds()!;
		const collector = message.createMessageComponentCollector({
			time: this.options.time ?? 6_00_000,
			filter: (i) => i.user.id === user.id,
		});

		collector.on('collect', async (i) => {
			collector.resetTimer();

			switch (i.customId as ButtonIds) {
				case '@paginator/first':
					this.currentCount = 0;
					break;
				case '@paginator/back':
					this.currentCount--;
					break;
				case '@paginator/stop':
					i.message.components = [];
					break;
				case '@paginator/forward':
					this.currentCount++;
					break;
				case '@paginator/last':
					this.currentCount = this.pages - 1;
					break;
				default:
					if (!i.isStringSelectMenu()) return;
					this.currentCount = parseInt(i.values[0]);
			}

			if (this.currentCount < 0) this.currentCount = 0;
			if (this.currentCount >= this.pages) this.currentCount = this.pages - 1;

			await i.update({
				embeds: [embeds[this.currentCount]],
				components: i.message.components.length
					? this.buildSelect()
						? [this.buildButtons(), this.updateSelect(i.message.components)[1]]
						: [this.buildButtons()]
					: [],
			});

			if (i.message.components.length === 0) collector.stop();
		});

		collector.on('ignore', async (i) => {
			if (!this.options.wrongInteractionResponse) {
				const embeds = this.options.embeds ?? this.buildEmbeds()!;
				const components = Boolean(this.buildSelect())
					? [this.buildButtons(), this.buildSelect()!]
					: [this.buildButtons()];

				const msg = await i.reply({
					embeds: [embeds[this.currentCount]],
					components,
					ephemeral: true,
					fetchReply: true,
				});

				return this.handleCollector(msg, i.user);
			}
			await i.reply({
				content: this.options.wrongInteractionResponse,
				ephemeral: true,
			});
		});

		collector.on('end', async () => {
			await message.edit({ components: [] }).catch(() => null);
		});
	}

	private buildButtons() {
		const embeds = (this.options.embeds ?? this.descriptions)!;
		const buttons = [];
		const first = 0;
		const last = this.pages - 1;
		const ids = ['first', 'back', 'stop', 'forward', 'last'];
		for (let i = 0; i < 5; i++) {
			const button = new ButtonBuilder()
				.setCustomId(`@paginator/${ids[i]}`)
				.setEmoji(this.options.emojis![i])
				.setDisabled(
					embeds.length === 1 ||
						((i === 0 || i === 1) && first === this.currentCount) ||
						((i === 3 || i === 4) && last === this.currentCount)
				)
				.setStyle(ButtonStyle.Secondary);
			buttons.push(button);
		}
		const row = new ActionRowBuilder<ButtonBuilder>().setComponents(buttons);
		return row;
	}

	private buildSelect() {
		if (this.options.includeSelectMenu === false) return;
		const select = new StringSelectMenuBuilder()
			.setCustomId('@paginator/select')
			.setMaxValues(1)
			.setMinValues(1)
			.setDisabled(this.pages === 1)
			.setPlaceholder(`Navigate to page`)
			.setOptions(
				...(this.selectMenuOptions ??
					Array(this.pages)
						.fill(null)
						.map((_, i) => ({
							label: `Page ${i + 1}`,
							value: `${i}`,
							default: i === this.currentCount,
						})))
			);
		const row = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(select);
		return row;
	}

	private buildEmbeds() {
		if (!this.descriptions) return;
		const defaultEmbed = new EmbedBuilder();
		const template = this.options.template ?? defaultEmbed;
		const embeds = Array(this.pages)
			.fill(null)
			.map((_, i) => {
				const embed = new EmbedBuilder(template.data);
				embed.setDescription(this.descriptions![i]);
				!embed.data.color && embed.setColor('Random');
				embed.setFooter({
					text: `Page ${i + 1}/${this.descriptions!.length}`,
				});
				return embed;
			});
		return embeds;
	}

	private updateSelect(components: ActionRow<MessageActionRowComponent>[]) {
		const selectMenuOption = (
			components[1].components[0].data as APIStringSelectComponent
		).options;
		for (const option of selectMenuOption) {
			if (option.value === `${this.currentCount}`) option.default = true;
			else option.default = false;
		}
		return components;
	}

	private sanityChecks() {
		if (!this.options.embeds && !this.descriptions) {
			throw new Error('No embeds or descriptions provided');
		}
		if (this.options.embeds && this.options.template) {
			throw new Error('Cannot provide both embeds and template');
		}
		if (this.options.embeds && !this.options.embeds.length) {
			throw new Error('No embeds provided');
		}
		if (this.descriptions && !this.descriptions.length) {
			throw new Error('No descriptions provided');
		}
		if (this.options.template && !this.descriptions?.length) {
			throw new Error('No descriptions provided');
		}
		if (this.options.includeSelectMenu && this.pages > 25) {
			throw new Error('Too many pages to include select menu');
		}
	}
}

interface PaginatorOptions {
	time?: number;
	embeds?: EmbedBuilder[];
	template?: EmbedBuilder;
	includeSelectMenu?: boolean;
	emojis?: [string, string, string, string, string];
	wrongInteractionResponse?: string;
	ephemeral?: boolean;
}

type ButtonIds =
	| '@paginator/first'
	| '@paginator/back'
	| '@paginator/stop'
	| '@paginator/forward'
	| '@paginator/last';
