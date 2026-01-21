import swaggerJSDoc from "swagger-jsdoc";

export const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Sistema de Gestão de Amostras Laboratoriais",
            version: "1.0.0",
            description: "API para gerenciamento de amostras laboratoriais",
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Servidor local",
            },
        ],
    },
    apis: ["./src/app.ts"],
};

export const swaggerSpec = swaggerJSDoc(swaggerOptions);