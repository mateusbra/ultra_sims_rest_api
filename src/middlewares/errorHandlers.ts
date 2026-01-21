import { Prisma } from "@prisma/client";
import { AppError } from "../errors/AppError";
import { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, req :Request, res: Response, next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      return res.status(409).json({
        error: "Registro duplicado",
      });
    }

    if (err.code === "P2025") {
      return res.status(404).json({
        error: "Registro não encontrado",
      });
    }
  }

  return res.status(500).json({
    error: "Erro interno do servidor",
  });
}
