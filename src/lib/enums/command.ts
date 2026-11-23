/** Application command kinds plus the local-only Legacy message-command kind. */
export const enum CommandType {
	/** Slash command interaction. */
	ChatInput = 1,
	/** User context-menu interaction. */
	User = 2,
	/** Message context-menu interaction. */
	Message = 3,
	/** Prefix-triggered message command; never registered with Discord. */
	Legacy = 4,
}
