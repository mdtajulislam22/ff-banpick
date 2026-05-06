import { useEffect, useState } from 'react'
import { socket } from './socket'
import { motion } from 'framer-motion'
import RotateDevice from './components/RotateDevice'

function App() {
  const [isMobilePortrait, setIsMobilePortrait] = useState(false)

  const [playerName, setPlayerName] = useState('')
  const [roomId, setRoomId] = useState('')

  const [joined, setJoined] = useState(false)

  const [room, setRoom] = useState(null)

  const [coinResult, setCoinResult] = useState('FF')

  const [flipping, setFlipping] = useState(false)

  useEffect(() => {

    // MOBILE ORIENTATION
    const checkOrientation = () => {

      const isMobile = window.innerWidth < 1024

      const isPortrait =
        window.innerHeight > window.innerWidth

      setIsMobilePortrait(
        isMobile && isPortrait
      )

    }

    checkOrientation()

    window.addEventListener(
      'resize',
      checkOrientation
    )

    // SOCKET CONNECT
    socket.connect()

    socket.on('room_update', (data) => {
      setRoom(data)
    })

    socket.on('coin_flipping', () => {
      setFlipping(true)
      setCoinResult('FF')
    })

    socket.on('coin_result', (result) => {

      setFlipping(false)

      setCoinResult(result)

    })

    // CLEANUP
    return () => {

      window.removeEventListener(
        'resize',
        checkOrientation
      )

      socket.off('room_update')
      socket.off('coin_flipping')
      socket.off('coin_result')

      socket.disconnect()

    }

  }, [])

  const joinRoom = () => {

    if (!playerName.trim()) {
      return alert('Enter player name')
    }

    if (!roomId.trim()) {
      return alert('Enter room name')
    }

    socket.emit('join_room', {
      roomId,
      player: {
        name: playerName,
      }
    })

    setJoined(true)

  }

  const flipCoin = () => {

    if (flipping) return

    socket.emit('flip_coin')

  }

  return (
    <>
      {isMobilePortrait && (
        <RotateDevice />
      )}

      <div className="min-h-screen bg-[#050816] text-white p-5">

        {/* JOIN PAGE */}
        {!joined && (

          <div className="min-h-screen flex items-center justify-center">

            <div className="w-full max-w-md bg-white/10 border border-white/10 rounded-3xl p-8">

              <h1 className="text-5xl font-bold text-center mb-2">
                FF Draft
              </h1>

              <p className="text-center text-gray-400 mb-8">
                Realtime Ban & Pick Arena
              </p>

              <input
                type="text"
                placeholder="Player Name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 mb-4 outline-none"
              />

              <input
                type="text"
                placeholder="Room Name"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 mb-6 outline-none"
              />

              <button
                onClick={joinRoom}
                className="w-full bg-blue-600 hover:bg-blue-500 transition-all py-3 rounded-xl font-bold"
              >
                Join Draft Room
              </button>

            </div>

          </div>

        )}

        {/* ROOM */}
        {joined && (

          <div className="max-w-7xl mx-auto">

            {/* TOP */}
            <div className="flex items-center justify-between mb-10">

              <div>
                <h1 className="text-4xl font-bold">
                  Room: {roomId}
                </h1>

                <p className="text-gray-400">
                  Realtime Room Connected
                </p>
              </div>

              <div className="text-right">

                <p className="text-gray-400">
                  Players
                </p>

                <p className="text-4xl font-bold text-blue-400">
                  {room?.players?.length || 0}
                </p>

              </div>

            </div>

            {/* MAIN */}
            <div className="grid grid-cols-3 gap-5">

              {/* LEFT */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-3xl p-5 min-h-[500px]">

                <h2 className="text-2xl font-bold text-center mb-5">
                  Team Left
                </h2>

                <div className="space-y-3">

                  {room?.players?.slice(0, 1).map((player) => (

                    <div
                      key={player.socketId}
                      className="bg-white/10 rounded-2xl p-4"
                    >

                      <p className="text-xl font-bold">
                        {player.name}
                      </p>

                    </div>

                  ))}

                </div>

              </div>

              {/* CENTER */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-5 flex flex-col items-center justify-center min-h-[500px]">

                <h2 className="text-3xl font-bold mb-10">
                  Coin Toss
                </h2>

                <motion.div

                  animate={{
                    rotateY: flipping ? 1440 : 0,
                    scale: flipping ? 1.2 : 1,
                  }}

                  transition={{
                    duration: 3,
                  }}

                  className="w-52 h-52 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-2xl flex items-center justify-center text-5xl font-black mb-10"
                >

                  {coinResult}

                </motion.div>

                <button
                  onClick={flipCoin}
                  disabled={flipping}
                  className="bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black px-10 py-4 rounded-2xl text-xl font-bold"
                >
                  {flipping ? 'Flipping...' : 'Flip Coin'}
                </button>

              </div>

              {/* RIGHT */}
              <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-5 min-h-[500px]">

                <h2 className="text-2xl font-bold text-center mb-5">
                  Team Right
                </h2>

                <div className="space-y-3">

                  {room?.players?.slice(1, 2).map((player) => (

                    <div
                      key={player.socketId}
                      className="bg-white/10 rounded-2xl p-4"
                    >

                      <p className="text-xl font-bold">
                        {player.name}
                      </p>

                    </div>

                  ))}

                </div>

              </div>

            </div>

          </div>

        )}

      </div>
    </>
  )


}

export default App