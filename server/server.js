const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

// GAME MODULES
const ffDraft = require('./games/ffDraft')

const app = express()

app.use(cors())

app.get('/', (req, res) => {
    res.send('Realtime Multiplayer Gateway Running')
})

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
})

// SOCKET CONNECTION
io.on('connection', (socket) => {

    console.log(
        'Connected:',
        socket.id
    )

    // FREE FIRE DRAFT
    ffDraft(io, socket)

})

const PORT =
    process.env.PORT || 3001

server.listen(PORT, () => {

    console.log(
        `Gateway Server running on ${PORT}`
    )

})