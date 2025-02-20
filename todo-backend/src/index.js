const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware de CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir solicitudes locales desde el rango 192.168.100.x y localhost
    if (
      origin &&
      (origin === 'http://localhost:5173' || /^http:\/\/192\.168\.100\.\d{1,3}:5173$/.test(origin))
    ) {
      callback(null, true); // Permitir el origen
    } else {
      callback(new Error('Not allowed by CORS')); // Bloquear el origen
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};

app.use(cors(corsOptions));

// Middleware para parsear JSON
app.use(express.json());

// Rutas
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

const taskRoutes = require('./routes/taskRoutes');
app.use('/api/tasks', taskRoutes);

// Ruta raíz para verificar si el servidor funciona
app.get('/', (req, res) => {
  res.send('Server Funcionando 😁');
});

// Arrancar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
