import express from "express";
import morgan from "morgan";

import aliasRouter from "./routes/aliasRoute";
import analyticsRouter from "./routes/analyticsRoute";

const createServer = () => {
  const app = express();
  return app;
};

const app = createServer();

app.use(morgan("dev"));
app.use(express.json());

app.use("/api/v1", aliasRouter);
app.use("/api/v1/analytics", analyticsRouter);

export { createServer, app };
