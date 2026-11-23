import { describe, expect, mock, test } from 'bun:test';
import { EventEmitter } from 'node:events';
import { Paginator } from '#lib/structures';
import {
	ActionRow,
	CommandInteraction,
	ComponentType,
	EmbedBuilder,
	MessageActionRowComponent,
	MessageFlags,
} from 'discord.js';

/** Offline interaction fixture: real discord.js component objects, mocked transport/collector. */
async function openPaginator() {
	const collector = Object.assign(new EventEmitter(), { resetTimer: mock(() => undefined) });
	const edit = mock(async () => undefined);
	const message = {
		components: [] as ActionRow<MessageActionRowComponent>[],
		createMessageComponentCollector: mock(() => collector),
		edit,
	};
	const reply = mock(async (options: { components: { toJSON(): object }[] }) => {
		// Construct received components without pretending the transport fixture is a real Message.
		message.components = options.components.map(
			(row) => Reflect.construct(ActionRow, [row.toJSON()]) as ActionRow<MessageActionRowComponent>,
		);
		return { interaction: { responseMessageId: 'response' } };
	});
	const source = {
		user: { id: 'owner' },
		replied: false,
		deferred: false,
		reply,
		channel: { messages: { cache: new Map([['response', message]]) } },
	};
	await new Paginator({ flags: MessageFlags.Ephemeral })
		.setDescriptions(['First page', 'Second page'])
		.run(source as unknown as CommandInteraction);
	return { collector, message, reply, edit };
}

describe('paginator compatibility', () => {
	test('forwards reply flags and updates real select-menu options when navigating', async () => {
		const { collector, message, reply } = await openPaginator();
		expect(reply.mock.calls[0][0]).toMatchObject({ flags: MessageFlags.Ephemeral, withResponse: true });
		const update = mock(
			async (_options: { embeds: EmbedBuilder[]; components: ActionRow<MessageActionRowComponent>[] }) => undefined,
		);
		const onCollect = collector.listeners('collect')[0];
		await onCollect({ customId: '@paginator/forward', message, update });
		expect(collector.resetTimer).toHaveBeenCalledTimes(1);
		const payload = update.mock.calls[0][0];
		expect(payload.embeds[0].data.description).toBe('Second page');
		const row = payload.components[1];
		expect(row.type).toBe(ComponentType.ActionRow);
		const select = row.components[0];
		if (select.type !== ComponentType.StringSelect) throw new Error('Expected a string select menu');
		expect(select.options.map((option) => option.default)).toEqual([false, true]);
	});

	test('removes controls when the collector ends', async () => {
		const { collector, edit } = await openPaginator();
		await collector.listeners('end')[0]();
		expect(edit).toHaveBeenCalledWith({ components: [] });
	});

	test('rejects an empty page set before attempting a reply', async () => {
		const reply = mock(async () => undefined);
		await expect(new Paginator().setDescriptions([]).run({ reply } as unknown as CommandInteraction)).rejects.toThrow(
			'No descriptions provided',
		);
		expect(reply).not.toHaveBeenCalled();
	});
});
