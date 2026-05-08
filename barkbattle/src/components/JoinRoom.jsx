import { useEffect, useState } from 'react'

import {
    motion,
    AnimatePresence
} from 'framer-motion'

import { Expand } from 'lucide-react'


function JoinRoom({

    roomId,
    setRoomId,

    playerImage,
    setPlayerImage,

    joinRoom

}) {

    const [showRules, setShowRules] =
        useState(true)

    const [toast, setToast] =
        useState(null)
    const showToast = (
        message,
        type = 'error'
    ) => {

        setToast({
            message,
            type
        })

        setTimeout(() => {

            setToast(null)

        }, 2500)

    }

    const enterFullscreen = async () => {

        const element =
            document.documentElement

        try {

            if (
                element.requestFullscreen
            ) {

                await element.requestFullscreen()

            }

        } catch (err) {

            console.log(err)

        }

    }

    const handleImageUpload = (e) => {

        const file = e.target.files[0]

        if (!file) return

        const reader = new FileReader()

        reader.onloadend = () => {

            setPlayerImage(reader.result)
            localStorage.setItem(
                'barkbattle-profile-image',
                reader.result
            )
            showToast(
                'Profile image uploaded!',
                'success'
            )

        }

        reader.readAsDataURL(file)

    }

    useEffect(() => {

        const listener = (e) => {

            showToast(
                e.detail.message,
                e.detail.type
            )

        }

        window.addEventListener(
            'show-toast',
            listener
        )

        return () => {

            window.removeEventListener(
                'show-toast',
                listener
            )

        }

    }, [])

    return (

        <div className="relative w-screen h-screen overflow-hidden">
            {/* FULLSCREEN */}
            <button onClick={enterFullscreen} className="    absolute    top-4    right-4    z-50    w-14    h-14 text-white"> <Expand size={28} /></button>

            {/* BACKGROUND */}
            <img
                src="/forest-bg.png"
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* <div className="absolute inset-0 bg-[#f3ead6]/60 backdrop-blur-[2px]"></div> */}

            {/* MAIN */}
            <div className="relative z-10 w-full h-full flex items-center justify-center px-6">

                <div className="w-lg max-w-xl bg-[#f7ebd0]/90 border-[4px] border-black rounded-[40px] shadow-2xl p-6">

                    {/* TITLE */}
                    <div className="text-center">

                        <h1 className="text-6xl font-black text-black mb-1">

                            Bark Battle

                        </h1>

                        <p className="text-xl font-bold text-black/70">

                            Multiplayer Barking Arena

                        </p>

                    </div>

                    {/* IMAGE */}
                    <div className="mt-4 flex justify-center">

                        <div className="relative">

                            <div className="w-44 h-44 rounded-full overflow-hidden border-[4px] border-black bg-white shadow-xl">

                                {playerImage ? (

                                    <img
                                        src={playerImage}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />

                                ) : (

                                    <div className="w-full h-full flex items-center justify-center text-6xl">

                                        🐶

                                    </div>

                                )}

                            </div>

                            <label className="absolute bottom-0 right-0 w-14 h-14 rounded-full bg-yellow-400 border-2 border-black flex items-center justify-center cursor-pointer text-2xl hover:scale-105 transition-all">

                                📷

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />

                            </label>

                        </div>

                    </div>

                    {/* ROOM */}
                    <div className="mt-4">

                        <input
                            type="text"
                            placeholder="Room ID"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)}
                            className="w-full bg-white border-[4px] border-black rounded-2xl px-6 py-5 text-xl font-bold outline-none"
                        />

                    </div>

                    {/* JOIN */}
                    <button
                        onClick={joinRoom}
                        className="mt-4 w-full py-5 bg-yellow-400 border-[4px] border-black rounded-2xl text-3xl font-black hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                    >

                        ENTER BATTLE

                    </button>

                    {/* RULE BUTTON */}
                    <button
                        onClick={() => setShowRules(true)}
                        className="mt-4 w-full py-4 bg-white border-[4px] border-black rounded-2xl text-2xl font-black hover:bg-black hover:text-white transition-all"
                    >

                        GAME RULES

                    </button>

                </div>

            </div>

            {/* TOAST */}
            <AnimatePresence>

                {toast && (

                    <motion.div
                        initial={{
                            y: -100,
                            opacity: 0,
                            scale: 0.8
                        }}
                        animate={{
                            y: 0,
                            opacity: 1,
                            scale: 1
                        }}
                        exit={{
                            y: -100,
                            opacity: 0,
                            scale: 0.8
                        }}
                        transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 25
                        }}
                        className="absolute top-6 left-1/2 -translate-x-1/2 z-[100]"
                    >

                        <div className={`

            px-10
            py-5
            rounded-2xl
            border-[5px]
            border-black
            shadow-2xl
            text-3xl
            font-black

            ${toast.type === 'success'
                                ? 'bg-green-400 text-black'
                                : 'bg-red-400 text-black'
                            }

            `}>

                            {toast.message}

                        </div>

                    </motion.div>

                )}

            </AnimatePresence>



            {/* RULE MODAL */}
            {showRules && (

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
                    className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-6">

                    <motion.div
                        initial={{
                            scale: 0.7,
                            rotate: -4,
                            opacity: 0
                        }}
                        animate={{
                            scale: 1,
                            rotate: 0,
                            opacity: 1
                        }}
                        transition={{
                            type: 'spring',
                            stiffness: 180,
                            damping: 18
                        }}
                        className="w-full max-w-2xl bg-[#f7ebd0] border-[6px] border-black rounded-[40px] p-10 shadow-2xl relative">

                        {/* CLOSE */}
                        <button
                            onClick={() => setShowRules(false)}
                            className="absolute top-5 right-5 w-12 h-12 rounded-full bg-red-500 border-4 border-black text-white text-2xl font-black"
                        >

                            X

                        </button>

                        <h1 className="text-6xl font-black text-center mb-8">

                            HOW TO PLAY

                        </h1>

                        <div className="space-y-6 text-2xl font-bold leading-relaxed">

                            <div className="flex gap-4">

                                <span>🎤</span>

                                <p>
                                    Allow microphone access before joining.
                                </p>

                            </div>

                            <div className="flex gap-4">

                                <span>🐶</span>

                                <p>
                                    Bark louder than your opponent to push the bar.
                                </p>

                            </div>

                            <div className="flex gap-4">

                                <span>⚔️</span>

                                <p>
                                    The center white dot moves based on barking power.
                                </p>

                            </div>

                            <div className="flex gap-4">

                                <span>🏆</span>

                                <p>
                                    Push the dot fully to the enemy side or survive with more pressure.
                                </p>

                            </div>

                            <div className="flex gap-4">

                                <span>⏳</span>

                                <p>
                                    Each battle lasts 30 seconds maximum.
                                </p>

                            </div>

                        </div>

                        <button
                            onClick={() => setShowRules(false)}
                            className="mt-10 w-full py-5 bg-yellow-400 border-[5px] border-black rounded-2xl text-4xl font-black"
                        >

                            GOT IT

                        </button>

                    </motion.div>

                </motion.div>

            )}

        </div>

    )

}

export default JoinRoom