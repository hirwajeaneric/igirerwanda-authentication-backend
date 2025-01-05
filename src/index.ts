import express from "express";
import configs from "./config";
import expressApp from "./express-app";
import { databaseConnection } from "./database";

/**
 * Starts the Express server.
 *
 * @remarks
 * This function is responsible for establishing a database connection,
 * setting up the Express app, and starting the server.
 *
 * @returns {Promise<void>}
 */
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