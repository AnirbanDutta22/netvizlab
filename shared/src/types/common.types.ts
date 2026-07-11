export type CommandName = "ping";

export type SessionId = string & { readonly __brand: "SessionId" };

export const toSessionId = (val: string): SessionId => val as SessionId;
