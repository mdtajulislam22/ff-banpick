import { useEffect, useState } from 'react'

import { socket } from './socket'

import JoinRoom from './components/JoinRoom'
import BarkArena from './pages/BarkArena'
import RotateDevice from './components/RotateDevice'

function App() {

  const [joined, setJoined] =
    useState(false)

  const [room, setRoom] =
    useState(null)

  const [roomId, setRoomId] =
    useState('')

  const [playerImage, setPlayerImage] =
    useState(null)

  const [isMobilePortrait,
    setIsMobilePortrait] =
    useState(false)

  useEffect(() => {

    socket.connect()

    socket.on(
      'bark:room_update',
      (data) => {

        setRoom(data)

      }
    )

    const checkOrientation = () => {

      const isMobile =
        window.innerWidth < 1024

      const isPortrait =
        window.innerHeight >
        window.innerWidth

      setIsMobilePortrait(
        isMobile && isPortrait
      )

    }

    checkOrientation()

    window.addEventListener(
      'resize',
      checkOrientation
    )

    return () => {

      socket.off(
        'bark:room_update'
      )

      socket.disconnect()

    }

  }, [])

  const joinRoom = () => {

    if (!roomId.trim()) {
      return alert('Enter room ID')
    }

    if (!playerImage) {
      return alert('Upload image')
    }

    socket.emit('bark:join', {

      roomId,

      player: {
        image: playerImage
      }

    })

    setJoined(true)

  }

  return (

    <>

      {isMobilePortrait && (
        <RotateDevice />
      )}

      {!joined ? (

        <JoinRoom
          roomId={roomId}
          setRoomId={setRoomId}
          playerImage={playerImage}
          setPlayerImage={setPlayerImage}
          joinRoom={joinRoom}
        />

      ) : (

        <BarkArena
          room={room}
          roomId={roomId}
        />

      )}

    </>

  )

}

export default App