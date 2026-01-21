import { Amostra, StatusAmostra } from "@prisma/client";
import prisma from "../../lib/prisma";
interface ObterAmostrasParams {
    where: any,
    orderBy: any,
    skip: number,
    take: number,
}
export class AmostraRepository {
    async criar(codigo: string, tipoAnalise: string, dataColeta: Date) {
        return prisma.amostra.create({
            data: {
                codigo,
                tipoAnalise,
                dataColeta,
                status: StatusAmostra.pendente,
            },
        });
    }

    async obter(params: ObterAmostrasParams) {
        return prisma.amostra.findMany(params);
    }
    async contar(where: any) {
        return prisma.amostra.count({ where });
    }
    async obterPorCodigo(codigo: string) {
        return prisma.amostra.findUnique({
            where: { codigo: codigo as string },
        });
    }
    async atualizarStatus(codigo: string, novoStatus: StatusAmostra, amostra: Amostra) {
        return prisma.$transaction(async (tx) => {
            const updated = await tx.amostra.update({
                where: { codigo: codigo as string },
                data: { status: novoStatus as StatusAmostra },
            });

            await tx.historicoStatus.create({
                data: {
                    amostraId: amostra.id,
                    statusAnterior: amostra.status,
                    novoStatus: novoStatus as StatusAmostra,
                },
            });
            return updated;
        });
    }
}