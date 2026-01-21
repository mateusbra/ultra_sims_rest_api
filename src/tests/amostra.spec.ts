import request from "supertest";
import app from "../app";
import { StatusAmostra } from "@prisma/client";

describe("POST /amostras", () => {
  it("deve criar uma amostra com sucesso", async () => {
    const response = await request(app)
      .post("/amostras")
      .send({
        codigo: "AM-001",
        tipoAnalise: "Química",
        dataColeta: "2024-01-01",
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.codigo).toBe("AM-001");
    expect(response.body.status).toBe(StatusAmostra.pendente);
  });
});
describe("PATCH /amostras/:codigo/status", () => {
  it("deve atualizar o status da amostra com sucesso", async () => {
    // Primeiro, criar uma amostra para atualizar
    const amostraResponse = await request(app)
      .post("/amostras")
      .send({
        codigo: "AM-002",
        tipoAnalise: "Microbiológica",
        dataColeta: "2024-01-02",
      });

    const amostraCodigo = amostraResponse.body.codigo;
    // Atualizar o status da amostra de pendente para em_analise
    const response = await request(app)
      .patch(`/amostras/${amostraCodigo}/status`)
      .send({
        novoStatus: StatusAmostra.em_analise,
      });
    expect(response.status).toBe(200);
    expect(response.body.status).toBe(StatusAmostra.em_analise);
    // Atualizar o status da amostra de em_analise para concluida
    const response2 = await request(app)
      .patch(`/amostras/${amostraCodigo}/status`)
      .send({
        novoStatus: StatusAmostra.concluida,
      });
    expect(response2.status).toBe(200);
    expect(response2.body.status).toBe(StatusAmostra.concluida);
    // Atualizar o status da amostra de concluida para aprovada
    const response3 = await request(app)
      .patch(`/amostras/${amostraCodigo}/status`)
      .send({
        novoStatus: StatusAmostra.aprovada,
      });
    expect(response3.status).toBe(200);
    expect(response3.body.status).toBe(StatusAmostra.aprovada);
  });
});

describe("PATCH /amostras/:codigo/status - transição inválida", () => {
  it("deve retornar erro para transição inválida de status", async () => {
    // Primeiro, criar uma amostra para atualizar
    const amostraResponse = await request(app)
      .post("/amostras")
      .send({
        codigo: "AM-003",
        tipoAnalise: "Física",
        dataColeta: "2024-01-03",
      });

    const amostraCodigo = amostraResponse.body.codigo;
    // Tentar atualizar o status da amostra de pendente para aprovada (transição inválida)
    const response = await request(app)
      .patch(`/amostras/${amostraCodigo}/status`)
      .send({
        novoStatus: StatusAmostra.aprovada,
      });
    expect(response.status).toBe(400);
  });
});

describe("PATCH /amostras/:codigo/status - amostra não encontrada", () => {
  it("deve retornar erro quando a amostra não for encontrada", async () => {
    const response = await request(app)
      .patch("/amostras/AM-999/status")
      .send({
        novoStatus: StatusAmostra.em_analise,
      });
    expect(response.status).toBe(404);
  });
});