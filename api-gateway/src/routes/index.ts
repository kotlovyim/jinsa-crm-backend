import { Router, type Request, type Response } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { serviceRegistry } from "../config/services.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import type { ClientRequest } from "http";

const router = Router();

const publicPaths = [
    "/iam/auth/register",
    "/iam/auth/login",
    "/iam/auth/verify-email",
];

router.use((req, res, next) => {
    if (publicPaths.some((path) => req.path.startsWith(path))) {
        return next();
    }
    return authMiddleware(req, res, next);
});

for (const serviceName in serviceRegistry) {
    const path = `/${serviceName}`;
    const target = serviceRegistry[serviceName];

    const proxyOptions = {
        target,
        changeOrigin: true,
        pathRewrite: {
            [`^${path}`]: "",
        },
        on: {
            proxyReq: (
                proxyReq: ClientRequest,
                req: Request,
                _res: Response
            ) => {
                if (req.user) {
                    proxyReq.setHeader("X-User-Id", req.user.id);
                    proxyReq.setHeader("X-Company-Id", req.user.companyId);
                }
            },
        },
    };

    router.use(path, createProxyMiddleware(proxyOptions));
}

export default router;
