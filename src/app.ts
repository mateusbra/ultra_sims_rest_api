import express, { Request, Response } from "express";
import prisma from "./lib/prisma";
import { StatusAmostra } from "@prisma/client";

const app = express();

app.use(express.json());

app.post("/amostras", async (req: Request, res: Response) => {
  const { codigo, tipoAnalise, dataColeta } = req.body;
  if (!codigo || !tipoAnalise || !dataColeta) {
    return res.status(400).json({
      error: "codigo, tipoAnalise e dataColeta são obrigatórios",
    });
  }
  const data = new Date(dataColeta);
  const hoje = new Date();
  if (isNaN(data.getTime())) {
    res.status(400).json({ error: "dataColeta inválida" });
  }

  if (data > hoje) {
    return res.status(400).json({ error: "dataColeta não pode ser futura" });
  }

  try {
    const amostra = await prisma.amostra.create({
      data: {
        codigo,
        tipoAnalise,
        dataColeta: data,
        status: StatusAmostra.pendente,
      },
    });
    return res.status(201).json(amostra);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({
        error: "Já existe uma amostra com esse código",
      });
    }

    return res.status(500).json({
      error: "Erro interno ao criar amostra",
    });
  }
});

app.get("/health", async (req: Request, res: Response) => {
  try {
    const totalAmostras = await prisma.amostra.count();

    return res.json({
      status: "ok",
      database: "connected",
      totalAmostras,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      database: "disconnected",
      error: "Erro ao conectar no banco",
    });
  }
});

app.get("/amostras", async (req: Request, res: Response) => {
  const {
    status,
    codigo,
    tipoAnalise,
    dataInicio,
    dataFim,
    orderBy,
    page,
    limit,
  } = req.query;

  const where: any = {};

  if (status) where.status = status as StatusAmostra;
  if (codigo) where.codigo = codigo as string;
  if (tipoAnalise) where.tipoAnalise = tipoAnalise as string;

  if (dataInicio || dataFim) {
    where.dataColeta = {};

    if (dataInicio) {
      where.dataColeta.gte = new Date(dataInicio as string);
    }

    if (dataFim) {
      where.dataColeta.lte = new Date(dataFim as string);
    }
  }

  let order: any = { dataColeta: "desc" };

  if (orderBy === "codigo") order = { codigo: "asc" };
  if (orderBy === "status") order = { status: "asc" };

  const pageNumber = Number(page);
  const limitNumber = Number(limit);

  const pageFinal = pageNumber > 0 ? pageNumber : 1;
  const limitFinal = limitNumber > 0 ? limitNumber : 5;

  const skip = (pageFinal - 1) * limitFinal;
  const [amostras, total] = await Promise.all([
    prisma.amostra.findMany({
      where,
      orderBy: order,
      skip,
      take: limitFinal,
    }),
    prisma.amostra.count({ where }),
  ]);
  return res.json({
    page: pageFinal,
    limit: limitFinal,
    total,
    data: amostras,
  });
});
export default app;
