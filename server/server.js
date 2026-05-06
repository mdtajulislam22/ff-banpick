const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const app = express()

app.use(cors())

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: '*',
    }
})

const rooms = {}

io.on('connection', (socket) => {

    console.log('Connected:', socket.id)

    socket.on('join_room', ({ roomId, player }) => {

        roomId = roomId.toLowerCase().trim()

        socket.join(roomId)

        socket.roomId = roomId

        if (!rooms[roomId]) {

            rooms[roomId] = {
                players: [],
                coinResult: null,
                flipping: false,
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

        }

        io.to(roomId).emit('room_update', rooms[roomId])

    })

    // COIN FLIP
    socket.on('flip_coin', () => {

        const roomId = socket.roomId

        if (!roomId || !rooms[roomId]) return

        if (rooms[roomId].flipping) return

        rooms[roomId].flipping = true

        io.to(roomId).emit('coin_flipping')

        // setTimeout(() => {

        //     const result =
        //         Math.random() > 0.5
        //             ? 'HEAD'
        //             : 'TAIL'

        //     rooms[roomId].coinResult = result
        //     rooms[roomId].flipping = false

        //     io.to(roomId).emit(
        //         'coin_result',
        //         result
        //     )

        //     io.to(roomId).emit(
        //         'room_update',
        //         rooms[roomId]
        //     )

        // }, 3000)
        setTimeout(() => {

            // IMPORTANT SAFETY CHECK
            if (!rooms[roomId]) {
                return
            }

            const result =
                Math.random() > 0.5
                    ? 'HEAD'
                    : 'TAIL'

            rooms[roomId].coinResult = result
            rooms[roomId].flipping = false

            io.to(roomId).emit(
                'coin_result',
                result
            )

            io.to(roomId).emit(
                'room_update',
                rooms[roomId]
            )

        }, 3000)

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

        }

    })

})

server.listen(3001, () => {
    console.log('Server running on 3001')
})