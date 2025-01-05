import express from "express";
import configs from "./config";
import expressApp from "./express-app";
import { databaseConnection } from "./database";

const StartServer = async () => {
    const app = express();
    await databaseConnection();
    await expressApp(app);
    app.listen(configs.PORT, () => {
        console.log(`Server is running on port ${configs.PORT}`);
    })
    .on('error', (err) => {
        console.log(err);
        process.exit(1);
    });
}

StartServer();