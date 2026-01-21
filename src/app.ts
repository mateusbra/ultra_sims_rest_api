import express from "express";
import SwaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger";
import amostrasRoutes from "./routes/amostras/amostra.routes";
import { errorHandler } from "./middlewares/errorHandlers";

const app = express();

app.use(express.json());
app.use("/docs", SwaggerUi.serve, SwaggerUi.setup(swaggerSpec));
app.use("/amostras", amostrasRoutes);
app.use(errorHandler);

export default app;
