import { motion } from 'framer-motion'

function RotateDevice() {

    return (

        <div className="fixed inset-0 z-[9999] bg-[#050816] flex flex-col items-center justify-center lg:hidden">

            {/* Glow Background */}
            <div className="absolute w-72 h-72 bg-blue-500/20 blur-3xl rounded-full"></div>

            {/* Phone */}
            <motion.div

                animate={{
                    rotate: [0, 90, 90, 0],
                }}

                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}

                className="relative w-24 h-40 border-4 border-white rounded-[30px] mb-10"

            >

                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-white rounded-full"></div>

            </motion.div>

            {/* Text */}
            <motion.h1

                animate={{
                    opacity: [0.5, 1, 0.5],
                }}

                transition={{
                    duration: 2,
                    repeat: Infinity,
                }}

                className="text-3xl font-black text-center mb-3"

            >

                Rotate Device

            </motion.h1>

            <p className="text-gray-400 text-center px-10">
                This game is designed for landscape mode like real esports drafts.
            </p>

        </div>

    )

}

export default RotateDevice