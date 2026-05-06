import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { socket } from '../socket'
import {
    Ban,
    Crown,
    Flame,
    Droplets,
    Wind,
    Zap,
    Share2,
} from 'lucide-react'

import { characters } from '../data/characters'

function DraftArena({
    room,
    roomId,
    flipping,
    coinResult,
    flipCoin,
}) {

    const [selectedCharId, setSelectedCharId] =
        useState(null)

    const isMyTurn =
        socket.id === room?.currentTurn


    const handleConfirmBan = () => {

        if (!canInteract) return

        if (selectedCharId === null) return

        socket.emit('draft_action', {
            characterId: selectedCharId
        })

        setSelectedCharId(null)

    }

    // ICONS
    const getSkillIcon = (id) => {
        var char = characters.find(
            c => c.id === id
        )
        return char ? char.skillImage : null
    }

    // WAITING FOR OPPONENT


    // COUNTDOWN
    if (room?.phase === 'countdown') {

        return (

            <div className="w-full h-screen flex items-center justify-center text-white">

                <motion.h1

                    key={room.countdown}

                    initial={{
                        scale: 0.5,
                        opacity: 0
                    }}

                    animate={{
                        scale: 1,
                        opacity: 1
                    }}

                    className="text-[200px] font-black"

                >

                    {room.countdown}

                </motion.h1>

            </div>

        )

    }
    const visibleCharacters =
        room?.phase?.includes('active')
            ? characters.filter(
                c => c.type === 'active'
            )
            : characters.filter(
                c => c.type === 'passive'
            )
    const isBanPhase =
        room?.currentAction === 'ban'

    const isPickPhase =
        room?.currentAction === 'pick'

    const allPickedCharacters = [

        ...(room?.pickedCharacters?.blue || []),

        ...(room?.pickedCharacters?.red || []),

    ]


    const mySocketId = socket.id

    const canInteract =
        mySocketId === room?.currentTurn

    const blueTeam =
        room?.pickedCharacters?.blue || []

    const redTeam =
        room?.pickedCharacters?.red || []

    const getCharacterById = (id) => {

        return characters.find(
            c => c.id === id
        )

    }

    const isFinished =
        room?.phase === 'finished'


    const blueCharacters =
        blueTeam
            .map(getCharacterById)
            .sort((a, b) => {

                if (a.type === 'active') return -1
                if (b.type === 'active') return 1

                return 0

            })


    const redCharacters =
        redTeam
            .map(getCharacterById)
            .sort((a, b) => {

                if (a.type === 'active') return -1
                if (b.type === 'active') return 1

                return 0

            })

    return (

        <div className="relative w-full h-screen overflow-hidden text-white">

            {/* BACKGROUND */}
            <div className="absolute inset-0 overflow-hidden">

                {/* SPLIT */}
                <div className="absolute inset-0 flex">

                    <div className="w-1/2 bg-gradient-to-br from-[#003B8E]/40 to-black"></div>

                    <div className="w-1/2 bg-gradient-to-bl from-[#7A0000]/40 to-black"></div>

                </div>

                {/* GLOW */}
                <div className="absolute left-0 top-0 w-[500px] h-[500px] bg-cyan-500/10 blur-[150px] rounded-full"></div>

                <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-red-500/10 blur-[150px] rounded-full"></div>

                {/* PARTICLES */}
                {/* {Array.from({ length: 20 }).map((_, i) => (

                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"

                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}

                        animate={{
                            y: [0, -100],
                            opacity: [0, 1, 0],
                        }}

                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            delay: Math.random() * 5,
                        }}
                    />

                ))} */}

            </div>

            {/* CONTENT */}
            <div className="relative z-10 flex h-full p-4 gap-5">

                {/* LEFT TEAM */}
                <div className="w-72 flex flex-col">

                    {/* PLAYER */}
                    <div className="bg-black/40 border border-cyan-400/30 backdrop-blur-xl p-4 rounded-2xl mb-5">

                        <div className="flex items-center gap-3">

                            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-cyan-400">

                                <img
                                    src="/avatar/avatar1.jpg"
                                    className="w-full h-full object-cover"
                                />

                            </div>

                            <div>

                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                    <Crown size={12} />
                                    TEAM BLUE
                                </p>

                                <h2 className="text-xl font-bold text-cyan-400">
                                    {room?.players?.[0]?.name || 'Waiting...'}
                                </h2>

                            </div>

                        </div>

                    </div>

                    {/* PICK SLOTS */}
                    <div className="space-y-3">

                        {Array.from({ length: 4 }).map((_, i) => {

                            const pickedId =
                                blueTeam[i]

                            const pickedChar =
                                getCharacterById(pickedId)

                            return (

                                <div
                                    key={i}
                                    className="h-24 bg-black/30 border border-cyan-400/20 rounded-xl overflow-hidden"
                                >

                                    {pickedChar ? (

                                        <div className="relative w-80 h-full">

                                            <img
                                                src={pickedChar.image}
                                                alt={pickedChar.name}
                                                className="w-full h-full object-cover"
                                            />

                                            <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent"></div>

                                            <div className="absolute bottom-2 left-2">
                                                <img
                                                    src={pickedChar.skillImage}
                                                    alt={pickedChar.name}
                                                    className="w-10 h-10 mb-2"
                                                />

                                                <p className="font-bold">
                                                    {pickedChar.name}
                                                </p>

                                            </div>

                                        </div>

                                    ) : null}

                                </div>

                            )

                        })}

                    </div>

                </div>

                {/* CENTER */}
                <div className="flex-1 flex flex-col">

                    {/* TOP */}
                    <div className="flex flex-col items-center">

                        {/* here was roomid and invite link */}

                        {/* PHASE */}
                        <div className="relative mb-1">

                            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-red-500 blur opacity-30"></div>

                            <div className="relative bg-[#150c2d] border-y border-cyan-400/40 px-16 py-3">

                                <h1 className="text-xl font-black tracking-[0.2em]">
                                    {
                                        room?.phase === 'active_ban_1'
                                            ? 'BAN ACTIVE SKILL'
                                            : room?.phase
                                    }                                </h1>

                            </div>

                        </div>

                        {/* TIMER */}
                        <motion.div

                            animate={room?.timer <= 10 ? {
                                scale: [1, 1.1, 1],
                            } : {}}

                            transition={{
                                repeat: Infinity,
                                duration: 1,
                            }}

                            className={`text-5xl font-black mb-1 ${room?.timer <= 10
                                ? 'text-red-500'
                                : 'text-white'
                                }`}
                        >

                            {room?.timer || 0}

                        </motion.div>

                        {/* coin toss  */}
                        {room?.phase === 'coin_toss' && (

                            <motion.div

                                animate={{
                                    rotateY: room?.flipping ? 1440 : 0,
                                    scale: room?.flipping ? 1.2 : 1,
                                }}

                                transition={{
                                    duration: 3,
                                }}

                                className="w-36 h-36 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-2xl flex items-center justify-center text-4xl font-black mb-4"
                            >

                                {room?.coinResult || 'FF'}

                            </motion.div>

                        )}



                    </div>

                    {room?.phase === 'waiting' && (

                        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">

                            <div className="text-center">

                                <h1 className="text-6xl font-black text-red-500 mb-4">
                                    WAITING FOR OPPONENT
                                </h1>

                                <p className="text-gray-300 text-xl">
                                    Share Room ID:
                                    <span className="text-cyan-400 ml-2">
                                        {roomId}
                                    </span>
                                </p>

                            </div>

                        </div>

                    )}

                    {/* my turn or not  */}
                    <div className={`text-lg font-bold
${isMyTurn
                            ? 'text-cyan-400'
                            : 'text-red-400'
                        }`}>
                        {isMyTurn
                            ? 'YOUR TURN'
                            : 'OPPONENT TURN'}
                    </div>

                    {/* CHARACTER GRID */}
                    {!isFinished && (

                        <div className="grid grid-cols-5 gap-2 flex-1 overflow-y-auto pr-2 auto-rows-[220px] custom-scrollbar">

                            {visibleCharacters.map((char) => {

                                const isSelected =
                                    selectedCharId === char.id

                                const isBanned =
                                    room?.bannedCharacters?.includes(char.id)
                                const isPicked =
                                    allPickedCharacters.includes(char.id)
                                return (

                                    <motion.div
                                        key={char.id}

                                        onClick={() => {

                                            if (!canInteract) return

                                            if (isBanned) return

                                            if (isPicked) return

                                            setSelectedCharId(char.id)

                                        }}

                                        className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all duration-300

    ${isSelected
                                                ? isBanPhase
                                                    ? 'border-red-500'
                                                    : 'border-cyan-400'
                                                : 'border-[#1a2332]'
                                            }

${isBanned
                                                ? 'opacity-40 grayscale cursor-not-allowed'
                                                : isPicked
                                                    ? 'opacity-50 cursor-not-allowed'
                                                    : 'cursor-pointer'
                                            }
    `}
                                    >

                                        {/* IMAGE */}
                                        <img
                                            src={char.image}
                                            alt={char.name}
                                            className="w-full h-full object-cover"
                                        />

                                        {/* OVERLAY */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>

                                        {/* NAME */}
                                        <div className="absolute bottom-2 left-0 w-full text-center">

                                            <p className="text-sm font-bold">
                                                {char.name}
                                            </p>

                                        </div>

                                        {/* SKILL */}
                                        <div className={`absolute top-2 right-2 w-8 h-8 bg-black/70 border rotate-45 flex items-center justify-center

    ${isBanPhase
                                                ? 'border-red-500'
                                                : 'border-cyan-400'
                                            }
    `}>

                                            <div className={`${isBanPhase
                                                ? 'text-red-400'
                                                : 'text-cyan-400'
                                                } -rotate-45`}>


                                                <img
                                                    src={getSkillIcon(char.id)}
                                                    alt={getSkillIcon(char.id)}
                                                    className="w-8 h-8"
                                                />

                                            </div>

                                        </div>

                                        {/* SELECTED */}
                                        {isSelected && !isBanned && (

                                            <div className={`absolute inset-0 border-4 rounded-xl

        ${isBanPhase
                                                    ? 'border-red-500'
                                                    : 'border-cyan-400'
                                                }
        `}></div>

                                        )}

                                        {/* BANNED */}
                                        {isBanned && (

                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">

                                                <div className="relative w-24 h-24">

                                                    <div className="absolute top-1/2 left-0 w-full h-1 bg-red-500 rotate-45 shadow-[0_0_20px_red]"></div>

                                                    <div className="absolute top-1/2 left-0 w-full h-1 bg-red-500 -rotate-45 shadow-[0_0_20px_red]"></div>

                                                </div>

                                            </div>

                                        )}

                                        {/* PICKED */}
                                        {isPicked && !isBanned && (

                                            <div className="absolute inset-0 bg-cyan-500/20 border-4 border-cyan-400">

                                                <div className="absolute top-2 left-2 px-2 py-1 bg-cyan-500 text-black text-xs font-black rounded">

                                                    PICKED

                                                </div>

                                            </div>

                                        )}

                                    </motion.div>

                                )

                            })}

                        </div>
                    )}
                    {isFinished && (

                        <div className="absolute inset-0 z-40 bg-[#050816]/95 backdrop-blur-md flex items-center justify-center px-10">

                            <div className="w-full max-w-7xl grid grid-cols-3 items-center gap-10">

                                {/* BLUE TEAM */}
                                <div>

                                    <h1 className="text-4xl font-black text-cyan-400 mb-8">
                                        BLUE TEAM
                                    </h1>

                                    <div className="space-y-4">

                                        {blueCharacters.map((char, i) => {

                                            if (!char) return null

                                            return (

                                                <div
                                                    key={char.id}
                                                    className="relative h-28 rounded-2xl overflow-hidden border border-cyan-400/40 bg-black/40 shadow-[0_0_30px_rgba(0,255,255,0.15)]"
                                                >

                                                    <img
                                                        src={char.image}
                                                        alt={char.name}
                                                        className="absolute inset-0 w-full h-full object-cover object-top opacity-70"
                                                    />

                                                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>

                                                    <div className="relative z-10 h-full flex items-center gap-5 px-5">

                                                        {/* SKILL */}
                                                        <div className="w-14 h-14 rotate-45 overflow-hidden border border-cyan-400 bg-black/70">

                                                            <img
                                                                src={char.skillImage}
                                                                alt={char.name}
                                                                className="w-full h-full object-cover -rotate-45 scale-150"
                                                            />

                                                        </div>

                                                        {/* INFO */}
                                                        <div>

                                                            <p className="text-2xl font-black">
                                                                {char.name}
                                                            </p>

                                                            <p className="text-cyan-300 text-sm uppercase tracking-widest">
                                                                {char.type}
                                                            </p>

                                                        </div>

                                                    </div>

                                                </div>

                                            )

                                        })}

                                    </div>

                                </div>

                                {/* CENTER VS */}
                                <div className="flex flex-col items-center justify-center">

                                    <h1 className="text-8xl font-black text-white/90 mb-4">
                                        VS
                                    </h1>

                                    <p className="text-gray-400 text-lg tracking-[0.4em] uppercase">
                                        Draft Complete
                                    </p>

                                </div>

                                {/* RED TEAM */}
                                <div>

                                    <h1 className="text-4xl font-black text-red-400 mb-8 text-right">
                                        RED TEAM
                                    </h1>

                                    <div className="space-y-4">

                                        {redCharacters.map((char, i) => {

                                            if (!char) return null

                                            return (

                                                <div
                                                    key={char.id}
                                                    className="relative h-28 rounded-2xl overflow-hidden border border-red-400/40 bg-black/40 shadow-[0_0_30px_rgba(255,0,0,0.15)]"
                                                >

                                                    <img
                                                        src={char.image}
                                                        alt={char.name}
                                                        className="absolute inset-0 w-full h-full object-cover object-top opacity-70"
                                                    />

                                                    <div className="absolute inset-0 bg-gradient-to-l from-black via-black/40 to-transparent"></div>

                                                    <div className="relative z-10 h-full flex items-center justify-end gap-5 px-5">

                                                        {/* INFO */}
                                                        <div className="text-right">

                                                            <p className="text-2xl font-black">
                                                                {char.name}
                                                            </p>

                                                            <p className="text-red-300 text-sm uppercase tracking-widest">
                                                                {char.type}
                                                            </p>

                                                        </div>

                                                        {/* SKILL */}
                                                        <div className="w-14 h-14 rotate-45 overflow-hidden border border-red-400 bg-black/70">

                                                            <img
                                                                src={char.skillImage}
                                                                alt={char.name}
                                                                className="w-full h-full object-cover -rotate-45 scale-150"
                                                            />

                                                        </div>

                                                    </div>

                                                </div>

                                            )

                                        })}

                                    </div>

                                </div>

                            </div>

                        </div>

                    )}


                    {/* ACTION */}
                    <div className="flex justify-center mt-5">

                        <motion.button

                            whileHover={{
                                scale: 1.05,
                            }}

                            whileTap={{
                                scale: 0.95,
                            }}

                            onClick={handleConfirmBan}

                            disabled={
                                selectedCharId === null ||
                                !canInteract
                            }
                            className={`px-16 py-4 rounded-2xl text-xl font-black tracking-widest border

              ${selectedCharId !== null
                                    ? 'bg-cyan-500 border-cyan-400'
                                    : 'bg-gray-700 border-gray-600 opacity-50'
                                }
              `}
                        >

                            {isBanPhase
                                ? 'CONFIRM BAN'
                                : 'CONFIRM PICK'}
                        </motion.button>

                    </div>

                </div>

                {/* RIGHT TEAM */}
                <div className="w-72 flex flex-col">

                    {/* PLAYER */}
                    <div className="bg-black/40 border border-red-400/30 backdrop-blur-xl p-4 rounded-2xl mb-5">

                        <div className="flex items-center gap-3">

                            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-red-400">

                                <img
                                    src="/avatar/avatar2.jpg"
                                    className="w-full h-full object-cover"
                                />

                            </div>

                            <div>

                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                    <Crown size={12} />
                                    TEAM RED
                                </p>

                                <h2 className="text-xl font-bold text-red-400">
                                    {room?.players?.[1]?.name || 'Waiting...'}
                                </h2>

                            </div>

                        </div>

                    </div>

                    {/* PICK SLOTS */}
                    <div className="space-y-3">

                        {Array.from({ length: 4 }).map((_, i) => {

                            const pickedId =
                                redTeam[i]

                            const pickedChar =
                                getCharacterById(pickedId)

                            return (

                                <div
                                    key={i}
                                    className="h-24 bg-black/30 border border-red-400/20 rounded-xl overflow-hidden"
                                >

                                    {pickedChar ? (

                                        <div className="relative w-full h-full">

                                            <img
                                                src={pickedChar.image}
                                                alt={pickedChar.name}
                                                className="w-full h-full object-cover"
                                            />

                                            <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent"></div>

                                            <div className="absolute bottom-2 right-2">
                                                <img
                                                    src={pickedChar.skillImage}
                                                    alt={pickedChar.name}
                                                    className="w-10 h-10 mb-2 float-right"
                                                />

                                                <p className="font-bold">
                                                    {pickedChar.name}
                                                </p>

                                            </div>

                                        </div>

                                    ) : null}

                                </div>

                            )

                        })}

                    </div>



                </div>

            </div>

        </div>

    )

}

export default DraftArena