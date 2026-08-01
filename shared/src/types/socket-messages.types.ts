import { PingRequestDto } from "./ping.types.js";

export type ClientMessage =
  | {
      readonly type: "ping:start";
      readonly sessionId: string;
      readonly request: PingRequestDto;
    }
  | { readonly type: "session:cancel"; readonly sessionId: string };
