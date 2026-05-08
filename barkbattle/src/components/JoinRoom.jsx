function JoinRoom({
    playerName,
    setPlayerName,
    roomId,
    setRoomId,
    joinRoom
}) {

    return (

        <div className="min-h-screen flex items-center justify-center">

            <div className="w-full max-w-md bg-white/10 border border-white/10 rounded-3xl p-8">

                <img src="/FF_SHORT_LOGO.png" alt="FF" className="w-16 h-16 mx-auto mb-4" />
                <h1 className="text-5xl font-bold text-center mb-2">
                    BanPick Arena
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

    )

}

export default JoinRoom