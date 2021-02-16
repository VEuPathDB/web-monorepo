import { Session, NewSession } from "../types/session";
import {
  createJsonRequest,
  FetchClient,
} from "@veupathdb/web-common/lib/util/api";
import { type, voidType, string } from "io-ts";
import { ioTransformer } from "./ioTransformer";
export class SessionApi extends FetchClient {
  getSession(sessionId: string): Promise<Session> {
    return this.fetch(
      createJsonRequest({
        path: `/sessions/${sessionId}`,
        method: "GET",
        transformResponse: ioTransformer(Session),
      })
    );
  }
  createSession(session: NewSession): Promise<{ id: string }> {
    return this.fetch(
      createJsonRequest({
        path: `/sessions`,
        method: "POST",
        body: session,
        transformResponse: ioTransformer(type({ id: string })),
      })
    );
  }
  updateSession(session: Session): Promise<void> {
    return this.fetch(
      createJsonRequest({
        path: `/sessions/${session.id}`,
        method: "PUT",
        body: session,
        transformResponse: ioTransformer(voidType),
      })
    );
  }
  deleteSession(sessionId: string): Promise<void> {
    return this.fetch(
      createJsonRequest({
        path: `/sessions/${sessionId}`,
        method: "DELETE",
        body: { sessionId },
        transformResponse: ioTransformer(voidType),
      })
    );
  }
}
