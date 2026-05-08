import { useEffect, useMemo, useState } from 'react'

import { motion, AnimatePresence } from 'framer-motion'

import { socket } from '../socket'

export default function BarkArena({
    room,
    roomId,
}) {

    const [myVolume, setMyVolume] =
        useState(0)

    const [micEnabled, setMicEnabled] =
        useState(false)

    const mySocketId = socket.id

    const players = room?.players || []

    const leftPlayer = players[0]
    const rightPlayer = players[1]

    const leftVolume = leftPlayer?.volume || 0
    const rightVolume = rightPlayer?.volume || 0

    const pressure = room?.pressure || 50

    const winnerPlayer = useMemo(() => {

        return players.find(
            p => p.socketId === room?.winner
        )

    }, [players, room])

    const loserPlayer = useMemo(() => {

        return players.find(
            p => p.socketId !== room?.winner
        )

    }, [players, room])

    // MICROPHONE
    useEffect(() => {

        let audioContext
        let analyser
        let microphone
        let dataArray
        let animationFrame

        async function setupMic() {

            try {

                const stream =
                    await navigator
                        .mediaDevices
                        .getUserMedia({
                            audio: true
                        })

                audioContext =
                    new (
                        window.AudioContext ||
                        window.webkitAudioContext
                    )()

                analyser =
                    audioContext.createAnalyser()

                microphone =
                    audioContext
                        .createMediaStreamSource(
                            stream
                        )

                microphone.connect(analyser)

                analyser.fftSize = 256

                const bufferLength =
                    analyser.frequencyBinCount

                dataArray =
                    new Uint8Array(bufferLength)

                setMicEnabled(true)

                const updateVolume = () => {

                    analyser.getByteFrequencyData(
                        dataArray
                    )

                    const average =
                        dataArray.reduce(
                            (a, b) => a + b,
                            0
                        ) / bufferLength

                    const normalized =
                        Math.min(
                            Math.round(average),
                            100
                        )

                    setMyVolume(normalized)

                    if (
                        room?.phase === 'battle'
                    ) {

                        socket.emit(
                            'bark:volume',
                            {
                                volume: normalized
                            }
                        )

                    }

                    animationFrame =
                        requestAnimationFrame(
                            updateVolume
                        )

                }

                updateVolume()

            } catch (err) {

                console.log(err)

                alert(
                    'Microphone permission denied'
                )

            }

        }

        setupMic()

        return () => {

            if (animationFrame) {
                cancelAnimationFrame(
                    animationFrame
                )
            }

            if (audioContext) {
                audioContext.close()
            }

        }

    }, [room?.phase])

    return (

        <div className="relative w-screen h-screen overflow-hidden bg-[#e9dcc0] text-black">

            {/* BACKGROUND */}
            <img
                src="/forest-bg.png"
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* <div className="absolute inset-0 bg-[#f3ead6]/50"></div> */}

            {/* TOP PRESSURE BAR */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-[75%]">

                <div className="relative h-12 border-4 border-black rounded-full overflow-hidden bg-black/20 shadow-2xl">

                    {/* GREEN */}
                    {/* GREEN SIDE */}
                    <motion.div
                        animate={{
                            width: `${pressure}%`
                        }}
                        transition={{
                            duration: 0.08
                        }}
                        className="

    absolute
    left-0
    top-0
    h-full

    overflow-hidden

    rounded-r-full

    "

                        style={{

                            background:
                                `
            repeating-linear-gradient(
                -45deg,
                #58d94f,
                #58d94f 12px,
                #6fe865 12px,
                #6fe865 24px
            )
            `,

                            boxShadow:
                                `
            inset 0 6px 10px rgba(255,255,255,0.35),
            inset 0 -6px 10px rgba(0,0,0,0.25)
            `

                        }}

                    >

                        {/* GLOSS */}
                        <div className="

    absolute
    top-0
    left-0
    w-full
    h-1/2

    bg-white/20

    "></div>

                    </motion.div>

                    {/* RED */}
                    <motion.div
                        animate={{
                            width: `${100 - pressure}%`
                        }}
                        transition={{
                            duration: 0.08
                        }}
                        className="

    absolute
    right-0
    top-0
    h-full

    overflow-hidden

    rounded-l-full

    "

                        style={{

                            background:
                                `
            repeating-linear-gradient(
                -45deg,
                #ff5a3c,
                #ff5a3c 12px,
                #ff7a5c 12px,
                #ff7a5c 24px
            )
            `,

                            boxShadow:
                                `
            inset 0 6px 10px rgba(255,255,255,0.35),
            inset 0 -6px 10px rgba(0,0,0,0.25)
            `

                        }}

                    >

                        {/* GLOSS */}
                        <div className="

    absolute
    top-0
    left-0
    w-full
    h-1/2

    bg-white/20

    "></div>

                    </motion.div>

                    {/* CENTER DOT */}
                    <motion.div
                        animate={{
                            left: `calc(${pressure}% - 24px)`
                        }}
                        transition={{
                            duration: 0.1
                        }}
                        className="absolute top-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full border-4 border-black shadow-2xl"
                    ></motion.div>

                </div>

            </div>

            {/* TIMER */}
            <div className="absolute top-28 left-1/2 -translate-x-1/2 z-20 text-center">

                {room?.phase === 'countdown' ? (

                    <motion.h1
                        key={room?.countdown}
                        initial={{
                            scale: 0.5,
                            opacity: 0
                        }}
                        animate={{
                            scale: 1,
                            opacity: 1
                        }}
                        className="text-8xl font-black"
                    >
                        {room?.countdown}
                    </motion.h1>

                ) : room?.phase === 'battle' ? (

                    <h1 className="text-7xl font-black">
                        {room?.battleTimer}
                    </h1>

                ) : (

                    <h1 className="text-5xl font-black">
                        READY?
                    </h1>

                )}

            </div>

            {/* ROOM */}
            <div className="absolute bottom-10 left-10 z-20">

                <h1 className="text-4xl font-black">
                    Room: {roomId}
                </h1>

                <div className="mt-4 flex items-center gap-3">

                    <div className="w-6 h-6 rounded-full bg-black"></div>

                    <div className="w-48 h-5 border-2 border-black bg-white overflow-hidden rounded-full">

                        <motion.div
                            animate={{
                                width: `${myVolume}%`
                            }}
                            className="h-full bg-yellow-400"
                        ></motion.div>

                    </div>

                </div>

                <p className="mt-2 font-bold text-lg">
                    {micEnabled
                        ? 'Microphone Ready'
                        : 'Checking microphone...'}
                </p>

            </div>

            {/* LEFT PLAYER */}
            <div className="absolute left-24 top-1/2 -translate-y-1/2 z-10">

                <motion.div
                    animate={{
                        scale:
                            leftVolume > 20
                                ? [1, 1.05, 1]
                                : 1
                    }}
                    transition={{
                        repeat:
                            leftVolume > 20
                                ? Infinity
                                : 0,
                        duration: 0.4
                    }}
                    className="relative"
                >

                    {/* BARK WAVE */}
                    <AnimatePresence>

                        {leftVolume > 20 && (

                            <motion.div
                                initial={{
                                    scale: 1,
                                    opacity: 0.8
                                }}
                                animate={{
                                    scale: 1.4,
                                    opacity: 0
                                }}
                                exit={{
                                    opacity: 0
                                }}
                                transition={{
                                    duration: 0.7,
                                    repeat: Infinity
                                }}
                                className="absolute inset-0 rounded-full border-[10px] border-black"
                            ></motion.div>

                        )}

                    </AnimatePresence>

                    <div className="w-72 h-72 rounded-full overflow-hidden border-[10px] border-black shadow-2xl bg-white">

                        {leftPlayer?.image ? (

                            <img
                                src={leftPlayer.image}
                                alt=""
                                className="w-full h-full object-cover"
                            />

                        ) : (

                            <div className="w-full h-full bg-black/20"></div>

                        )}

                    </div>

                    {/* READY */}
                    {leftPlayer?.ready &&
                        room?.phase === 'waiting' && (

                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-green-500 border-4 border-black rounded-xl text-2xl font-black">
                                READY
                            </div>

                        )}

                </motion.div>

            </div>

            {/* RIGHT PLAYER */}
            <div className="absolute right-24 top-1/2 -translate-y-1/2 z-10">

                <motion.div
                    animate={{
                        scale:
                            rightVolume > 20
                                ? [1, 1.05, 1]
                                : 1
                    }}
                    transition={{
                        repeat:
                            rightVolume > 20
                                ? Infinity
                                : 0,
                        duration: 0.4
                    }}
                    className="relative"
                >

                    {/* BARK WAVE */}
                    <AnimatePresence>

                        {rightVolume > 20 && (

                            <motion.div
                                initial={{
                                    scale: 1,
                                    opacity: 0.8
                                }}
                                animate={{
                                    scale: 1.4,
                                    opacity: 0
                                }}
                                exit={{
                                    opacity: 0
                                }}
                                transition={{
                                    duration: 0.7,
                                    repeat: Infinity
                                }}
                                className="absolute inset-0 rounded-full border-[10px] border-black"
                            ></motion.div>

                        )}

                    </AnimatePresence>

                    <div className="w-72 h-72 rounded-full overflow-hidden border-[10px] border-black shadow-2xl bg-white">

                        {rightPlayer?.image ? (

                            <img
                                src={rightPlayer.image}
                                alt=""
                                className="w-full h-full object-cover"
                            />

                        ) : (

                            <div className="w-full h-full bg-black/20"></div>

                        )}

                    </div>

                    {/* READY */}
                    {rightPlayer?.ready &&
                        room?.phase === 'waiting' && (

                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-green-500 border-4 border-black rounded-xl text-2xl font-black">
                                READY
                            </div>

                        )}

                </motion.div>

            </div>

            {/* WAITING */}
            {players.length < 2 && (

                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">

                    <div className="text-center">

                        <h1 className="text-5xl font-black mb-4">
                            WAITING FOR OPPONENT
                        </h1>

                        <p className="text-2xl font-bold">
                            Share Room ID: {roomId}
                        </p>

                    </div>

                </div>

            )}

            {/* READY BUTTON */}
            {room?.phase === 'waiting' &&
                players.length === 2 && (

                    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20">

                        <motion.button
                            whileTap={{
                                scale: 0.95
                            }}
                            onClick={() => {
                                socket.emit(
                                    'bark:ready'
                                )
                            }}
                            className="px-24 py-6 bg-yellow-400 border-[6px] border-black rounded-3xl text-5xl font-black shadow-2xl"
                        >
                            READY
                        </motion.button>

                    </div>

                )}

            {/* WINNER SCREEN */}
            <AnimatePresence>

                {room?.phase === 'finished' && (

                    <motion.div
                        initial={{
                            opacity: 0
                        }}
                        animate={{
                            opacity: 1
                        }}
                        exit={{
                            opacity: 0
                        }}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm z-50"
                    >

                        {/* LOSER KICKOUT */}
                        {loserPlayer && (

                            <motion.div
                                initial={{
                                    x: 0,
                                    rotate: 0,
                                    opacity: 1
                                }}
                                animate={{
                                    x: -2000,
                                    rotate: -40,
                                    opacity: 0
                                }}
                                transition={{
                                    duration: 1.2
                                }}
                                className="absolute left-1/2 top-1/2"
                            >

                                <img
                                    src={loserPlayer.image}
                                    alt=""
                                    className="w-72 h-72 rounded-full object-cover border-[10px] border-red-500"
                                />

                            </motion.div>

                        )}

                        {/* WINNER */}
                        {winnerPlayer && (

                            <motion.div
                                initial={{
                                    scale: 0.5,
                                    opacity: 0
                                }}
                                animate={{
                                    scale: 1,
                                    opacity: 1
                                }}
                                transition={{
                                    delay: 0.8,
                                    duration: 0.7
                                }}
                                className="absolute inset-0 flex flex-col items-center justify-center"
                            >

                                <motion.div
                                    animate={{
                                        scale: [1, 1.05, 1]
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 1.5
                                    }}
                                    className="relative"
                                >

                                    <motion.div
                                        animate={{
                                            scale: [1, 1.5],
                                            opacity: [0.7, 0]
                                        }}
                                        transition={{
                                            repeat: Infinity,
                                            duration: 1.5
                                        }}
                                        className="absolute inset-0 rounded-full border-[12px] border-yellow-400"
                                    ></motion.div>

                                    <img
                                        src={winnerPlayer.image}
                                        alt=""
                                        className="relative z-10 w-96 h-96 rounded-full object-cover border-[12px] border-yellow-400 shadow-[0_0_80px_rgba(255,255,0,0.6)]"
                                    />

                                </motion.div>

                                <h1 className="mt-10 text-8xl font-black text-white">
                                    WINNER
                                </h1>

                                <button
                                    onClick={() => {
                                        window.location.reload()
                                    }}
                                    className="mt-10 px-16 py-5 bg-yellow-400 border-[6px] border-black rounded-3xl text-4xl font-black"
                                >
                                    PLAY AGAIN
                                </button>

                            </motion.div>

                        )}

                    </motion.div>

                )}

            </AnimatePresence>

        </div>

    )

}