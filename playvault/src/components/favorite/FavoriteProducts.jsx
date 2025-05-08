import { useState, useEffect } from "react"
import { Search, Filter, Grid, List, Heart, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

export default function FavoriteProducts() {
    const [selectedGame, setSelectedGame] = useState(null)
    const [viewMode, setViewMode] = useState("list")
    const [searchQuery, setSearchQuery] = useState("")
    const [sortBy, setSortBy] = useState("name")
    const [filterTag, setFilterTag] = useState("all")
    const [statusFilter, setStatusFilter] = useState("all")
    const [games, setGames] = useState([])
    const [wishlist, setWishlist] = useState(null)
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    // Kiểm tra người dùng đã đăng nhập chưa
    useEffect(() => {
        // Lấy thông tin người dùng từ localStorage và sessionStorage (nếu đã đăng nhập)
        const checkLoggedIn = () => {
            try {
                // Kiểm tra cả localStorage và sessionStorage
                const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user')
                const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')

                console.log("Stored user:", storedUser)
                console.log("Access token:", accessToken)

                if (storedUser && accessToken) {
                    const parsedUser = JSON.parse(storedUser)
                    setUser(parsedUser)
                } else {
                    setUser(null)
                }
            } catch (err) {
                console.error("Error checking user login:", err)
                setUser(null)
            } finally {
                setLoading(false)
            }
        }

        checkLoggedIn()

        // Thêm event listener để bắt sự kiện login/logout
        window.addEventListener('storage', checkLoggedIn)
        return () => window.removeEventListener('storage', checkLoggedIn)
    }, [])

    // Fetch data from json-server (chỉ thực hiện khi đã đăng nhập)
    useEffect(() => {
        // Nếu không có người dùng đăng nhập, không fetch dữ liệu
        if (!user) return

        const fetchData = async () => {
            try {
                setLoading(true)

                // Fetch all data in parallel for better performance
                const [gamesResponse, wishlistResponse] = await Promise.all([
                    fetch("http://localhost:3001/games").then(res => res.json()),
                    fetch("http://localhost:3001/wishlist").then(res => res.json())
                ])

                // Find user's wishlist
                // Thử lấy wishlist theo nhiều cách (id có thể là number hoặc string)
                let userWishlist = wishlistResponse.find(item =>
                    item.user_id.toString() === (user.id || "").toString() ||
                    item.user_id === Number(user.id) ||
                    item.userId === user.id
                )

                console.log("User:", user)
                console.log("Available wishlists:", wishlistResponse)
                console.log("Found wishlist:", userWishlist)

                if (!userWishlist) {
                    // No wishlist found for user
                    setGames([])
                    setWishlist(null)
                    setLoading(false)
                    return
                }

                setWishlist(userWishlist)

                // Get favorite games by matching IDs with the fav_game_id array
                // Kiểm tra cả fav_game_id và favGameId (tùy vào cấu trúc dữ liệu API trả về)
                const fav_game_ids = userWishlist.fav_game_id || userWishlist.favGameId || [];
                console.log("Favorite game IDs:", fav_game_ids);

                const favoriteGames = gamesResponse.filter(game => {
                    const gameId = Number(game.id);
                    return Array.isArray(fav_game_ids) && fav_game_ids.some(id => {
                        // So sánh cả string và number, vì API có thể trả về kiểu dữ liệu khác nhau
                        const numId = Number(id);
                        return numId === gameId || id === game.id || id.toString() === game.id.toString();
                    });
                })

                console.log("Filtered favorite games:", favoriteGames);

                // Add status property to games (all are "not_purchased" by default)
                const gamesWithStatus = favoriteGames.map(game => ({
                    ...game,
                    status: "not_purchased", // Default status
                    downloadProgress: 0, // Default download progress
                    // Format price for display
                    price: `${game.price?.toLocaleString() || 0}đ`,
                    // Extract tags
                    tags: game.tags || [],
                    // Use thumbnail_image
                    thumbnailImage: game.thumbnail_image,
                    // Extract age rating
                    ageRating: game.details?.["age-limit"] || "N/A",
                    // Extract release date
                    releaseDate: game.details?.published_date?.$date
                        ? new Date(game.details.published_date.$date).toLocaleDateString("vi-VN")
                        : "N/A",
                    // Extract publisher
                    publisher: game.details?.publisher || "N/A",
                    // Extract description
                    description: game.details?.describe || "",
                    // Extract min requirements
                    minRequirements: {
                        os: game.minimum_configuration?.os || "N/A",
                        cpu: game.minimum_configuration?.cpu || "N/A",
                        ram: game.minimum_configuration?.ram || "N/A",
                        gpu: game.minimum_configuration?.gpu || "N/A",
                        storage: game.minimum_configuration?.disk || "N/A",
                    },
                    // Extract recommended requirements
                    recRequirements: {
                        os: game.recommended_configuration?.os || "N/A",
                        cpu: game.recommended_configuration?.cpu || "N/A",
                        ram: game.recommended_configuration?.ram || "N/A",
                        gpu: game.recommended_configuration?.gpu || "N/A",
                        storage: game.recommended_configuration?.disk || "N/A",
                    },
                    // Include potential friends playing (empty for now)
                    friends: [],
                    // Default achievements
                    achievements: {
                        completed: 0,
                        total: 0,
                    },
                }))

                setGames(gamesWithStatus)
                setLoading(false)
            } catch (err) {
                console.error("Error fetching data:", err)
                setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.")
                setLoading(false)
            }
        }

        fetchData()
    }, [user])

    // Filter and sort games
    const filteredGames = games
        .filter(
            (game) =>
                game.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
                (filterTag === "all" || game.tags.includes(filterTag)) &&
                (statusFilter === "all" || game.status === statusFilter),
        )
        .sort((a, b) => {
            if (sortBy === "name") return a.name.localeCompare(b.name)
            if (sortBy === "price") {
                const priceA = Number.parseFloat(a.price.replace(/\D/g, ""))
                const priceB = Number.parseFloat(b.price.replace(/\D/g, ""))
                return priceA - priceB
            }
            return 0
        })

    // Get all available tags from games
    const allTags = [...new Set(games.flatMap(game => game.tags))]

    // Handle game selection
    const handleGameSelect = (gameId) => {
        setSelectedGame(gameId === selectedGame ? null : gameId)
    }

    // Format tags for display
    const formatTag = (tag) => {
        const tagMap = {
            "role-playing": "Nhập vai",
            "action": "Hành động",
            // Add more mappings as needed
        }
        return tagMap[tag] || tag
    }

    // Handle login click
    const handleLoginClick = () => {
        navigate('/login')
    }

    if (loading) {
        return (
            <div className="bg-zinc-900/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-purple-800/50 flex justify-center items-center h-64">
                <div className="text-purple-300">Đang tải dữ liệu...</div>
            </div>
        )
    }

    // Hiển thị trang đăng nhập nếu chưa đăng nhập
    if (!user) {
        return (
            <motion.div
                className="bg-zinc-900/90 backdrop-blur-sm rounded-xl p-8 shadow-xl border border-purple-800/50 flex flex-col items-center justify-center min-h-[400px]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-purple-800/50 flex items-center justify-center mb-6">
                        <Heart className="h-10 w-10 text-pink-500/70" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Danh sách game yêu thích của bạn</h2>
                    <p className="text-purple-300 max-w-md mb-6">
                        Đăng nhập để xem và quản lý danh sách các game yêu thích của bạn. Bạn có thể lưu các game ưa thích và theo dõi chúng.
                    </p>
                    <Button
                        className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg shadow transition-all duration-300 flex items-center gap-2 hover:shadow-md hover:shadow-purple-500/20"
                        onClick={handleLoginClick}
                    >
                        <LogIn className="h-4 w-4" />
                        Đăng nhập ngay
                    </Button>
                </div>
            </motion.div>
        )
    }

    // Hiển thị thông báo nếu có lỗi
    if (error) {
        return (
            <div className="bg-zinc-900/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-purple-800/50 flex justify-center items-center h-64">
                <div className="text-red-400">{error}</div>
            </div>
        )
    }

    return (
        selectedGame ? (
            <GameDetail game={games.find((g) => g.id === selectedGame)} onBack={() => setSelectedGame(null)} />
        ) : (
            <div className="bg-zinc-900/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-purple-800/50">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <Heart className="h-6 w-6 text-red-500 fill-red-500" />
                            <h1 className="text-3xl md:text-4xl font-bold text-white">Game Ưa Thích</h1>
                        </div>
                        <p className="text-purple-300 mt-2">
                            {user && `${user.f_name} ${user.l_name} • `}{filteredGames.length} game yêu thích
                        </p>
                    </div>
                    <div className="flex items-center gap-3 mt-4 md:mt-0 w-full md:w-auto justify-end">
                        <div className="flex bg-purple-800/80 rounded-md overflow-hidden border border-purple-700/50 shadow-lg">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewMode("grid")}
                                className={`rounded-none px-3 py-2 h-9 hover:bg-purple-700 hover:text-purple-200 ${viewMode === "grid" ? "bg-purple-700 text-white" : "text-purple-400"}`}
                            >
                                <Grid className="h-4 w-4" />
                                <span className="sr-only">Grid view</span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setViewMode("list")}
                                className={`rounded-none px-3 py-2 h-9 hover:bg-purple-700 hover:text-purple-200 ${viewMode === "list" ? "bg-purple-700 text-white" : "text-purple-400"}`}
                            >
                                <List className="h-4 w-4" />
                                <span className="sr-only">List view</span>
                            </Button>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 hover:bg-purple-700 hover:text-purple-200 bg-purple-800/80 border-purple-700/50 shadow-lg text-purple-200"
                        >
                            <Filter className="h-4 w-4 mr-2" />
                            Quản lý
                        </Button>
                    </div>
                </div>

                {/* Tabs for status filter */}
                <Tabs defaultValue="all" className="mb-6" onValueChange={setStatusFilter}>
                    <TabsList className="bg-purple-800/80 border border-purple-700/50 w-full justify-start rounded-lg p-1 h-auto shadow-lg">
                        <TabsTrigger
                            value="all"
                            className="rounded-md data-[state=active]:bg-purple-700 data-[state=active]:text-white data-[state=active]:shadow-sm px-4 py-2 hover:text-purple-200"
                        >
                            Tất cả
                        </TabsTrigger>
                        <TabsTrigger
                            value="not_purchased"
                            className="rounded-md data-[state=active]:bg-purple-700 data-[state=active]:text-white data-[state=active]:shadow-sm px-4 py-2 hover:text-purple-200"
                        >
                            Chưa mua
                        </TabsTrigger>
                        <TabsTrigger
                            value="purchased"
                            className="rounded-md data-[state=active]:bg-purple-700 data-[state=active]:text-white data-[state=active]:shadow-sm px-4 py-2 hover:text-purple-200"
                        >
                            Đã mua
                        </TabsTrigger>
                    </TabsList>
                </Tabs>

                {/* Search and filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-4 w-4" />
                        <Input
                            placeholder="Tìm kiếm game..."
                            className="pl-10 bg-purple-800/80 border-purple-700/50 focus:border-purple-600 shadow-lg rounded-lg text-white placeholder-purple-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3">
                        <Select value={filterTag} onValueChange={setFilterTag}>
                            <SelectTrigger className="w-[180px] bg-purple-800/80 border-purple-700/50 hover:border-purple-600 shadow-lg rounded-lg text-white">
                                <SelectValue placeholder="Thể loại" />
                            </SelectTrigger>
                            <SelectContent className="bg-purple-900 border-purple-700 text-white rounded-lg">
                                <SelectItem value="all">Tất cả thể loại</SelectItem>
                                {allTags.map((tag) => (
                                    <SelectItem key={tag} value={tag}>
                                        {formatTag(tag)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-[180px] bg-purple-800/80 border-purple-700/50 hover:border-purple-600 shadow-lg rounded-lg text-white">
                                <SelectValue placeholder="Sắp xếp theo" />
                            </SelectTrigger>
                            <SelectContent className="bg-purple-900 border-purple-700 text-white rounded-lg">
                                <SelectItem value="name">Theo tên A-Z</SelectItem>
                                <SelectItem value="price">Theo giá thấp-cao</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Game list */}
                {filteredGames.length === 0 ? (
                    <div className="bg-purple-900/30 border border-purple-700/30 rounded-lg p-8 text-center">
                        <Heart className="h-12 w-12 mx-auto text-purple-500 mb-4 opacity-50" />
                        <h3 className="text-xl font-semibold text-white mb-2">Không có game yêu thích</h3>
                        <p className="text-purple-300 max-w-md mx-auto">
                            {searchQuery || filterTag !== "all" || statusFilter !== "all"
                                ? "Không tìm thấy kết quả nào phù hợp với bộ lọc hiện tại."
                                : "Bạn chưa thêm game nào vào danh sách yêu thích. Hãy thêm game từ trang chủ hoặc trang cửa hàng."}
                        </p>
                        {(searchQuery || filterTag !== "all" || statusFilter !== "all") && (
                            <Button
                                className="mt-4 bg-purple-700 hover:bg-purple-600 text-white"
                                onClick={() => {
                                    setSearchQuery("");
                                    setFilterTag("all");
                                    setStatusFilter("all");
                                }}
                            >
                                Đặt lại bộ lọc
                            </Button>
                        )}
                        {!(searchQuery || filterTag !== "all" || statusFilter !== "all") && (
                            <Button
                                className="mt-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
                                onClick={() => navigate('/')}
                            >
                                Khám phá game
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-5"}>
                        {filteredGames.map((game) => (
                            <div key={game.id} className="game-card">
                                {/* Card hoặc row tùy thuộc vào viewMode */}
                                {viewMode === "grid" ? (
                                    <div className="bg-purple-900/40 border border-purple-700/50 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-purple-600/70 group">
                                        <div
                                            className="h-44 bg-cover bg-center relative"
                                            style={{ backgroundImage: `url(${game.thumbnailImage || 'https://placehold.co/400x200/3a1a5e/ffffff?text=Game+Image'})` }}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 to-transparent"></div>
                                            <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                                                <span className="bg-purple-600/90 text-white text-xs px-2 py-1 rounded-full">
                                                    {game.publisher}
                                                </span>
                                                {game.tags.slice(0, 1).map((tag) => (
                                                    <span key={tag} className="bg-pink-600/90 text-white text-xs px-2 py-1 rounded-full">
                                                        {formatTag(tag)}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="absolute top-3 right-3">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-full bg-purple-800/50 hover:bg-red-600/70 backdrop-blur-sm text-white hover:text-white border border-purple-700/50"
                                                >
                                                    <Heart className="h-4 w-4 fill-white" />
                                                    <span className="sr-only">Remove from favorites</span>
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <h3 className="text-lg font-semibold text-white truncate">{game.name}</h3>
                                            <div className="mt-3 flex justify-between items-center">
                                                <div className="text-purple-200 font-medium">{game.price}</div>
                                                <Button
                                                    onClick={() => handleGameSelect(game.id)}
                                                    className="text-xs h-8 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg hover:shadow-purple-500/30"
                                                >
                                                    Xem chi tiết
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex bg-purple-900/40 border border-purple-700/50 rounded-lg hover:shadow-lg transition-all duration-200 hover:border-purple-600/70 overflow-hidden">
                                        <div
                                            className="w-32 h-24 bg-cover bg-center flex-shrink-0"
                                            style={{ backgroundImage: `url(${game.thumbnailImage || 'https://placehold.co/400x200/3a1a5e/ffffff?text=Game+Image'})` }}
                                        ></div>
                                        <div className="flex-1 p-4 flex justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-white">{game.name}</h3>
                                                <div className="flex space-x-2 mt-1">
                                                    {game.tags.slice(0, 2).map((tag) => (
                                                        <span key={tag} className="text-xs text-purple-300">{formatTag(tag)}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <div className="text-purple-200 font-medium text-right">{game.price}</div>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 rounded-full bg-purple-800/50 hover:bg-red-600/70 text-white"
                                                    >
                                                        <Heart className="h-4 w-4 fill-white" />
                                                        <span className="sr-only">Remove from favorites</span>
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleGameSelect(game.id)}
                                                        className="text-xs h-8 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
                                                    >
                                                        Xem chi tiết
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    )
}