const mongoose = require('mongoose');
import config from "../config";

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