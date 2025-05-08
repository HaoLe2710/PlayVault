// src/pages/GameDetail.jsx
"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Heart, ShoppingCart, Share2, ThumbsUp, ThumbsDown, MessageSquare, Clock, User } from "lucide-react"
import GameCarousel from "../components/GameCarousel"
import GameConfig from "../components/GameConfig"
import RelatedGames from "../components/RelatedGames"
import { Button } from "../components/ui/Button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { getGameById, getGames } from "../api/games"
import { getCommentsByGameIdWithUsers } from "../api/comments"

function GameDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [game, setGame] = useState(null)
  const [relatedGames, setRelatedGames] = useState([])
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reviews, setReviews] = useState([])

  // Tính rating trung bình và số lượt review
  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0
  const reviewCount = reviews.length

  useEffect(() => {
    // Fetch game details
    getGameById(id)
      .then((data) => {
        setGame(data)
        // Check if game is in favorites
        const favorites = JSON.parse(localStorage.getItem("favorites") || "[]")
        setIsFavorite(favorites.includes(data.id))

        // Fetch comments with user info
        getCommentsByGameIdWithUsers(data.id)
          .then((reviewData) => {
            setReviews(reviewData)
          })
          .catch((err) => {
            console.error("Error loading reviews:", err)
            setReviews([])
          })

        // Fetch related games
        getGames()
          .then((allGames) => {
            const filtered = allGames
              .filter((g) => g.id !== data.id && g.thumbnail_image)
              .filter((g) => g.tags.some((tag) => data.tags.includes(tag)))
              .slice(0, 4)
            setRelatedGames(filtered)
            setLoading(false)
          })
          .catch((err) => {
            console.error("Error fetching related games:", err)
            setError("Failed to load related games. Please try again later.")
            setLoading(false)
          })
      })
      .catch((error) => {
        console.error("Error fetching game:", error)
        setError("Failed to load game details. Please try again later.")
        setLoading(false)
      })
  }, [id, navigate])

  const handleFavoriteToggle = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]")
    if (isFavorite) {
      const updatedFavorites = favorites.filter((favId) => favId !== game.id)
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites))
      setIsFavorite(false)
    } else {
      favorites.push(game.id)
      localStorage.setItem("favorites", JSON.stringify(favorites))
      setIsFavorite(true)
    }
  }

  const handleBuyNow = () => {
    alert(`You have selected to buy ${game.name}!`)
    // Implement actual purchase logic here
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
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
          onClick={() => navigate("/")}
        >
          Back to Home
        </Button>
      </div>
    )
  }

  const releaseDate = new Date(game.details.published_date.$date).toLocaleDateString("vi-VN")

  return (
    <div className="container mx-auto py-10">
      {/* Game Title */}
      <h1 className="text-4xl font-bold mb-6 text-white">{game.name}</h1>

      {/* Main Content - Steam-like Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column - Carousel */}
        <div className="lg:col-span-2">
          {game.images && game.images.length > 0 && (
            <GameCarousel images={game.images} gameName={game.name} autoSlide={true} autoSlideInterval={2000} />
          )}
        </div>

        {/* Right Column - Game Info */}
        <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-500/30">
          {/* Game Description */}
          <div className="mb-6">
            <p className="text-purple-100">{game.details.describe}</p>
          </div>

          {/* Game Metadata */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div className="flex items-center">
              <span className="text-purple-300 w-24">Publisher:</span>
              <span className="text-white font-medium">{game.details.publisher}</span>
            </div>
            <div className="flex items-center">
              <span className="text-purple-300 w-24">Release Date:</span>
              <span className="text-white font-medium">{releaseDate}</span>
            </div>
            <div className="flex items-center">
              <span className="text-purple-300 w-24">Age Limit:</span>
              <span className="text-white font-medium">{game.details["age-limit"]}</span>
            </div>
            <div className="flex items-center">
              <span className="text-purple-300 w-24">Tags:</span>
              <div className="flex flex-wrap gap-1">
                {game.tags.map((tag, index) => (
                  <span key={index} className="bg-purple-700/50 text-purple-100 px-2 py-1 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-4 mb-6 p-4 bg-purple-800/30 rounded-lg">
            <div className="bg-teal-500 text-white rounded-full w-16 h-16 flex items-center justify-center">
              <span className="text-2xl font-bold">{averageRating}</span>
            </div>
            <div>
              <div className="flex mb-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${i < Math.round(averageRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-500"}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
              <p className="text-purple-300 text-sm">
                <span className="font-medium text-white">{reviewCount}</span> reviews
              </p>
            </div>
          </div>

          {/* Price and Buttons */}
          <div className="border-t border-purple-500/30 pt-6">
            <div className="mb-4">
              <p className="text-3xl font-bold text-white">
                {game.price === 0 ? "Free" : `${game.price.toLocaleString("vi-VN")} VND`}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={handleBuyNow} className="w-full bg-green-600 hover:bg-green-700 text-white">
                <ShoppingCart className="h-5 w-5 mr-2" />
                {game.price === 0 ? "Play Now" : "Buy Now"}
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={isFavorite ? "default" : "outline"}
                  onClick={handleFavoriteToggle}
                  className={`flex items-center justify-center ${isFavorite
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : "border-purple-400 text-purple-200 hover:bg-purple-700 hover:text-white"}`}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""} mr-2`} />
                  {isFavorite ? "Wishlisted" : "Wishlist"}
                </Button>

                <Button
                  variant="outline"
                  className="border-purple-400 text-purple-200 hover:bg-purple-700 hover:text-white"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs for Details, System Requirements, Reviews */}
      <Tabs defaultValue="about" className="mb-12">
        <TabsList className="bg-purple-800/30 p-1">
          <TabsTrigger value="about" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white">
            About
          </TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white">
            System Requirements
          </TabsTrigger>
          <TabsTrigger value="reviews" className="data-[state=active]:bg-purple-700 data-[state=active]:text-white">
            Reviews
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="about"
          className="bg-purple-900/20 backdrop-blur-sm rounded-b-xl p-6 shadow-lg mt-2 border border-purple-500/30"
        >
          <h3 className="text-2xl font-bold mb-4 text-white">About This Game</h3>
          <p className="text-purple-100 mb-4">{game.details.describe}</p>
          <p className="text-purple-100">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl
            nisl adipiscing elit.
          </p>
        </TabsContent>

        <TabsContent
          value="system"
          className="bg-purple-900/20 backdrop-blur-sm rounded-b-xl shadow-lg mt-2 border border-purple-500/30"
        >
          <GameConfig minimum={game.minimum_configuration} recommended={game.recommended_configuration} />
        </TabsContent>

        <TabsContent
          value="reviews"
          className="bg-purple-900/20 backdrop-blur-sm rounded-b-xl p-6 shadow-lg mt-2 border border-purple-500/30"
        >
          <h3 className="text-2xl font-bold mb-4 text-white">User Reviews</h3>
          {reviews.length === 0 ? (
            <p className="text-purple-300">No reviews yet for this game.</p>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="mb-6 bg-purple-900/30 p-4 rounded-lg border border-purple-500/20">
                <div className="flex items-center mb-2 text-white">
                  <User className="w-4 h-4 mr-2" />
                  <span className="font-semibold">{review.user ? review.user.username : "Unknown User"}</span>
                  <Clock className="w-4 h-4 ml-4 mr-2" />
                  <span className="text-sm text-purple-300">
                    {review.date ? new Date(review.date.$date).toLocaleDateString("vi-VN") : "Unknown Date"}
                  </span>
                </div>
                <p className="text-purple-100 mb-2">{review.comment}</p>
                <div className="flex items-center text-sm text-purple-300">
                  {review.isPositive ? (
                    <ThumbsUp className="w-4 h-4 mr-1" />
                  ) : (
                    <ThumbsDown className="w-4 h-4 mr-1" />
                  )}
                  {review.isPositive ? "Recommended" : "Not Recommended"} – Rating: {review.rating}/5
                  {review.hoursPlayed && ` – ${review.hoursPlayed} hours played`}
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Related Games */}
      {relatedGames.length > 0 && (
        <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-purple-500/30">
          <RelatedGames games={relatedGames} currentGameId={game.id} />
        </div>
      )}
    </div>
  )
}

export default GameDetail