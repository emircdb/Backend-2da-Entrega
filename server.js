require('dotenv').config();
const express = require('express');
const { connectToMongoDB, disconnectFromMongoDB } = require('./src/mongodb');

const app = express();
const PORT = process.env.PORT || 3008;

const NOMBRE_BD = 'Ypf';         
const NOMBRE_COLECCION = 'Ypf';   

app.use(express.json());

app.get('/', (req, res) => {
    res.status(200).send('API funcionando correctamente 🚀');
});

app.get('/estaciones', async (req, res) => {
    let client;
    try {
        client = await connectToMongoDB();
        const db = client.db(NOMBRE_BD);
        const estaciones = await db.collection(NOMBRE_COLECCION).find().toArray();
        res.status(200).json(estaciones);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las estaciones' });
    } finally {
        await disconnectFromMongoDB();
    }
});

app.get('/estaciones/:id', async (req, res) => {
    const idBuscado = Number(req.params.id);
    let client;
    try {
        client = await connectToMongoDB();
        const db = client.db(NOMBRE_BD);
        const estacion = await db.collection(NOMBRE_COLECCION).findOne({ id: idBuscado });
        
        if (!estacion) {
            return res.status(404).json({ error: '404', mensaje: 'Estación no encontrada' });
        }
        
        res.status(200).json(estacion);
    } catch (error) {
        res.status(500).json({ error: 'Error al buscar la estación' });
    } finally {
        await disconnectFromMongoDB();
    }
});

app.post('/estaciones', async (req, res) => {
    const nuevaEstacion = req.body || {};
    
    if (!nuevaEstacion.id || !nuevaEstacion.nombre) {
        return res.status(400).json({ error: '400', mensaje: 'Faltan campos obligatorios (id, nombre)' });
    }
    
    let client;
    try {
        client = await connectToMongoDB();
        const db = client.db(NOMBRE_BD);
        await db.collection(NOMBRE_COLECCION).insertOne(nuevaEstacion);
        
        res.status(201).json({ mensaje: 'Estación creada exitosamente ✅ ', estacion: nuevaEstacion });
    } catch (error) {
        console.error('Error al insertar la estación:', {
            name: error.name,
            code: error.code,
            message: error.message
        });
        res.status(500).json({ error: 'Error al insertar la estación' });
    } finally {
        await disconnectFromMongoDB();
    }
});

app.put('/estaciones/:id', async (req, res) => {
    const idBuscado = Number(req.params.id);
    const datosActualizados = req.body;
    
    let client;
    try {
        client = await connectToMongoDB();
        const db = client.db(NOMBRE_BD);
        const resultado = await db.collection(NOMBRE_COLECCION).updateOne(
            { id: idBuscado },
            { $set: datosActualizados }
        );
        
        if (resultado.matchedCount === 0) {
            return res.status(404).json({ error: '404', mensaje: 'No se encontró la estación para actualizar' });
        }
        
        res.status(200).json({ mensaje: 'Estación actualizada exitosamente ⚡', id: idBuscado, cambios: datosActualizados });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar la estación ❌' });
    } finally {
        await disconnectFromMongoDB();
    }
});

app.delete('/estaciones/:id', async (req, res) => {
    const idBuscado = Number(req.params.id);
    let client;
    try {
        client = await connectToMongoDB();
        const db = client.db(NOMBRE_BD);
        const resultado = await db.collection(NOMBRE_COLECCION).deleteOne({ id: idBuscado });
        
        if (resultado.deletedCount === 0) {
            return res.status(404).json({ error: '404', mensaje: 'No se encontró la estación para eliminar' });
        }
        
        res.status(200).json({ mensaje: 'Estación eliminada exitosamente 🗑️', id: idBuscado });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la estación ❌' });
    } finally {
        await disconnectFromMongoDB();
    }
});

app.use((req, res) => {
    res.status(404).json({ error: '404', mensaje: 'Ruta no encontrada' });
});

app.use((error, req, res, next) => {
    const status = error.status === 400 ? 400 : 500;
    const mensaje = status === 400 ? 'Solicitud inválida' : 'Error interno del servidor';

    res.status(status).json({ error: String(status), mensaje });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});