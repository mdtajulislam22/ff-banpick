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
        methods: ['GET', 'POST']
    }
})

const rooms = {}
const DRAFT_FLOW = [

    // ACTIVE BAN
    {
        action: 'ban',
        type: 'active',
        turn: 0,
        amount: 1,
    },

    {
        action: 'ban',
        type: 'active',
        turn: 1,
        amount: 1,
    },

    // ACTIVE PICK
    {
        action: 'pick',
        type: 'active',
        turn: 0,
        amount: 1,
    },

    {
        action: 'pick',
        type: 'active',
        turn: 1,
        amount: 1,
    },

    // PASSIVE BAN
    {
        action: 'ban',
        type: 'passive',
        turn: 1,
        amount: 1,
    },

    {
        action: 'ban',
        type: 'passive',
        turn: 0,
        amount: 2,
    },

    {
        action: 'ban',
        type: 'passive',
        turn: 1,
        amount: 1,
    },

    // PASSIVE PICK
    {
        action: 'pick',
        type: 'passive',
        turn: 0,
        amount: 1,
    },

    {
        action: 'pick',
        type: 'passive',
        turn: 1,
        amount: 2,
    },

    {
        action: 'pick',
        type: 'passive',
        turn: 0,
        amount: 1,
    },

    {
        action: 'pick',
        type: 'passive',
        turn: 1,
        amount: 1,
    },

    {
        action: 'pick',
        type: 'passive',
        turn: 0,
        amount: 1,
    },

]

const PHASES = [
    'waiting',
    'countdown',
    'coin_toss',
    'active_ban_1',
    'active_ban_2',
]

function roomExists(roomId) {
    return !!rooms[roomId]
}

function emitRoom(roomId) {

    if (!roomExists(roomId)) return

    io.to(roomId).emit(
        'room_update',
        rooms[roomId]
    )

}

function clearRoomTimers(roomId) {

    if (!roomExists(roomId)) return

    if (rooms[roomId].interval) {
        clearInterval(rooms[roomId].interval)
        rooms[roomId].interval = null
    }

    if (rooms[roomId].timeout) {
        clearTimeout(rooms[roomId].timeout)
        rooms[roomId].timeout = null
    }

}

function setPhase(roomId, phase) {

    if (!roomExists(roomId)) return

    rooms[roomId].phase = phase

    emitRoom(roomId)

}

function resetRoom(roomId) {

    if (!roomExists(roomId)) return

    clearRoomTimers(roomId)

    rooms[roomId].phase = 'waiting'
    rooms[roomId].countdown = 5
    rooms[roomId].timer = 30
    rooms[roomId].currentTurn = null
    rooms[roomId].tossWinner = null
    rooms[roomId].coinResult = 'FF'
    rooms[roomId].flipping = false

    emitRoom(roomId)

}

function startCountdown(roomId) {

    if (!roomExists(roomId)) return

    clearRoomTimers(roomId)

    rooms[roomId].phase = 'countdown'
    rooms[roomId].countdown = 5

    emitRoom(roomId)

    rooms[roomId].interval = setInterval(() => {

        if (!roomExists(roomId)) {
            return
        }

        if (rooms[roomId].players.length < 2) {

            resetRoom(roomId)
            return

        }

        rooms[roomId].countdown--

        emitRoom(roomId)

        if (rooms[roomId].countdown <= 0) {

            clearRoomTimers(roomId)

            startCoinToss(roomId)

        }

    }, 1000)

}

function startCoinToss(roomId) {

    if (!roomExists(roomId)) return

    clearRoomTimers(roomId)

    rooms[roomId].phase = 'coin_toss'
    rooms[roomId].flipping = true

    emitRoom(roomId)

    rooms[roomId].timeout = setTimeout(() => {

        if (!roomExists(roomId)) return

        if (rooms[roomId].players.length < 2) {

            resetRoom(roomId)
            return

        }

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

        emitRoom(roomId)

        // startDraftPhase(
        //     roomId,
        //     'active_ban_1',
        //     winner.socketId
        // )
        rooms[roomId].flowIndex = 0

        startNextFlow(roomId)

    }, 3000)

}
function startNextFlow(roomId) {

    if (!roomExists(roomId)) return

    clearRoomTimers(roomId)

    const room = rooms[roomId]

    const flow =
        DRAFT_FLOW[room.flowIndex]

    // FINISHED
    if (!flow) {

        room.phase = 'finished'

        emitRoom(roomId)

        return

    }

    room.phase =
        `${flow.action}_${flow.type}`

    room.currentAction =
        flow.action

    room.currentType =
        flow.type

    room.currentActionCount = 0

    room.timer = 30

    // TURN
    const tossWinner =
        room.players.find(
            p => p.socketId === room.tossWinner
        )

    const otherPlayer =
        room.players.find(
            p => p.socketId !== room.tossWinner
        )

    room.currentTurn =
        flow.turn === 0
            ? tossWinner.socketId
            : otherPlayer.socketId

    emitRoom(roomId)

    room.interval = setInterval(() => {

        if (!roomExists(roomId)) return

        if (room.players.length < 2) {

            resetRoom(roomId)
            return

        }

        room.timer--

        emitRoom(roomId)

        // AUTO PASS
        if (room.timer <= 0) {

            clearRoomTimers(roomId)

            room.flowIndex++

            startNextFlow(roomId)

        }

    }, 1000)

}

// function startDraftPhase(
//     roomId,
//     phase,
//     currentTurn
// ) {

//     if (!roomExists(roomId)) return

//     clearRoomTimers(roomId)

//     rooms[roomId].phase = phase
//     rooms[roomId].currentTurn = currentTurn
//     rooms[roomId].timer = 30

