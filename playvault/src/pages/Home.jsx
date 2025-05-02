"use client"

import { useEffect, useState } from "react"
import GameCard from "../components/GameCard"
import GameCarousel from "../components/GameCarousel"
import { Button } from "../components/ui/Button"
import { getGames } from "../api/games"
import { Gamepad2, Sword, Target, Trophy, Car, CastleIcon as ChessKnight } from "lucide-react"

function Home() {
  const [games, setGames] = useState([])
  const [featuredGames, setFeaturedGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Fetch all games
    getGames()
      .then((allGames) => {
        setGames(allGames)
        // Select featured games (e.g., first 3 games with images)
        const featured = allGames.filter((game) => game.images && game.images.length > 0).slice(0, 3)
        setFeaturedGames(featured)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching games:", error)
        setError("Failed to load games. Please try again later.")
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-16 h-16 border-4 border-purple-300 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-300">
        <p className="text-xl mb-4">{error}</p>
        <Button
          variant="outline"
          className="border-purple-400 text-purple-200 hover:bg-purple-700 hover:text-white"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      {/* Featured Games Carousel */}
      {featuredGames.length > 0 && (
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-6 text-white">Featured Games</h2>
          <GameCarousel images={featuredGames.map((game) => game.thumbnail_image)} gameName="Featured" />
        </div>
      )}

      {/* Browse by Category */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold mb-6 text-white">Browse by Category</h2>
        <div className="flex flex-wrap gap-4">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6">
            <Gamepad2 className="mr-2 h-5 w-5" /> All Games
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6">
            <Sword className="mr-2 h-5 w-5" /> Action
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6">
            <Target className="mr-2 h-5 w-5" /> Shooter
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6">
            <Trophy className="mr-2 h-5 w-5" /> Sports
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6">
            <Car className="mr-2 h-5 w-5" /> Racing
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6">
            <ChessKnight className="mr-2 h-5 w-5" /> Strategy
          </Button>
        </div>
      </div>

      {/* All Games */}
      <h2 className="text-3xl font-bold mb-6 text-white">All Games</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  )
}

export default Home
