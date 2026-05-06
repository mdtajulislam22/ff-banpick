const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const app = express()

app.use(cors())
app.get('/', (req, res) => {
    res.send('FF BanPick Socket Server Running')
})

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: '*',
    }
})

const rooms = {}
function startCountdown(roomId) {

    if (!rooms[roomId]) return

    rooms[roomId].phase = 'countdown'

    rooms[roomId].countdown = 5

    io.to(roomId).emit(
        'room_update',
        rooms[roomId]
    )

    const countdownInterval = setInterval(() => {

        if (!rooms[roomId]) {

            clearInterval(countdownInterval)
            return

        }

        rooms[roomId].countdown--

        io.to(roomId).emit(
            'room_update',
            rooms[roomId]
        )

        if (rooms[roomId].countdown <= 0) {

            clearInterval(countdownInterval)

            startCoinToss(roomId)

        }

    }, 1000)

}
function startCoinToss(roomId) {

    if (!rooms[roomId]) return

    rooms[roomId].phase = 'coin_toss'

    rooms[roomId].flipping = true

    io.to(roomId).emit(
        'room_update',
        rooms[roomId]
    )

    setTimeout(() => {

        if (!rooms[roomId]) return

        const winnerIndex =
            Math.random() > 0.5 ? 0 : 1

        const winner =
            rooms[roomId].players[winnerIndex]

        rooms[roomId].coinResult =
            winnerIndex === 0
                ? 'BLUE'
                : 'RED'

        rooms[roomId].tossWinner =
            winner.socketId

        rooms[roomId].currentTurn =
            winner.socketId

        rooms[roomId].flipping = false

        // START FIRST PHASE
        rooms[roomId].phase =
            'active_ban_1'

        rooms[roomId].timer = 30

        io.to(roomId).emit(
            'room_update',
            rooms[roomId]
        )

        startDraftTimer(roomId)

    }, 3000)

}
function startDraftTimer(roomId) {

    const timerInterval = setInterval(() => {

        if (!rooms[roomId]) {

            clearInterval(timerInterval)
            return

        }

        rooms[roomId].timer--

        io.to(roomId).emit(
            'room_update',
            rooms[roomId]
        )

        if (rooms[roomId].timer <= 0) {

            clearInterval(timerInterval)

            // later:
            // auto skip
            // next phase

        }

    }, 1000)

}

io.on('connection', (socket) => {

    console.log('Connected:', socket.id)

    socket.on('join_room', ({ roomId, player }) => {

        roomId = roomId.toLowerCase().trim()

        socket.join(roomId)

        socket.roomId = roomId

        if (!rooms[roomId]) {

            rooms[roomId] = {

                players: [],

                phase: 'waiting',

                countdown: 5,

                timer: 30,

                currentTurn: null,

                tossWinner: null,

                coinResult: 'FF',

                flipping: false,

                activeBans: [],

                activePicks: [],

            }

        }

        const exists = rooms[roomId].players.find(
            p => p.socketId === socket.id
        )

        if (!exists) {

            rooms[roomId].players.push({
                socketId: socket.id,
                name: player.name,
            })
            if (
                rooms[roomId].players.length === 2 &&
                rooms[roomId].phase === 'waiting'
            ) {

                startCountdown(roomId)

            }

        }

        io.to(roomId).emit('room_update', rooms[roomId])

    })



    socket.on('disconnect', () => {

        console.log('Disconnected:', socket.id)

        const roomId = socket.roomId

        if (roomId && rooms[roomId]) {

            rooms[roomId].players =
                rooms[roomId].players.filter(
                    p => p.socketId !== socket.id
                )

            io.to(roomId).emit('room_update', rooms[roomId])

            if (rooms[roomId].players.length === 0) {
                delete rooms[roomId]
            }

            rooms[roomId].phase = 'waiting'

        }

    })

})

server.listen(3001, () => {
    console.log('Server running on 3001')
})