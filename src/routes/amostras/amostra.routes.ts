import { Router, Request, Response } from "express";
import { atualizarStatusAmostra, criarAmostra, obterAmostras } from "../../service";
import { StatusAmostra } from "@prisma/client";

const router = Router();

/**
 * @swagger
 * /amostras:
 *   post:
 *     summary: Cadastrar uma nova amostra
 *     tags: [Amostras]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [codigo, tipoAnalise, dataColeta]
 *             properties:
 *               codigo:
 *                 type: string
 *               tipoAnalise:
 *                 type: string
 *               dataColeta:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Amostra criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       409:
 *         description: Código duplicado
 */
router.post("/", async (req: Request, res: Response) => {
  const { codigo, tipoAnalise, dataColeta } = req.body;

  try {
    const amostra = await criarAmostra(codigo as string, tipoAnalise as string, dataColeta as Date);
    return res.status(201).json(amostra);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({
        error: "Já existe uma amostra com esse código",
      });
    }
    return res.status(400).json({
      error: "Erro interno ao criar amostra",
    });
  }
});

/**
 * @swagger
 * /amostras:
 *   get:
 *     summary: Listar amostras com filtros, ordenação e paginação
 *     tags: [Amostras]
 *     parameters:
 *       - in: query
 *         name: status
 *         description: Status da amostra
 *         schema:
 *           type: string
 *
 *       - in: query
 *         name: codigo
 *         description: Código da amostra
 *         schema:
 *           type: string
 *
 *       - in: query
 *         name: tipoAnalise
 *         description: Tipo de análise da amostra
 *         schema:
 *           type: string
 *
 *       - in: query
 *         name: dataInicio
 *         description: Data inicial para filtro (YYYY-MM-DD)
 *         schema:
 *           type: string
 *           format: date
 *
 *       - in: query
 *         name: dataFim
 *         description: Data final para filtro (YYYY-MM-DD)
 *         schema:
 *           type: string
 *           format: date
 *
 *       - in: query
 *         name: orderBy
 *         description: Campo para ordenação (dataColeta, codigo, status)
 *         schema:
 *           type: string
 *
 *       - in: query
 *         name: page
 *         description: Número da página
 *         schema:
 *           type: integer
 *           minimum: 1
 *
 *       - in: query
 *         name: limit
 *         description: Quantidade de registros por página
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *
 *     responses:
 *       200:
 *         description: Lista de amostras
 *       400:
 *         description: Parâmetros inválidos
 */
router.get("/", async (req: Request, res: Response) => {
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

  const [pageFinal, limitFinal, total, amostras] = await obterAmostras({
    status: status as string,
    codigo: codigo as string,
    tipoAnalise: tipoAnalise as string,
    dataInicio: dataInicio as string,
    dataFim: dataFim as string,
    orderBy: orderBy as string,
    page: page ? parseInt(page as string, 10) : undefined,
    limit: limit ? parseInt(limit as string, 10) : undefined,
  });
  return res.status(200).json({
    page: pageFinal,
    limit: limitFinal,
    total,
    data: amostras,
  });
});

/**
 * @swagger
 * /amostras/{codigo}/status:
 *   patch:
 *     summary: Atualiza o status de uma amostra
 *     description: >
 *       Atualiza o status de uma amostra seguindo o fluxo:
 *       pendente → em_analise → concluida → aprovada/rejeitada
 *     tags:
 *       - Amostras
 *     parameters:
 *       - in: path
 *         name: codigo
 *         required: true
 *         schema:
 *           type: string
 *         description: Código único da amostra
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - novoStatus
 *             properties:
 *               novoStatus:
 *                 type: string
 *                 enum:
 *                   - pendente
 *                   - em_analise
 *                   - concluida
 *                   - aprovada
 *                   - rejeitada
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso
 *         content:
 *           application/json:
 *       400:
 *         description: Transição inválida ou dados inválidos
 */
router.patch(":codigo/status", async (req: Request, res: Response) => {
  const { codigo } = req.params;
  const { novoStatus } = req.body;

  try {
    const amostraAtualizada = await atualizarStatusAmostra(codigo as string, novoStatus as StatusAmostra);
    return res.status(200).json(amostraAtualizada);
  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }

});
export default router;