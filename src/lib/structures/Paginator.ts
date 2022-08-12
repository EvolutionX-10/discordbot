import {
	ActionRowBuilder,
	APISelectMenuOption,
	ButtonBuilder,
	ButtonStyle,
	CommandInteraction,
	ComponentType,
	EmbedBuilder,
	Message,
	RestOrArray,
	SelectMenuBuilder,
	SelectMenuComponentOptionData,
	SelectMenuInteraction,
	SelectMenuOptionBuilder,
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
	public constructor(private readonly options: PaginatorOptions = {}) {
		if (!this.options.emojis) this.options.emojis = ['⏮', '◀', '⏹', '▶', '⏭'];
		if (this.options.embeds)
			this.options.embeds = this.options.embeds.map((embed, i) =>
				new EmbedBuilder(embed.data).setFooter({
					text: `Page ${i + 1}/${this.options.embeds!.length}`,
				})
			);
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

			return this.handleCollector(message, user ?? messageOrInteraction.author);
		} else if (messageOrInteraction instanceof CommandInteraction) {
			const message = await this.handleInteraction(
				messageOrInteraction,
				embeds,
				rows
			);
			return this.handleCollector(message, user ?? messageOrInteraction.user);
		}
	}

	private async handleMessage(
		message: Message,
		embeds: EmbedBuilder[],
		rows: (
			| ActionRowBuilder<SelectMenuBuilder>
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
			| ActionRowBuilder<SelectMenuBuilder>
			| ActionRowBuilder<ButtonBuilder>
		)[]
	) {
		let msg: Message<boolean>;
		if (interaction.replied) {
			msg = await interaction.editReply({
				embeds: [embeds![this.currentCount]],
				components: rows,
			});
		} else
			msg = await interaction.reply({
				embeds: [embeds![this.currentCount]],
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
			await i.deferUpdate();

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
					collector.stop();
					break;
				case '@paginator/forward':
					this.currentCount++;
					break;
				case '@paginator/last':
					this.currentCount =
						(this.descriptions ?? this.options.embeds!).length - 1;
					break;
				default:
					this.currentCount = parseInt((i as SelectMenuInteraction).values[0]);
			}

			if (this.currentCount < 0) this.currentCount = 0;
			if (
				this.currentCount >= (this.descriptions ?? this.options.embeds!).length
			) {
				this.currentCount =
					(this.descriptions ?? this.options.embeds!).length - 1;
			}

			await i.editReply({
				embeds: [embeds[this.currentCount]],
				components: i.message.components,
			});
		});

		collector.on('ignore', async (i) => {
			await i.reply({
				content:
					this.options.wrongInteractionResponse ?? 'You have been ignored',
				ephemeral: true,
			});
		});

		collector.on('end', async () => {
			if (message.components.length !== 0) {
				const components = message.components.map((c) =>
					new ActionRowBuilder<
						SelectMenuBuilder | ButtonBuilder
					>().setComponents(
						c.components.map((c) => {
							if (c.type === ComponentType.Button) {
								return new ButtonBuilder(c.data).setDisabled();
							} else return new SelectMenuBuilder(c.data).setDisabled();
						})
					)
				);

				await message
					.edit({
						embeds: message.embeds,
						components,
					})
					.catch(() => null);
			}
		});
	}

	private buildButtons() {
		const embeds = (this.options.embeds ?? this.descriptions)!;
		const buttons = [];
		const ids = ['first', 'back', 'stop', 'forward', 'last'];
		for (let i = 0; i < 5; i++) {
			const button = new ButtonBuilder()
				.setCustomId(`@paginator/${ids[i]}`)
				.setEmoji(this.options.emojis![i])
				.setDisabled(embeds.length === 1)
				.setStyle(ButtonStyle.Secondary);
			buttons.push(button);
		}
		const row = new ActionRowBuilder<ButtonBuilder>().setComponents(buttons);
		return row;
	}

	private buildSelect() {
		const pages = (this.options.embeds?.length ?? this.descriptions?.length)!;
		if (this.options.includeSelectMenu === false) return;
		const select = new SelectMenuBuilder()
			.setCustomId('@paginator/select')
			.setMaxValues(1)
			.setMinValues(1)
			.setDisabled(pages === 1)
			.setPlaceholder(`Navigate to page`)
			.setOptions(
				...(this.selectMenuOptions ??
					Array(pages)
						.fill(null)
						.map((_, i) => ({
							label: `Page ${i + 1}`,
							value: `${i}`,
						})))
			);
		const row = new ActionRowBuilder<SelectMenuBuilder>().setComponents(select);
		return row;
	}

	private buildEmbeds() {
		if (!this.descriptions) return;
		const defaultEmbed = new EmbedBuilder();
		const template = this.options.template ?? defaultEmbed;
		const embeds = Array(this.descriptions.length)
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
		if (
			this.options.includeSelectMenu &&
			(this.options.embeds?.length! > 25 || this.descriptions?.length! > 25)
		) {
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