//     emitRoom(roomId)

//     rooms[roomId].interval = setInterval(() => {

//         if (!roomExists(roomId)) return

//         if (rooms[roomId].players.length < 2) {

//             resetRoom(roomId)
//             return

//         }

//         rooms[roomId].timer--

//         emitRoom(roomId)

//         if (rooms[roomId].timer <= 0) {

//             clearRoomTimers(roomId)

//             const currentPlayer =
//                 rooms[roomId].currentTurn

//             const otherPlayer =
//                 rooms[roomId].players.find(
//                     p => p.socketId !== currentPlayer
//                 )

//             // AUTO PASS
//             if (
//                 rooms[roomId].phase === 'active_ban_1'
//             ) {

//                 startDraftPhase(
//                     roomId,
//                     'active_ban_2',
//                     otherPlayer.socketId
//                 )

//             }
//             else {

//                 rooms[roomId].phase =
//                     'finished'

//                 emitRoom(roomId)

//             }

//         }

//     }, 1000)

// }

io.on('connection', (socket) => {

    console.log('Connected:', socket.id)

    socket.on('join_room', ({
        roomId,
        player
    }) => {

        roomId =
            roomId.toLowerCase().trim()

        socket.join(roomId)

        socket.roomId = roomId

        if (!roomExists(roomId)) {

            rooms[roomId] = {

                players: [],

                phase: 'waiting',

                countdown: 5,

                timer: 30,

                currentTurn: null,

                tossWinner: null,

                coinResult: 'FF',

                flipping: false,

                // activeBans: [],

                // activePicks: [],

                // passiveBans: [],

                // passivePicks: [],
                bannedCharacters: [],
                pickedCharacters: {
                    blue: [],
                    red: [],
                },

                flowIndex: 0,

                currentActionCount: 0,

                interval: null,

                timeout: null,

            }

        }

        const exists =
            rooms[roomId].players.find(
                p => p.socketId === socket.id
            )

        if (!exists) {

            rooms[roomId].players.push({
                socketId: socket.id,
                name: player.name,
            })

        }

        emitRoom(roomId)

        // START MATCH
        if (
            rooms[roomId].players.length === 2 &&
            rooms[roomId].phase === 'waiting'
        ) {

            startCountdown(roomId)

        }

    })

    socket.on('draft_action', ({
        characterId
    }) => {

        try {

            const roomId = socket.roomId

            if (!roomExists(roomId)) return

            const room = rooms[roomId]

            const flow =
                DRAFT_FLOW[room.flowIndex]

            if (!flow) return

            // NOT YOUR TURN
            if (
                room.currentTurn !== socket.id
            ) {
                return
            }

            // ALREADY BANNED
            if (
                room.bannedCharacters.includes(characterId)
            ) {
                return
            }

            // BAN
            if (flow.action === 'ban') {

                room.bannedCharacters.push(
                    characterId
                )

            }

            // PICK
            if (flow.action === 'pick') {

                const team =
                    socket.id === room.tossWinner
                        ? 'blue'
                        : 'red'

                room.pickedCharacters[team]
                    .push(characterId)

            }

            room.currentActionCount++

            // STEP COMPLETE
            if (
                room.currentActionCount >=
                flow.amount
            ) {

                clearRoomTimers(roomId)

                room.flowIndex++

                startNextFlow(roomId)

            }
            else {

                room.timer = 30

                emitRoom(roomId)

            }

        } catch (err) {

            console.log(
                'Draft Action Error:',
                err
            )

        }

    })
    // socket.on('ban_character', ({
    //     characterId
    // }) => {

    //     try {

    //         const roomId = socket.roomId

    //         if (!roomExists(roomId)) return

    //         const room = rooms[roomId]

    //         // NOT YOUR TURN
    //         if (
    //             room.currentTurn !== socket.id
    //         ) {
    //             return
    //         }

    //         // already banned
    //         if (
    //             room.activeBans.includes(characterId)
    //         ) {
    //             return
    //         }

    //         // BAN CHARACTER
    //         room.activeBans.push(characterId)

    //         // SWITCH TURN
    //         const otherPlayer =
    //             room.players.find(
    //                 p => p.socketId !== socket.id
    //             )

    //         // NEXT PHASE
    //         if (
    //             room.phase === 'active_ban_1'
    //         ) {

    //             // startDraftPhase(
    //             //     roomId,
    //             //     'active_ban_2',
    //             //     otherPlayer.socketId
    //             // )

    //         }
    //         else {

    //             clearRoomTimers(roomId)

    //             room.phase = 'finished'

    //         }

    //         emitRoom(roomId)

    //     } catch (err) {

    //         console.log(
    //             'Ban Error:',
    //             err
    //         )

    //     }

    // })

    socket.on('disconnect', () => {

        try {

            console.log(
                'Disconnected:',
                socket.id
            )

            const roomId = socket.roomId

            if (!roomExists(roomId)) return

            rooms[roomId].players =
                rooms[roomId].players.filter(
                    p => p.socketId !== socket.id
                )

            // ONE PLAYER LEFT
            if (rooms[roomId].players.length === 1) {

                resetRoom(roomId)

            }

            emitRoom(roomId)

            // DELETE EMPTY ROOM
            if (
                rooms[roomId].players.length === 0
            ) {

                clearRoomTimers(roomId)

                delete rooms[roomId]

                console.log(
                    'Deleted room:',
                    roomId
                )

            }

        } catch (err) {

            console.log(
                'Disconnect Error:',
                err
            )

        }

    })

})

const PORT =
    process.env.PORT || 3001

server.listen(PORT, () => {
    console.log(
        `Server running on ${PORT}`
    )
})