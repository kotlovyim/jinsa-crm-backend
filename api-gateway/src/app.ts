import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import proxyRoutes from "./routes/index.js";

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use(proxyRoutes);

export default app;
