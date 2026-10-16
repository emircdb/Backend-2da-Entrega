const { MongoClient } = require('mongodb');
require('dotenv').config();

const URI = process.env.MONGO_URI;
let client;

const connectToMongoDB = async () => {
    try {
        client = new MongoClient(URI);
        await client.connect();
        console.log(' Conectado exitosamente a MongoDB Atlas ✅');
        return client;
    } catch (error) {
        console.error(' Error al intentar conectar con MongoDB ❌:', error);
        return null;
    }
};

const disconnectFromMongoDB = async () => {
    try {
        if (client) {
            await client.close();
            console.log(' Desconectado de MongoDB 🔌');
        }
    } catch (error) {
        console.error(' Error al cerrar la conexión ❌:', error);
    }
};

module.exports = {
    connectToMongoDB,
    disconnectFromMongoDB
};