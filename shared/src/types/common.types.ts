export type CommandName = "ping";

export type SessionId = string & { readonly __brand: "SessionId" };

export const toSessionId = (val: string): SessionId => val as SessionId;

export interface StreamEnvelope<TPayload> {
  readonly sessionId: SessionId;
  readonly command: CommandName;
  readonly timestamp: number;
  readonly payload: TPayload;
}
