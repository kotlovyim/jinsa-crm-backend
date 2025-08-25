import { User } from "../user/user.type";

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}
