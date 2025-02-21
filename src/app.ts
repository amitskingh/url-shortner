import express from "express";
import morgan from "morgan";

import aliasRouter from "./routes/route";
import analyticsRouter from "./routes/analyticsRoute";

const app = express();

app.use(morgan("dev"));
app.use(express.json());

app.use("/api/v1", aliasRouter);
app.use("/api/v1/analytics", analyticsRouter);

export default app;
