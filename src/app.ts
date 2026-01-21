import express from "express";
import SwaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger";
import amostrasRoutes from "./routes/amostras/amostra.routes";
const app = express();

app.use(express.json());
app.use("/docs", SwaggerUi.serve, SwaggerUi.setup(swaggerSpec));
app.use("/amostras", amostrasRoutes);

export default app;
