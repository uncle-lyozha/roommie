import { TSession } from "./schemas/session.schema";

export interface ISession {
    createSession(type: string, id: string, option: string): Promise<string>;
    findSessionById(id: string): Promise<TSession>;
    deleteSession(id: string): Promise<void>;
}
