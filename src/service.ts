import { Amostra, StatusAmostra } from "@prisma/client";
import { AmostraRepository } from "./infrastructure/repository/amostraRepository";
import prisma from "./lib/prisma";
export async function criarAmostra(codigo: string, tipoAnalise: string, dataColeta: Date) {
    if (!codigo || !tipoAnalise || !dataColeta) {
        throw new Error("codigo, tipoAnalise e dataColeta são obrigatórios");
    }
    const data = new Date(dataColeta);
    const hoje = new Date();
    if (isNaN(data.getTime())) {
        throw new Error("data coleta inválida");
    }

    if (data > hoje) {
        throw new Error("dataColeta não pode ser futura");
    }

    const amostraRepository = new AmostraRepository();

    const amostra = await amostraRepository.criar(codigo, tipoAnalise, data);
    return amostra;
}
export interface ObterAmostrasParams {
    status?: string;
    codigo?: string;
    tipoAnalise?: string;
    dataInicio?: string;
    dataFim?: string;
    orderBy?: string;
    page?: number;
    limit?: number;
}

export async function obterAmostras(params: ObterAmostrasParams) {
    const where: any = {};

    if (params.status) where.status = params.status as StatusAmostra;
    if (params.codigo) where.codigo = params.codigo as string;
    if (params.tipoAnalise) where.tipoAnalise = params.tipoAnalise as string;

    if (params.dataInicio || params.dataFim) {
        where.dataColeta = {};

        if (params.dataInicio) {
            where.dataColeta.gte = new Date(params.dataInicio as string);
        }

        if (params.dataFim) {
            where.dataColeta.lte = new Date(params.dataFim as string);
        }
    }

    let order: any = { dataColeta: "desc" };

    if (params.orderBy === "codigo") order = { codigo: "asc" };
    if (params.orderBy === "status") order = { status: "asc" };

    const pageNumber = Number(params.page);
    const limitNumber = Number(params.limit);
    const pageFinal = pageNumber > 0 ? pageNumber : 1;
    const limitFinal = limitNumber > 0 ? limitNumber : 5;

    const skip = (pageFinal - 1) * limitFinal;

    const amostraRepository = new AmostraRepository();
    const [amostras, total] = await Promise.all([
        amostraRepository.obter({
            where,
            orderBy: order,
            skip,
            take: limitFinal,
        }),
        amostraRepository.contar({ where }),
    ]);
    return [pageFinal, limitFinal, total, amostras];
}
export async function atualizarStatusAmostra(codigo: string, novoStatus: StatusAmostra) {
    if (!novoStatus) {
        throw new Error("novoStatus é obrigatório");
    }
    // return res.status(400).json({ error: "novoStatus é obrigatório" });


    if (!(novoStatus in StatusAmostra)) {
        throw new Error("Status inválido");
        //return res.status(400).json({ error: "Status inválido" });
    }

    const amostraRepository = new AmostraRepository();
    const amostra = await amostraRepository.obterPorCodigo(codigo) as Amostra;
    if (!amostra) {
        throw new Error("Amostra não encontrada");
        //return res.status(404).json({ error: "Amostra não encontrada" });
    }

    let transicaoValida = false;

    if (amostra.status === StatusAmostra.pendente) {
        transicaoValida = novoStatus === StatusAmostra.em_analise;
    }
    if (amostra.status === StatusAmostra.em_analise) {
        transicaoValida = novoStatus === StatusAmostra.concluida;
    }
    if (amostra.status === StatusAmostra.concluida) {
        transicaoValida =
            novoStatus === StatusAmostra.aprovada ||
            novoStatus === StatusAmostra.rejeitada;
    }
    if (
        amostra.status === StatusAmostra.aprovada ||
        amostra.status === StatusAmostra.rejeitada
    ) {
        transicaoValida = false;
    }
    if (!transicaoValida) {
        throw new Error(`Transição inválida de ${amostra.status} para ${novoStatus}`);
        /*return res.status(400).json({
          error: `Transição inválida de ${amostra.status} para ${novoStatus}`,
        });*/
    }

    const amostraAtualizada = await amostraRepository.atualizarStatus(codigo, novoStatus, amostra);

    return amostraAtualizada;
}