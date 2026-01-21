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
    describe("GET /amostras/:id", () => {
        it("Deve retornar os detalhes de uma amostra existente", async () => {
          const amostraResponse = await request(app)
            .post("/amostras")
            .send({
              codigo: "AM-002",
              tipoAnalise: "Microbiológica",
              dataColeta: "2024-01-02",
            });
            
            const amostraId = amostraResponse.body.id;

            const response = await request(app).get(`/amostras/${amostraId}`);
            expect(response.status).toBe(200);
            expect(response.body.codigo).toBe("AM-002");
        });
    });