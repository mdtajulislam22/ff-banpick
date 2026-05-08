module.exports = (io, socket) => {

    const rooms = global.barkBattleRooms || (
        global.barkBattleRooms = {}
    )

    function roomExists(roomId) {
        return !!rooms[roomId]
    }

    function emitRoom(roomId) {

        if (!roomExists(roomId)) return

        io.to(roomId).emit(
            'bark:room_update',
            rooms[roomId]
        )

    }

    function clearTimers(roomId) {

        if (!roomExists(roomId)) return

        if (rooms[roomId].interval) {

            clearInterval(
                rooms[roomId].interval
            )

            rooms[roomId].interval = null

        }

    }

    function resetRoom(roomId) {

        if (!roomExists(roomId)) return

        clearTimers(roomId)

        rooms[roomId].phase = 'waiting'

        rooms[roomId].countdown = 3

        rooms[roomId].battleTimer = 30

        rooms[roomId].pressure = 50

        rooms[roomId].winner = null

        rooms[roomId].players.forEach(player => {
            player.ready = false
            player.volume = 0
        })

        emitRoom(roomId)

    }

    function startCountdown(roomId) {

        if (!roomExists(roomId)) return

        clearTimers(roomId)

        rooms[roomId].phase = 'countdown'

        rooms[roomId].countdown = 3

        emitRoom(roomId)

        rooms[roomId].interval =
            setInterval(() => {

                if (!roomExists(roomId)) return

                rooms[roomId].countdown--

                emitRoom(roomId)

                if (
                    rooms[roomId].countdown <= 0
                ) {

                    clearTimers(roomId)

                    startBattle(roomId)

                }

            }, 1000)

    }

    function startBattle(roomId) {

        if (!roomExists(roomId)) return

        clearTimers(roomId)

        rooms[roomId].phase = 'battle'

        rooms[roomId].battleTimer = 30

        rooms[roomId].pressure = 50

        emitRoom(roomId)

        rooms[roomId].interval =
            setInterval(() => {

                if (!roomExists(roomId)) return

                const room = rooms[roomId]

                room.battleTimer--

                const p1 = room.players[0]
                const p2 = room.players[1]

                if (p1 && p2) {

                    const difference =
                        (p1.volume || 0) -
                        (p2.volume || 0)

                    room.pressure += difference * 0.05

                    if (room.pressure < 0)
                        room.pressure = 0

                    if (room.pressure > 100)
                        room.pressure = 100

                    // INSTANT WIN
                    if (room.pressure <= 0) {

                        room.phase = 'finished'
                        room.winner = p2.socketId

                        clearTimers(roomId)

                    }

                    if (room.pressure >= 100) {

                        room.phase = 'finished'
                        room.winner = p1.socketId

                        clearTimers(roomId)

                    }

                }

                // TIME END
                if (room.battleTimer <= 0) {

                    room.phase = 'finished'

                    if (room.pressure > 50) {
                        room.winner = p1.socketId
                    }
                    else {
                        room.winner = p2.socketId
                    }

                    clearTimers(roomId)

                }

                emitRoom(roomId)

            }, 100)

    }

    // JOIN ROOM
    socket.on('bark:join', ({
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

                countdown: 3,

                battleTimer: 30,

                pressure: 50,

                winner: null,

                interval: null,

            }

        }

        const exists =
            rooms[roomId].players.find(
                p => p.socketId === socket.id
            )

        if (!exists) {

            rooms[roomId].players.push({
                socketId: socket.id,
                image: player.image,
                ready: false,
                volume: 0,
            })

        }

        emitRoom(roomId)

    })

    // READY
    socket.on('bark:ready', () => {

        const roomId = socket.roomId

        if (!roomExists(roomId)) return

        const room = rooms[roomId]

        const player =
            room.players.find(
                p => p.socketId === socket.id
            )

        if (!player) return

        player.ready = !player.ready

        emitRoom(roomId)

        // START IF BOTH READY
        if (
            room.players.length === 2 &&
            room.players.every(p => p.ready)
        ) {

            startCountdown(roomId)

        }

    })

    // MICROPHONE DATA
    socket.on('bark:volume', ({ volume }) => {

        const roomId = socket.roomId

        if (!roomExists(roomId)) return

        const room = rooms[roomId]

        const player =
            room.players.find(
                p => p.socketId === socket.id
            )

        if (!player) return

        player.volume = volume

    })

    // DISCONNECT
    socket.on('disconnect', () => {

        try {

            const roomId = socket.roomId

            if (!roomExists(roomId)) return

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

                clearTimers(roomId)

                delete rooms[roomId]

            }

        } catch (err) {

            console.log(
                'Bark Battle Disconnect Error:',
                err
            )

        }

    })

}