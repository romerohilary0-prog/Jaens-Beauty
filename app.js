const express = require('express');
const cors = require('cors'); 
const db = require('./db');
require('dotenv').config();
const app = express();

app.use(cors()); 
app.use(express.json());

// --- 1. RUTAS DE PRODUCTOS ---
app.get('/productos', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM Producto');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 2. RUTAS DE USUARIOS Y COMPRAS ---
app.post('/login', async (req, res) => {
    const { nombre, contraseña } = req.body;
    try {
        const [rows] = await db.query(
            'SELECT * FROM Usuario WHERE nombre = ? AND contraseña = ?',
            [nombre, contraseña]
        );
        if (rows.length > 0) {
            res.status(200).json({ message: "Login exitoso", usuario: rows[0] });
        } else {
            res.status(401).json({ error: "Nombre o contraseña incorrectos" });
        }
    } catch (err) {
        res.status(500).json({ error: "Error interno" });
    }
});

app.post('/compras/facturar', async (req, res) => {
    const { usuario, productos, total } = req.body;
    try {
        const [userRows] = await db.query('SELECT id_usuario FROM Usuario WHERE nombre = ?', [usuario]);
        if (userRows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });
        
        const id_usuario = userRows[0].id_usuario;

        for (const prod of productos) {
            const [prodRows] = await db.query('SELECT id_producto FROM Producto WHERE marca = ?', [prod.nombre]);
            
            if (prodRows.length > 0) {
                const id_prod = prodRows[0].id_producto;
                
                const [compra] = await db.query(
                    'INSERT INTO Compras (id_usuario, id_producto, cantidad) VALUES (?, ?, ?)',
                    [id_usuario, id_prod, prod.cantidad]
                );

                await db.query(
                    'INSERT INTO Factura (id_compra, id_usuario) VALUES (?, ?)', 
                    [compra.insertId, id_usuario]
                );
            }
        }
        res.status(201).json({ message: "Compra y Factura guardadas correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 3. NUEVA RUTA DE ADMINISTRACIÓN (Agrégala aquí) ---
app.get('/admin/ventas', async (req, res) => {
    try {
        const query = `
            SELECT 
                f.id_factura, 
                u.nombre AS cliente, 
                p.marca AS producto, 
                c.cantidad, 
                p.precio,
                (c.cantidad * p.precio) AS subtotal,
                f.fecha_emision
            FROM Factura f
            INNER JOIN Compras c ON f.id_compra = c.id_compra
            INNER JOIN Usuario u ON f.id_usuario = u.id_usuario
            INNER JOIN Producto p ON c.id_producto = p.id_producto
            ORDER BY f.fecha_emision DESC`;
        
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error en el servidor" });
    }
});

// --- 4. INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor funcionando en http://localhost:${PORT}`);
});