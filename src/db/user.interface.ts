import { UserDocument, UserType } from "./schemas/user.schema";

export interface IUser {
    createUser(name: string, tgId: number): Promise<UserDocument>;
    findUserByName(name: string): Promise<UserType> | null;
    findUserById(id: string): Promise<UserType> | null;
    findUserByTgId(tgId: number): Promise<UserType> | null;
}
