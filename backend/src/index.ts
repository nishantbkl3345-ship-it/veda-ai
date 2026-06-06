import "dotenv/config";

import http from "http";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { Server as SocketIOServer } from "socket.io";

import { connectMongo } from "./db/mongo";
import { redis } from "./db/redis";
import { assignmentQueue } from "./queues/assignmentQueue";
import { initSockets } from "./sockets/index";
import "./workers";

const app: express.Express = express();
const server = http.createServer(app);

const PORT = parseInt(process.env.PORT || "4000", 10);
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(helmet());
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const io = new SocketIOServer(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

initSockets(io);

app.get("/", (_req, res) => {
  res.json({
    name: "VedaAI Assessment Creator API",
    version: "1.0.0",
    status: "running",
  });
});

app.get("/health", async (_req, res) => {
  const redisOk = redis.status === "ready";
  res.json({
    server: true,
    redis: redisOk,
    uptime: process.uptime(),
  });
});

import assignmentRouter from "./routes/assignment.routes";
app.use("/api/assignments", assignmentRouter);

async function bootstrap() {
  await connectMongo();
  await redis.ping();
  console.log("Redis connected successfully");

  void assignmentQueue;

  server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

if (process.env.NODE_ENV !== "test") {
  bootstrap().catch((err) => {
    console.error("Fatal startup error:", err);
    process.exit(1);
  });
}

const shutdown = async () => {
  console.log("Shutting down server gracefully");
  io.close();
  server.close();
  await redis.quit();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

export { app, server, io };

