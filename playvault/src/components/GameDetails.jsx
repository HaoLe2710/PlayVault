function GameDetails({ game }) {
  const releaseDate = new Date(game.details.published_date.$date).toLocaleDateString("vi-VN")

  return (
    <div className="space-y-4 bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
      <h2 className="text-3xl font-bold text-white">{game.name}</h2>
      <p className="text-purple-100">{game.details.describe}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div className="space-y-2">
          <p className="flex items-center">
            <span className="text-purple-300 font-medium w-32">Publisher:</span>
            <span className="text-white">{game.details.publisher}</span>
          </p>
          <p className="flex items-center">
            <span className="text-purple-300 font-medium w-32">Release Date:</span>
            <span className="text-white">{releaseDate}</span>
          </p>
        </div>
        <div className="space-y-2">
          <p className="flex items-center">
            <span className="text-purple-300 font-medium w-32">Age Limit:</span>
            <span className="text-white">{game.details["age-limit"]}</span>
          </p>
          <p className="flex items-center">
            <span className="text-purple-300 font-medium w-32">Tags:</span>
            <span className="text-white">{game.tags.join(", ")}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default GameDetails
