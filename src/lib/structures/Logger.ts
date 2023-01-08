import { LogLevel } from '#lib/enums';
import {
	blueBright,
	Color,
	cyanBright,
	gray,
	magentaBright,
	redBright,
	whiteBright,
	yellowBright,
	cyan,
} from 'colorette';

export class Logger {
	public constructor() {
		console.clear();
	}
	public setLevel(level: LogLevel): void {
		this.level = level;
	}
	public getLevel(): LogLevel {
		return this.level;
	}
	protected log(
		level: LogLevel,
		type: LogLevelString,
		color: Color,
		message: string,
		...args: unknown[]
	): void {
		if (level > this.level) return;
		const messages = message.split(/\n/);
		if (messages.length > 1)
			return messages.forEach((r) => this.log(level, type, color, r));

		console[type](
			`[${color(
				type
					.toUpperCase()
					.padStart(type.length + (7 - type.length) / 2)
					.padEnd(7)
			)}] - ${this.format(message, type)}`,
			...args
		);
	}
	public info(message: string, ...args: unknown[]): void {
		this.log(LogLevel.Info, 'info', cyanBright, message, ...args);
	}
	public warn(message: string, ...args: unknown[]): void {
		this.log(LogLevel.Warn, 'warn', yellowBright, message, ...args);
	}
	public error(message: string, ...args: unknown[]): void {
		this.log(LogLevel.Error, 'error', redBright, message, ...args);
	}
	public debug(message: string, ...args: unknown[]): void {
		this.log(LogLevel.Debug, 'debug', magentaBright, message, ...args);
	}
	private level: LogLevel = LogLevel.Info;

	private format(message: string, type: LogLevelString) {
		let words = message.split(' ');
		words = words.map((w) =>
			!isNaN(Number(w)) || w.match(/\d+m?s/gm) ? blueBright(w) : w
		);
		message = words.join(' ');
		message = message.replace(/\[.+ => \w+\s?\d?\]/, cyan);
		return type === 'debug' ? gray(message) : whiteBright(message);
	}
}

type LogLevelString = 'info' | 'warn' | 'error' | 'debug';
