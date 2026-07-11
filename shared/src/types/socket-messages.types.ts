import { PingRequestDto } from "./ping.types";

export type ClientMessage = {
  readonly type: "ping:start";
  readonly sessionId: string;
  readonly request: PingRequestDto;
};
