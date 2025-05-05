"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Heart, ShoppingCart, Share2, MessageSquare, Clock, User, Star } from "lucide-react"
import GameCarousel from "../components/GameCarousel"
import GameConfig from "../components/GameConfig"
import RelatedGames from "../components/RelatedGames"
import { Button } from "../components/ui/Button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { getGameById, getGames } from "../api/games"
import { getCommentsByGameId } from "../api/comments"

function GameDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [game, setGame] = useState(null)
  const [relatedGames, setRelatedGames] = useState([])
  const [isFavorite, setIsFavorite] = useState(false)
  const [error, setError] = useState(null)
  const [reviews, setReviews] = useState([])
  const [newComment, setNewComment] = useState("")
  const [newRating, setNewRating] = useState(3)
  const [loading, setLoading] = useState(false)

  // Generate a random rating between 7.5 and 9.8 for demo purposes
  const rating = (Math.random() * 2.3 + 7.5).toFixed(1)

  useEffect(() => {
    // Fetch game details
    setLoading(true)
    getGameById(id)
      .then((data) => {
        setGame(data)
        // Check if game is in favorites
        const favorites = JSON.parse(localStorage.getItem("favorites") || "[]")
        setIsFavorite(favorites.includes(data.id))

        // Fetch comments for this game
        getCommentsByGameId(data.id)
          .then((commentData) => {
            // Transform comment data to match the expected format
            const formattedComments = commentData.map((comment) => ({
              id: comment.id || Math.random().toString(36).substr(2, 9),
              username: comment.username || `Người dùng ${comment.user_id}`,
              date: new Date().toLocaleDateString("vi-VN"),
              text: comment.comment,
              rating: comment.rating,
              isPositive: comment.rating > 3,
              helpfulCount: Math.floor(Math.random() * 10),
              hoursPlayed: Math.floor(Math.random() * 100),
            }))
            setReviews(formattedComments)
            setLoading(false)
          })
          .catch((err) => {
            console.error("Error loading reviews:", err)
            setReviews([])
            setLoading(false)
          })

        // Fetch related games
        getGames()
          .then((allGames) => {
            const filtered = allGames
              .filter((g) => g.id !== data.id && g.thumbnail_image)
              .filter((g) => g.tags.some((tag) => data.tags.includes(tag)))
              .slice(0, 4)
            setRelatedGames(filtered)
          })
          .catch((err) => {
            console.error("Error fetching related games:", err)
            setError("Failed to load related games. Please try again later.")
          })
      })
      .catch((error) => {
        console.error("Error fetching game:", error)
        setError("Failed to load game details. Please try again later.")
        setLoading(false)
      })
  }, [id, navigate])

  const generateMockReviews = () => {
    const usernames = [
      "GamerPro123",
      "EpicPlayer",
      "GameMaster",
      "ProGamer",
      "GameEnthusiast",
      "RPGLover",
      "CasualGamer",
    ]
    const reviewTexts = [
      "Tuyệt vời! Đồ họa đẹp, gameplay cuốn hút. Tôi đã chơi suốt đêm không ngừng nghỉ.",
      "Game hay nhưng vẫn còn một số lỗi nhỏ. Hy vọng sẽ được sửa trong các bản cập nhật tiếp theo.",
      "Một trong những game hay nhất mà tôi từng chơi. Cốt truyện sâu sắc và nhân vật được phát triển tốt.",
      "Đồ họa tuyệt đẹp nhưng gameplay hơi đơn điệu sau vài giờ chơi.",
      "Tôi đã chơi hơn 100 giờ và vẫn chưa chán. Rất đáng đồng tiền bát gạo!",
      "Cốt truyện hay nhưng điều khiển hơi khó làm quen. Cần thời gian để thích nghi.",
      "Game tuyệt vời để chơi cùng bạn bè. Chế độ multiplayer rất vui và hấp dẫn.",
    ]

    const mockReviews = []
    for (let i = 0; i < 5; i++) {
      const isPositive = Math.random() > 0.3
      mockReviews.push({
        id: i,
        username: usernames[Math.floor(Math.random() * usernames.length)],
        date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toLocaleDateString("vi-VN"),
        text: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
        isPositive: isPositive,
        helpfulCount: Math.floor(Math.random() * 50),
        hoursPlayed: Math.floor(Math.random() * 200),
      })
    }

    setReviews(mockReviews)
  }

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

  const handleAddComment = (e) => {
    e.preventDefault()

    if (!newComment.trim()) {
      alert("Vui lòng nhập nội dung đánh giá")
      return
    }

    // Create new comment object
    const newCommentObj = {
      id: Math.random().toString(36).substr(2, 9),
      username: "Bạn", // In a real app, this would be the logged-in user
      date: new Date().toLocaleDateString("vi-VN"),
      text: newComment,
      rating: newRating,
      isPositive: newRating > 3,
      helpfulCount: 0,
      hoursPlayed: Math.floor(Math.random() * 50),
    }

    // Add to reviews state
    setReviews((prevReviews) => [newCommentObj, ...prevReviews])

    // Reset form
    setNewComment("")
    setNewRating(3)

    // In a real app, you would save this to the backend
    // For example: saveComment(game.id, newCommentObj)

    // Show success message
    alert("Cảm ơn bạn đã gửi đánh giá!")
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
              <span className="text-2xl font-bold">{rating}</span>
            </div>
            <div>
              <div className="flex mb-1">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${i < 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-500"}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
              <p className="text-purple-300 text-sm">
                <span className="font-medium text-white">{Math.floor(Math.random() * 10000)}</span> reviews
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
                  className={`flex items-center justify-center ${
                    isFavorite
                      ? "bg-purple-600 hover:bg-purple-700 text-white"
                      : "border-purple-400 text-purple-200 hover:bg-purple-700 hover:text-white"
                  }`}
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
            nisl aliquam nisl, eget ultricies nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, nisl
            nisl aliquam nisl, eget ultricies nisl nisl eget nisl.
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
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-white">Đánh giá từ người chơi</h3>
            <div className="text-sm text-purple-300">
              <span className="font-medium text-white">{reviews.length}</span> đánh giá
            </div>
          </div>

          {/* Comment Form */}
          <div className="mb-8 bg-purple-900/40 p-4 rounded-lg border border-purple-500/30">
            <h4 className="text-lg font-semibold text-white mb-3">Thêm đánh giá của bạn</h4>
            <form onSubmit={handleAddComment} className="space-y-4">
              <div>
                <textarea
                  className="w-full bg-purple-800/50 text-white rounded-lg p-3 border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows="3"
                  placeholder="Chia sẻ trải nghiệm của bạn về game này..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <label className="text-purple-300 mr-3">Đánh giá:</label>
                  <select
                    className="bg-purple-800/50 text-white rounded p-2 border border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    value={newRating}
                    onChange={(e) => setNewRating(Number(e.target.value))}
                  >
                    <option value="1">1 - Không thích</option>
                    <option value="2">2 - Tạm được</option>
                    <option value="3">3 - Khá tốt</option>
                    <option value="4">4 - Rất tốt</option>
                    <option value="5">5 - Tuyệt vời</option>
                  </select>
                </div>
                <Button type="submit" className="ml-auto bg-purple-600 hover:bg-purple-700 text-white">
                  Gửi đánh giá
                </Button>
              </div>
            </form>
          </div>

          {/* Comments List */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8 text-purple-300">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Chưa có đánh giá nào cho game này.</p>
              <p className="text-sm mt-2">Hãy là người đầu tiên chia sẻ ý kiến của bạn!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-purple-900/30 p-4 rounded-lg border border-purple-500/20">
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center text-white">
                      <User className="w-4 h-4 mr-2" />
                      <span className="font-semibold">{review.username || "Người dùng ẩn danh"}</span>
                    </div>
                    <div className="flex items-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-500"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-purple-100 mb-3">{review.text}</p>
                  <div className="flex items-center text-sm text-purple-300">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{review.date || new Date().toLocaleDateString("vi-VN")}</span>
                  </div>
                </div>
              ))}
            </div>
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
