import { useEffect, useState } from 'react'

import { socket } from './socket'

import RotateDevice from './components/RotateDevice'
import JoinRoom from './components/JoinRoom'
import DraftArena from './components/DraftArena'

function App() {

  const [isMobilePortrait, setIsMobilePortrait] = useState(false)

  const [playerName, setPlayerName] = useState('')
  const [roomId, setRoomId] = useState('')

  const [joined, setJoined] = useState(false)

  const [room, setRoom] = useState(null)

  const [coinResult, setCoinResult] = useState('FF')

  const [flipping, setFlipping] = useState(false)

  useEffect(() => {

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

      <div className="min-h-screen bg-[#050816] text-white">

        {!joined ? (

          <JoinRoom
            playerName={playerName}
            setPlayerName={setPlayerName}
            roomId={roomId}
            setRoomId={setRoomId}
            joinRoom={joinRoom}
          />

        ) : (

          <DraftArena
            room={room}
            roomId={roomId}
            flipping={flipping}
            coinResult={coinResult}
            flipCoin={flipCoin}
          />

        )}

      </div>

    </>

  )

}

export default App