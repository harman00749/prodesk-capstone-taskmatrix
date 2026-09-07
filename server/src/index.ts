import "dotenv/config";
import { createServer } from "node:http";
import { createApp } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { getEnv } from "./config/env.js";

async function start(): Promise<void> {
  const { PORT } = getEnv();

  try {
    await connectDatabase();
    const server = createServer(createApp());

    server.listen(PORT, () => {
      console.info(`TaskMatrix API listening on port ${PORT}.`);
    });

    const shutdown = async (signal: string) => {
      console.info(`${signal} received. Closing TaskMatrix API.`);
      server.close(async () => {
        await disconnectDatabase();
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => void shutdown("SIGTERM"));
    process.on("SIGINT", () => void shutdown("SIGINT"));
  } catch (error) {
    console.error("TaskMatrix API failed to start.", error);
    process.exit(1);
  }
}

void start();
