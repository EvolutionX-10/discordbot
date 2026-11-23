import { describe, expect, test } from 'bun:test';
import { CommandType } from '#lib/enums';
import { Client, Command } from '#lib/structures';
import { handleListener, handleRegistry } from '#core';
import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';

describe('application command payloads', () => {
	test('preserves slash options, scope metadata, and permissions', () => {
		const options = [{ name: 'text', description: 'Text to echo', type: ApplicationCommandOptionType.String as const }];
		const command = new Command({
			type: CommandType.ChatInput,
			name: 'echo',
			description: 'Echo text',
			options,
			dmPermission: false,
			defaultMemberPermissions: 8n,
			commandRun: () => undefined,
		});
		expect(command.buildAPIApplicationCommand()).toEqual({
			type: ApplicationCommandType.ChatInput,
			name: 'echo',
			description: 'Echo text',
			options,
			dm_permission: false,
			default_member_permissions: '8',
		});
	});

	test.each([
		{ type: CommandType.User, apiType: ApplicationCommandType.User },
		{ type: CommandType.Message, apiType: ApplicationCommandType.Message },
	] as const)('omits slash-only fields for context menu $type', ({ type, apiType }) => {
		const command = new Command({ type, name: 'Inspect', commandRun: () => undefined });
		const payload = command.buildAPIApplicationCommand();
		expect(payload.type).toBe(apiType);
		expect(payload.name).toBe('Inspect');
		expect(payload).not.toHaveProperty('description');
		expect(payload).not.toHaveProperty('options');
	});

	test('rejects legacy registration and missing names', () => {
		const legacy = new Command({ type: CommandType.Legacy, name: 'say', messageRun: () => undefined });
		expect(() => legacy.buildAPIApplicationCommand()).toThrow('Legacy commands cannot be registered');
		const unnamed = new Command({ type: CommandType.ChatInput, description: 'Needs discovery' });
		expect(() => unnamed.buildAPIApplicationCommand()).toThrow('Command name is not set');
	});
});

test('Bun discovers all shipped commands/listeners and resolves the existing aliases without login', async () => {
	process.env.TEST_SERVER_ID ??= '123456789012345678';
	const client = new Client();
	try {
		expect(Bun.resolveSync('#root/index', process.cwd())).toBe(`${process.cwd()}/src/index.ts`);
		await Promise.all([handleRegistry(client), handleListener(client)]);
		expect([...client.commands.keys()].sort()).toEqual(['Save', 'eval', 'paginate', 'ping', 'pong', 'say', 'survey']);
		expect([...client.listener.keys()].sort()).toEqual(['applicationCommandRun', 'messageCommandRun']);
		expect(client.listenerCount('interactionCreate')).toBe(1);
		expect(client.listenerCount('messageCreate')).toBe(1);
		for (const command of client.commands.values()) {
			if (command.type !== CommandType.Legacy) expect(command.buildAPIApplicationCommand().name).toBe(command.name);
		}
		expect(client.commands.get('eval')?.ownerOnly).toBe(true);
		expect(client.commands.get('eval')?.guildIds).toEqual([process.env.TEST_SERVER_ID]);
	} finally {
		await client.destroy();
	}
});
