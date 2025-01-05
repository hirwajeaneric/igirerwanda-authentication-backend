const mongoose = require('mongoose');
import config from "../config";

/**
 * Establishes a connection to the database.
 * 
 * This function attempts to connect to the MongoDB database at the url specified in the
 * DB_URL environment variable. If the connection attempt is successful, it logs 'Db Connected'
 * to the console. If the connection attempt fails, it logs the error to the console and exits
 * the process with a status code of 1.
 * 
 * @returns {Promise<void>} A promise that resolves when the connection attempt is complete.
 */
const databaseConnection = async () => {

    try {
        await mongoose.connect(config.DB_URL as string);
        console.log('Db Connected');

    } catch (error) {
        console.log('Error ============')
        console.log(error);
        process.exit(1);
    }

};

export default databaseConnection;