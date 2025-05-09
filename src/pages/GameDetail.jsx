"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Heart, ShoppingCart, ThumbsUp, ThumbsDown, Clock, User, Star, Tag, Award, Zap, Sparkles, Send } from "lucide-react"
import { motion } from "framer-motion"
import GameConfig from "../components/GameConfig"
import { Button } from "../components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { getGameById, getGames } from "../api/games"
import { getCommentsByGameIdWithUsers, addComment } from "../api/comments"
import { getWishlist, updateWishlist, createWishlist } from "../api/wishlist"
import { getCart, addToCart, removeFromCart } from "../api/cart"
import { getPurchaseByUserId } from "../api/purchases"
import { Badge } from "../components/ui/badge"
import { Toaster, toast } from "../components/ui/sonner"

function GameDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [game, setGame] = useState(null)
  const [relatedGames, setRelatedGames] = useState([])
  const [isFavorite, setIsFavorite] = useState(false)
  const [isInCart, setIsInCart] = useState(false)
  const [isPurchased, setIsPurchased] = useState(false)
  const [loading, setLoading] = useState(true)
  const [wishlistLoading, setWishlistLoading] = useState(false)
  const [cartLoading, setCartLoading] = useState(false)
  const [error, setError] = useState(null)
  const [reviews, setReviews] = useState([])
  const [user, setUser] = useState(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [newComment, setNewComment] = useState("")
  const [newRating, setNewRating] = useState(0)

  // Tính rating trung bình và số lượt review
  const averageRating =
    reviews.length > 0 ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : 0
  const reviewCount = reviews.length

  // Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    const checkLoggedIn = () => {
      try {
        const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user")
        const accessToken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")
        if (storedUser && accessToken) {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
        } else {
          setUser(null)
        }
      } catch (err) {
        console.error("Error checking user login:", err)
        setUser(null)
      }
    }

    checkLoggedIn()
  }, [])

  // Fetch game details, wishlist, cart, purchases, và comments
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch game details
        const gameData = await getGameById(id)
        setGame(gameData)

        // Fetch comments with user info
        const reviewData = await getCommentsByGameIdWithUsers(gameData.id)
        setReviews(reviewData)

        // Fetch related games
        const allGames = await getGames()
        const filtered = allGames
          .filter((g) => g.id !== gameData.id && g.thumbnail_image)
          .filter((g) => g.tags.some((tag) => gameData.tags.includes(tag)))
          .slice(0, 4)
        setRelatedGames(filtered)

        // Fetch wishlist, cart, và purchases nếu người dùng đã đăng nhập
        if (user && user.id) {
          // Wishlist
          const wishlistData = await getWishlist()
          const userWishlist = wishlistData.find((item) => {
            const userId = user.id ? String(user.id) : null
            const itemUserId = item.user_id ? String(item.user_id) : item.userId ? String(item.userId) : null
            return userId && itemUserId && (itemUserId === userId || Number(itemUserId) === Number(userId))
          })

          if (userWishlist) {
            const favGameIds = userWishlist.fav_game_id || userWishlist.favGameId || []
            setIsFavorite(
              favGameIds.some(
                (favId) => Number(favId) === Number(gameData.id) || favId.toString() === gameData.id.toString(),
              ),
            )
          }

          // Cart
          const cartItems = await getCart(Number(user.id))
          setIsInCart(
            cartItems.some(
              (item) => Number(item.id) === Number(gameData.id) || item.id.toString() === gameData.id.toString(),
            ),
          )

          // Purchases
          const purchaseData = await getPurchaseByUserId(Number(user.id))
          if (purchaseData && purchaseData.games_purchased) {
            setIsPurchased(
              purchaseData.games_purchased.some(
                (purchase) => Number(purchase.game_id) === Number(gameData.id) || purchase.game_id.toString() === gameData.id.toString(),
              ),
            )
          }
        }

        setLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Không thể tải chi tiết game. Vui lòng thử lại sau.")
        setLoading(false)
      }
    }

    fetchData()
  }, [id, user, navigate])

  const handleFavoriteToggle = async () => {
    if (!user || !user.id) {
      toast.error("Vui lòng đăng nhập để thêm game vào danh sách yêu thích!", {
        style: { background: "rgba(39, 39, 42, 0.9)", color: "#fff", border: "1px solid rgba(107, 33, 168, 0.5)" },
      })
      navigate("/login")
      return
    }

    try {
      setWishlistLoading(true)
      const wishlistData = await getWishlist()
      let userWishlist = wishlistData.find((item) => {
        const userId = user.id ? String(user.id) : null
        const itemUserId = item.user_id ? String(item.user_id) : item.userId ? String(item.userId) : null
        return userId && itemUserId && (itemUserId === userId || Number(itemUserId) === Number(userId))
      })

      if (!userWishlist) {
        userWishlist = {
          user_id: Number(user.id),
          fav_game_id: [Number(game.id)],
        }
        await createWishlist(userWishlist)
        setIsFavorite(true)
        toast.success(`${game.name} đã được thêm vào danh sách yêu thích!`, {
          description: (
            <div className="bg-purple-900/40 border border-purple-700/50 p-4 rounded-lg">
              <p className="text-purple-200">Game đã được thêm vào danh sách yêu thích của bạn.</p>
              <Button
                className="mt-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
                onClick={() => navigate("/favorites")}
              >
                Xem danh sách yêu thích
              </Button>
            </div>
          ),
          duration: 5000,
          style: { background: "rgba(39, 39, 42, 0.9)", color: "#fff", border: "1px solid rgba(107, 33, 168, 0.5)" },
        })
        window.dispatchEvent(new Event("wishlistUpdated"))
        setWishlistLoading(false)
        return
      }

      const favGameIds = userWishlist.fav_game_id || userWishlist.favGameId || []
      let updatedFavGameIds

      if (isFavorite) {
        updatedFavGameIds = favGameIds.filter(
          (favId) => Number(favId) !== Number(game.id) && favId.toString() !== game.id.toString(),
        )
        setIsFavorite(false)
        toast.success(`${game.name} đã được xóa khỏi danh sách yêu thích!`, {
          description: (
            <div className="bg-purple-900/40 border border-purple-700/50 p-4 rounded-lg">
              <p className="text-purple-200">Game đã được xóa khỏi danh sách yêu thích của bạn.</p>
              <Button
                className="mt-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
                onClick={() => navigate("/favorites")}
              >
                Xem danh sách yêu thích
              </Button>
            </div>
          ),
          duration: 5000,
          style: { background: "rgba(39, 39, 42, 0.9)", color: "#fff", border: "1px solid rgba(107, 33, 168, 0.5)" },
        })
      } else {
        updatedFavGameIds = [...favGameIds, Number(game.id)]
        setIsFavorite(true)
        toast.success(`${game.name} đã được thêm vào danh sách yêu thích!`, {
          description: (
            <div className="bg-purple-900/40 border border-purple-700/50 p-4 rounded-lg">
              <p className="text-purple-200">Game đã được thêm vào danh sách yêu thích của bạn.</p>
              <Button
                className="mt-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
                onClick={() => navigate("/favorites")}
              >
                Xem danh sách yêu thích
              </Button>
            </div>
          ),
          duration: 5000,
          style: { background: "rgba(39, 39, 42, 0.9)", color: "#fff", border: "1px solid rgba(107, 33, 168, 0.5)" },
        })
      }

      await updateWishlist(userWishlist.id, { ...userWishlist, fav_game_id: updatedFavGameIds })
      window.dispatchEvent(new Event("wishlistUpdated"))
      setWishlistLoading(false)
    } catch (err) {
      console.error("Error updating wishlist:", err)
      toast.error("Không thể cập nhật danh sách yêu thích. Vui lòng thử lại sau.", {
        style: { background: "rgba(39, 39, 42, 0.9)", color: "#fff", border: "1px solid rgba(107, 33, 168, 0.5)" },
      })
      setWishlistLoading(false)
    }
  }

  const handleBuyNow = () => {
    if (isPurchased) {
      toast.success(`Bắt đầu chơi ${game?.name}!`, {
        style: { background: "rgba(39, 39, 42, 0.9)", color: "#fff", border: "1px solid rgba(107, 33, 168, 0.5)" },
      })
    } else {
      navigate("/checkout", { state: { selectedItems: [game.id], totalPrice: game.price } })
    }
  }

  const handleToggleCart = async () => {
    if (!user || !user.id) {
      toast.error("Vui lòng đăng nhập để thêm game vào giỏ hàng!", {
        style: { background: "rgba(39, 39, 42, 0.9)", color: "#fff", border: "1px solid rgba(107, 33, 168, 0.5)" },
      })
      navigate("/login")
      return
    }

    try {
      setCartLoading(true)
      if (isInCart) {
        await removeFromCart(Number(user.id), Number(game.id))
        setIsInCart(false)
        toast.success(`${game.name} đã được xóa khỏi giỏ hàng!`, {
          description: (
            <div className="bg-purple-900/40 border border-purple-700/50 p-4 rounded-lg">
              <p className="text-purple-200">Game đã được xóa khỏi giỏ hàng của bạn.</p>
              <Button
                className="mt-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
                onClick={() => navigate("/cart")}
              >
                Xem giỏ hàng
              </Button>
            </div>
          ),
          duration: 5000,
          style: { background: "rgba(39, 39, 42, 0.9)", color: "#fff", border: "1px solid rgba(107, 33, 168, 0.5)" },
        })
      } else {
        await addToCart(Number(user.id), Number(game.id))
        setIsInCart(true)
        toast.success(`${game.name} đã được thêm vào giỏ hàng!`, {
          description: (
            <div className="bg-purple-900/40 border border-purple-700/50 p-4 rounded-lg">
              <p className="text-purple-200">Game đã được thêm vào giỏ hàng của bạn.</p>
              <Button
                className="mt-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
                onClick={() => navigate("/cart")}
              >
                Xem giỏ hàng
              </Button>
            </div>
          ),
          duration: 5000,
          style: { background: "rgba(39, 39, 42, 0.9)", color: "#fff", border: "1px solid rgba(107, 33, 168, 0.5)" },
        })
      }
      setCartLoading(false)
    } catch (err) {
      console.error("Error toggling cart:", err)
      toast.error("Không thể cập nhật giỏ hàng. Vui lòng thử lại sau.", {
        style: { background: "rgba(39, 39, 42, 0.9)", color: "#fff", border: "1px solid rgba(107, 33, 168, 0.5)" },
      })
      setCartLoading(false)
    }
  }

  const handleAddComment = async () => {
    if (!user || !user.id) {
      toast.error("Vui lòng đăng nhập để gửi đánh giá!", {
        style: { background: "rgba(39, 39, 42, 0.9)", color: "#fff", border: "1px solid rgba(107, 33, 168, 0.5)" },
      })
      navigate("/login")
      return
    }

    if (!newComment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá!", {
        style: { background: "rgba(39, 39, 42, 0.9)", color: "#fff", border: "1px solid rgba(107, 33, 168, 0.5)" },
      })
      return
    }

    if (newRating < 1 || newRating > 5) {
      toast.error("Vui lòng chọn đánh giá từ 1 đến 5 sao!", {
        style: { background: "rgba(39, 39, 42, 0.9)", color: "#fff", border: "1px solid rgba(107, 33, 168, 0.5)" },
      })
      return
    }

    try {
      const commentData = {
        game_id: Number(game.id),
        user_id: Number(user.id),
        comment: newComment,
        rating: Number(newRating),
      }

      await addComment(commentData)
      const updatedReviews = await getCommentsByGameIdWithUsers(game.id)
      setReviews(updatedReviews)
      setNewComment("")
      setNewRating(0)
      toast.success("Đánh giá của bạn đã được gửi!", {
        style: { background: "rgba(39, 39, 42, 0.9)", color: "#fff", border: "1px solid rgba(107, 33, 168, 0.5)" },
      })
    } catch (err) {
      console.error("Error adding comment:", err)
      toast.error("Không thể gửi đánh giá. Vui lòng thử lại sau.", {
        style: { background: "rgba(39, 39, 42, 0.9)", color: "#fff", border: "1px solid rgba(107, 33, 168, 0.5)" },
      })
    }
  }

  const getTagIcon = (tag) => {
    switch (tag.toLowerCase()) {
      case "action":
        return <Zap className="w-3 h-3 mr-1" />
      case "adventure":
        return <Award className="w-3 h-3 mr-1" />
      case "role-playing":
        return <Star className="w-3 h-3 mr-1" />
      case "fantasy":
        return <Sparkles className="w-3 h-3 mr-1" />
      default:
        return <Tag className="w-3 h-3 mr-1" />
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price)
  }

  // Kiểm tra xem người dùng đã đánh giá game chưa
  const hasReviewed = user && reviews.some(
    (review) => Number(review.user_id) === Number(user.id) || review.user_id.toString() === user.id.toString()
  )

  if (loading) {
    return (
      <div className="bg-zinc-900/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-purple-800/50 flex justify-center items-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
          className="inline-block"
        >
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"></div>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <motion.div
        className="bg-zinc-900/90 backdrop-blur-sm rounded-xl p-8 shadow-xl border border-purple-800/50 flex flex-col items-center justify-center min-h-[400px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-purple-800/50 flex items-center justify-center mb-6">
            <Zap className="h-10 w-10 text-purple-500/70" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Lỗi tải dữ liệu</h2>
          <p className="text-red-400 max-w-md mb-6">{error}</p>
          <Button
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg shadow transition-all duration-300"
            onClick={() => navigate("/")}
          >
            Quay lại trang chủ
          </Button>
        </div>
      </motion.div>
    )
  }

  const releaseDate = new Date(game.details.published_date.$date).toLocaleDateString("vi-VN")

  return (
    <div className="bg-zinc-900/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-purple-800/50 min-h-screen">
      <div className="container mx-auto px-4 py-10">
        <Toaster richColors position="top-right" expand={true} />
        {/* Game Title */}
        <motion.div
          className="flex items-center gap-2 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Zap className="h-6 w-6 text-purple-500" />
          <h1 className="text-3xl md:text-4xl font-bold text-white">{game.name}</h1>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Carousel */}
          <div className="lg:col-span-2">
            {game.images && game.images.length > 0 && (
              <motion.div
                className="relative rounded-xl overflow-hidden shadow-[0_5px_30px_rgba(109,40,217,0.5)]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative h-[400px] md:h-[500px]">
                  {game.images.map((image, index) => (
                    <motion.div
                      key={index}
                      className="absolute inset-0"
                      initial={{ opacity: 0, scale: 1.1 }}
                      animate={{
                        opacity: activeImageIndex === index ? 1 : 0,
                        scale: activeImageIndex === index ? 1 : 1.1,
                      }}
                      transition={{ duration: 0.8 }}
                    >
                      <img
                        src={image || "https://placehold.co/800x500/3a1a5e/ffffff?text=Game+Image"}
                        alt={`${game.name} screenshot ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  ))}
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 to-transparent"></div>
                </div>

                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-purple-800/60 hover:bg-purple-700 p-3 rounded-full text-white z-10 backdrop-blur-sm border border-purple-700/50 transition-colors"
                  onClick={() => setActiveImageIndex((prev) => (prev === 0 ? game.images.length - 1 : prev - 1))}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-purple-800/60 hover:bg-purple-700 p-3 rounded-full text-white z-10 backdrop-blur-sm border border-purple-700/50 transition-colors"
                  onClick={() => setActiveImageIndex((prev) => (prev === game.images.length - 1 ? 0 : prev + 1))}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                  {game.images.map((_, idx) => (
                    <button
                      key={idx}
                      className={`w-2 h-2 rounded-full ${activeImageIndex === idx ? "bg-white" : "bg-white/50"}`}
                      onClick={() => setActiveImageIndex(idx)}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Thumbnail Gallery */}
            <motion.div
              className="grid grid-cols-5 gap-2 mt-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {game.images &&
                game.images.slice(0, 5).map((image, index) => (
                  <button
                    key={index}
                    className={`rounded-md overflow-hidden border-2 transition-all ${
                      activeImageIndex === index
                        ? "border-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                        : "border-transparent hover:border-purple-600/70"
                    }`}
                    onClick={() => setActiveImageIndex(index)}
                  >
                    <img
                      src={image || "https://placehold.co/160x90/3a1a5e/ffffff?text=Game+Image"}
                      alt={`${game.name} thumbnail ${index + 1}`}
                      className="w-full h-16 object-cover"
                    />
                  </button>
                ))}
            </motion.div>
          </div>

          {/* Right Column - Game Info */}
          <motion.div
            className="bg-purple-900/40 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-700/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Game Metadata */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div className="flex items-center">
                <span className="text-purple-300 w-24">Nhà phát hành:</span>
                <span className="text-white font-medium">{game.details.publisher}</span>
              </div>
              <div className="flex items-center">
                <span className="text-purple-300 w-24">Ngày phát hành:</span>
                <span className="text-white font-medium">{releaseDate}</span>
              </div>
              <div className="flex items-center">
                <span className="text-purple-300 w-24">Giới hạn tuổi:</span>
                <Badge className="bg-purple-800/50 text-white border border-purple-700/50 backdrop-blur-sm">
                  {game.details["age-limit"]}
                </Badge>
              </div>
              <div className="flex items-center">
                <span className="text-purple-300 w-24">Thể loại:</span>
                <div className="flex flex-wrap gap-1">
                  {game.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-purple-800/50 text-purple-200 px-2 py-1 rounded-full text-xs flex items-center"
                    >
                      {getTagIcon(tag)}
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-6 p-4 bg-purple-900/30 rounded-lg border border-purple-700/30">
              <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                <span className="text-2xl font-bold">{averageRating}</span>
              </div>
              <div>
                <div className="flex mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < Math.round(averageRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-500"}`}
                    />
                  ))}
                </div>
                <p className="text-purple-300 text-sm">
                  <span className="font-medium text-white">{reviewCount}</span> đánh giá
                </p>
              </div>
            </div>

            {/* Price and Buttons */}
            <div className="border-t border-purple-700/30 pt-6">
              <div className="mb-4">
                <p className="text-3xl font-bold text-white">
                  {game.price === 0 ? "Miễn phí" : `${formatPrice(game.price)} VND`}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleBuyNow}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg hover:shadow-purple-500/30"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {isPurchased ? "Chơi ngay" : game.price === 0 ? "Chơi ngay" : "Mua ngay"}
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={isFavorite ? "default" : "outline"}
                    onClick={handleFavoriteToggle}
                    disabled={wishlistLoading}
                    aria-label={
                      isFavorite
                        ? `Xóa ${game.name} khỏi danh sách yêu thích`
                        : `Thêm ${game.name} vào danh sách yêu thích`
                    }
                    className={`flex items-center justify-center ${
                      isFavorite
                        ? "bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
                        : "bg-purple-800/80 border-purple-700/50 text-purple-200 hover:bg-purple-700 hover:text-white"
                    }`}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? "fill-pink-500 text-pink-500" : ""} mr-2`} />
                    {wishlistLoading ? "Đang xử lý..." : isFavorite ? "Đã yêu thích" : "Yêu thích"}
                  </Button>

                  <Button
                    variant={isInCart ? "default" : "outline"}
                    onClick={handleToggleCart}
                    disabled={cartLoading || isPurchased}
                    aria-label={isInCart ? `Xóa ${game.name} khỏi giỏ hàng` : `Thêm ${game.name} vào giỏ hàng`}
                    className={`flex items-center justify-center ${
                      isInCart
                        ? "bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
                        : isPurchased
                        ? "bg-purple-800/50 border-gray-700/50 text-gray-500 cursor-not-allowed"
                        : "bg-purple-800/80 border-purple-700/50 text-purple-200 hover:bg-purple-700 hover:text-white"
                    }`}
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {cartLoading ? "Đang xử lý..." : isInCart ? "Xóa khỏi giỏ hàng" : "Thêm vào giỏ hàng"}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs for Details, System Requirements, Reviews */}
        <Tabs defaultValue="about" className="mb-12">
          <TabsList className="bg-purple-900/30 p-1 rounded-t-xl border border-purple-800/50 border-b-0">
            <TabsTrigger
              value="about"
              className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg"
            >
              Giới thiệu
            </TabsTrigger>
            <TabsTrigger
              value="system"
              className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg"
            >
              Yêu cầu hệ thống
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-purple-600 data-[state=active]:text-white rounded-lg"
            >
              Đánh giá
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="about"
            className="bg-purple-900/40 backdrop-blur-sm rounded-b-xl p-6 shadow-lg mt-0 border border-purple-800/50"
          >
            <h3 className="text-2xl font-bold mb-4 text-white">Giới thiệu về game</h3>
            <p className="text-purple-200">{game.details.describe}</p>
          </TabsContent>

          <TabsContent
            value="system"
            className="bg-purple-900/40 backdrop-blur-sm rounded-b-xl shadow-lg mt-0 border border-purple-800/50"
          >
            <GameConfig minimum={game.minimum_configuration} recommended={game.recommended_configuration} />
          </TabsContent>

          <TabsContent
            value="reviews"
            className="bg-purple-900/40 backdrop-blur-sm rounded-b-xl p-6 shadow-lg mt-0 border border-purple-800/50"
          >
            <h3 className="text-2xl font-bold mb-4 text-white">Đánh giá từ người chơi</h3>
            
            {/* Form thêm bình luận hoặc thông báo đã đánh giá */}
            {user && (
              hasReviewed ? (
                <motion.div
                  className="mb-6 bg-purple-900/40 p-4 rounded-lg border border-purple-700/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-purple-300">Bạn đã đánh giá game này.</p>
                </motion.div>
              ) : (
                <motion.div
                  className="mb-6 bg-purple-900/40 p-4 rounded-lg border border-purple-700/50"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h4 className="text-lg font-semibold text-white mb-4">Viết đánh giá của bạn</h4>
                  <div className="flex items-center mb-4">
                    <span className="text-purple-300 mr-2">Đánh giá:</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-6 h-6 cursor-pointer ${
                            i < newRating ? "text-yellow-400 fill-yellow-400" : "text-gray-500"
                          }`}
                          onClick={() => setNewRating(i + 1)}
                        />
                      ))}
                    </div>
                  </div>
                  <textarea
                    className="w-full p-3 bg-purple-800/50 text-purple-200 rounded-lg border border-purple-700/50 focus:outline-none focus:border-purple-600"
                    rows="4"
                    placeholder="Viết đánh giá của bạn..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  ></textarea>
                  <Button
                    onClick={handleAddComment}
                    className="mt-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
                  >
                    <Send className="h-5 w-5 mr-2" />
                    Gửi đánh giá
                  </Button>
                </motion.div>
              )
            )}

            {/* Danh sách đánh giá */}
            {reviews.length === 0 ? (
              <p className="text-purple-300">Chưa có đánh giá nào cho game này.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <motion.div
                    key={review.id}
                    className="bg-purple-900/40 p-4 rounded-lg border border-purple-700/50 hover:border-purple-600/70 hover:shadow-lg transition-all"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center mb-2 text-white">
                      <div className="bg-purple-800 rounded-full p-1.5 mr-2">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="font-semibold">{review.user?.username || "Người dùng ẩn danh"}</span>
                      <div className="flex items-center ml-auto text-purple-300 text-sm">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>
                          {review.date?.$date
                            ? new Date(review.date.$date).toLocaleDateString("vi-VN")
                            : "Ngày không xác định"}
                        </span>
                      </div>
                    </div>
                    <p className="text-purple-200 mb-3 pl-8">{review.comment}</p>
                    <div className="flex items-center text-sm text-purple-300 pl-8">
                      <div
                        className={`flex items-center mr-4 ${review.isPositive ? "text-green-400" : "text-red-400"}`}
                      >
                        {review.isPositive ? (
                          <ThumbsUp className="w-4 h-4 mr-1" />
                        ) : (
                          <ThumbsDown className="w-4 h-4 mr-1" />
                        )}
                        {review.isPositive ? "Đề xuất" : "Không đề xuất"}
                      </div>
                      <div className="flex items-center mr-4">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-500"}`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.hoursPlayed && (
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {review.hoursPlayed} giờ chơi
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Related Games */}
        {relatedGames.length > 0 && (
          <motion.div
            className="bg-purple-900/40 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-purple-700/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-2xl font-bold mb-6 text-white">Game liên quan</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedGames.map((relatedGame) => (
                <motion.div
                  key={relatedGame.id}
                  className="group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (0.1 * Number.parseInt(relatedGame.id)) % 5 }}
                  whileHover={{ y: -5 }}
                >
                  <div
                    className="bg-purple-900/40 rounded-xl overflow-hidden border border-purple-700/50 hover:border-purple-600/70 hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(`/game/${relatedGame.id}`)}
                  >
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={relatedGame.thumbnail_image || "https://placehold.co/400x200/3a1a5e/ffffff?text=Game+Image"}
                        alt={relatedGame.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-white text-lg line-clamp-1 group-hover:text-purple-200">{relatedGame.name}</h4>
                      <p className="text-purple-300 text-sm">{relatedGame.details.publisher}</p>
                      <p className="font-bold text-white mt-2">
                        {relatedGame.price === 0 ? "Miễn phí" : `${formatPrice(relatedGame.price)} VND`}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default GameDetail