import express, { Request, Response } from "express";

const app = express();

app.use(express.json());

app.get("/health", (req: Request, res: Response) => {
  return res.json({ status: "ok" });
});

export default app;
