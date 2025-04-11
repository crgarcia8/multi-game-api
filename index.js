const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const cors = require('cors');

app.use(cors({
    origin: "*",
    methods: ["GET", "POST"]
}));

const jugadores = new Map();

io.on('connection', (socket) => {
    console.log('Un jugador se ha conectado');

    // Crear un jugador nuevo con posición aleatoria
    const jugador = {
        id: socket.id,
        x: Math.floor(Math.random() * 500),
        y: Math.floor(Math.random() * 500),
        color: '#' + Math.floor(Math.random()*16777215).toString(16)
    };

    jugadores.set(socket.id, jugador);

    // Enviar la información de todos los jugadores al nuevo jugador
    socket.emit('jugadores-actuales', Array.from(jugadores.values()));

    // Informar a todos los demás sobre el nuevo jugador
    socket.broadcast.emit('jugador-nuevo', jugador);

    // Manejar el movimiento del jugador
    socket.on('mover', (posicion) => {
        const jugador = jugadores.get(socket.id);
        if (jugador) {
            jugador.x = posicion.x;
            jugador.y = posicion.y;
            socket.broadcast.emit('jugador-movido', jugador);
        }
    });

    // Manejar la desconexión
    socket.on('disconnect', () => {
        console.log('Un jugador se ha desconectado');
        jugadores.delete(socket.id);
        io.emit('jugador-desconectado', socket.id);
    });
});

const PORT = process.env.PORT || 3001;
http.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});