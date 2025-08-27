import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "@/types/user/user.type.js";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error(
        "JWT_SECRET environment variable is not defined. Please set it before starting the server."
    );
}
export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): Response | void => {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res
            .status(401)
            .json({ message: "Access Denied: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res
            .status(401)
            .json({ message: "Access Denied: Malformed token" });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as Omit<User, "password">;
        req.user = decoded;
        next();
    } catch (error) {
        return res
            .status(403)
            .json({ message: "Access Denied: Invalid token" });
    }
};
