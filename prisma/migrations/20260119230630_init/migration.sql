-- CreateTable
CREATE TABLE "Amostra" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "tipoAnalise" TEXT NOT NULL,
    "dataColeta" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "HistoricoStatus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "statusAnterior" TEXT NOT NULL,
    "novoStatus" TEXT NOT NULL,
    "dataHora" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amostraId" TEXT NOT NULL,
    CONSTRAINT "HistoricoStatus_amostraId_fkey" FOREIGN KEY ("amostraId") REFERENCES "Amostra" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Amostra_codigo_key" ON "Amostra"("codigo");
