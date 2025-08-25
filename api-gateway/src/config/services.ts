import { ServiceRegistry } from "@/types/service/service-registry.type.js";

export const serviceRegistry: ServiceRegistry = {
    iam: process.env["IAM_SERVICE_URL"] || "http://localhost:3001",
    projects: process.env["PROJECT_SERVICE_URL"] || "http://localhost:3002",
    hr: process.env["HR_SERVICE_URL"] || "http://localhost:3003",
};
