module.exports = (io, socket) => {

    const rooms = global.ffDraftRooms || (
        global.ffDraftRooms = {}
    )

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

            clearInterval(
                rooms[roomId].interval
            )

            rooms[roomId].interval = null

        }

        if (rooms[roomId].timeout) {

            clearTimeout(
                rooms[roomId].timeout
            )

            rooms[roomId].timeout = null

        }

    }

    function resetRoom(roomId) {

        if (!roomExists(roomId)) return

        clearRoomTimers(roomId)

        rooms[roomId].phase = 'waiting'
        rooms[roomId].countdown = 5
        rooms[roomId].timer = 60
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

        rooms[roomId].interval =
            setInterval(() => {

                if (!roomExists(roomId)) {
                    return
                }

                if (
                    rooms[roomId].players.length < 2
                ) {

                    resetRoom(roomId)
                    return

                }

                rooms[roomId].countdown--

                emitRoom(roomId)

                if (
                    rooms[roomId].countdown <= 0
                ) {

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

        rooms[roomId].timeout =
            setTimeout(() => {

                if (!roomExists(roomId)) return

                const winnerIndex =
                    Math.random() > 0.5
                        ? 0
                        : 1

                const winner =
                    rooms[roomId]
                        .players[winnerIndex]

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
            `${flow.action} ${flow.type}`

        room.currentAction =
            flow.action

        room.currentType =
            flow.type

        room.currentActionCount = 0

        room.timer = 60

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

        room.interval =
            setInterval(() => {

                if (!roomExists(roomId))
                    return

                if (
                    room.players.length < 2
                ) {

                    resetRoom(roomId)
                    return

                }

                room.timer--

                emitRoom(roomId)

                if (room.timer <= 0) {

                    clearRoomTimers(roomId)

                    room.flowIndex++

                    startNextFlow(roomId)

                }

            }, 1000)

    }

    // JOIN ROOM
    socket.on('draft:join', ({
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

                timer: 60,

                currentTurn: null,

                tossWinner: null,

                coinResult: 'FF',

                flipping: false,

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

        if (
            rooms[roomId].players.length === 2 &&
            rooms[roomId].phase === 'waiting'
        ) {

            startCountdown(roomId)

        }

    })

    // DRAFT ACTION
    socket.on('draft:action', ({
        characterId
    }) => {

        try {

            const roomId = socket.roomId

            if (!roomExists(roomId)) return

            const room = rooms[roomId]

            const flow =
                DRAFT_FLOW[room.flowIndex]

            if (!flow) return

            if (
                room.currentTurn !== socket.id
            ) {
                return
            }

            // BLOCK BANNED
            if (
                room.bannedCharacters.includes(
                    characterId
                )
            ) {
                return
            }

            // BLOCK PICKED
            const allPicked = [

                ...room.pickedCharacters.blue,

                ...room.pickedCharacters.red,

            ]

            if (
                allPicked.includes(characterId)
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

                room.timer = 60

                emitRoom(roomId)

            }

        } catch (err) {

            console.log(
                'Draft Action Error:',
                err
            )

        }

    })

    // DISCONNECT
    socket.on('disconnect', () => {

        try {

            const roomId = socket.roomId

            if (!roomExists(roomId))
                return

            rooms[roomId].players =
                rooms[roomId].players.filter(
                    p => p.socketId !== socket.id
                )

            if (
                rooms[roomId].players.length === 1
            ) {

                resetRoom(roomId)

            }

            emitRoom(roomId)

            if (
                rooms[roomId].players.length === 0
            ) {

                clearRoomTimers(roomId)

                delete rooms[roomId]

                console.log(
                    'Deleted Draft Room:',
                    roomId
                )

            }

        } catch (err) {

            console.log(
                'Draft Disconnect Error:',
                err
            )

        }

    })

}