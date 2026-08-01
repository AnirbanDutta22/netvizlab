import { AppError, CommandName, Result, SessionId } from "@netvizlab/shared";

export interface FeatureHandler<TRequest, TEvent> {
  readonly command: CommandName;
  start(
    sessionId: SessionId,
    request: TRequest,
    emit: (event: TEvent) => void,
  ): Result<void, AppError>;
  cancel(sessionId: SessionId): void;
}

export type AnyFeatureHandler = FeatureHandler<any, any>;

export class FeatureRegistry {
  private readonly handlers = new Map<CommandName, AnyFeatureHandler>();

  register(handler: AnyFeatureHandler): void {
    this.handlers.set(handler.command, handler);
  }

  get(command: CommandName): AnyFeatureHandler | undefined {
    return this.handlers.get(command);
  }
}
