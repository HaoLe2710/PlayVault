import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    ShoppingCart, ChevronLeft, ChevronRight,
    Star, Info, Tag, Trophy, Award, Heart, Flame, Box, Eye, Zap, Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { getGames } from "../../api/games";
import { getWishlist, createWishlist, updateWishlist } from "../../api/wishlist";

export default function ProductsPage() {
    const [games, setGames] = useState([]);
    const [filteredGames, setFilteredGames] = useState([]);
    const [activeCategory, setActiveCategory] = useState("all");
    const [activeSlide, setActiveSlide] = useState(0);
    const navigate = useNavigate();
    const [featuredGame, setFeaturedGame] = useState(null);
    const [hoveredGameId, setHoveredGameId] = useState(null);
    const [isFavorite, setIsFavorite] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [wishlistError, setWishlistError] = useState(null);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [user, setUser] = useState(null);

    const allCategories = [
        { id: "all", name: "Tất cả", icon: <Tag size={14} /> },
        { id: "action", name: "Action", icon: <Zap size={14} /> },
        { id: "adventure", name: "Adventure", icon: <Award size={14} /> },
        { id: "role-playing", name: "Role-Playing", icon: <Star size={14} /> },
        { id: "sci-fi", name: "Sci-Fi", icon: <Box size={14} /> },
        { id: "sports", name: "Sports", icon: <Trophy size={14} /> },
        { id: "simulation", name: "Simulation", icon: <Box size={14} /> },
        { id: "fantasy", name: "Fantasy", icon: <Sparkles size={14} /> },
        { id: "stealth", name: "Stealth", icon: <Eye size={14} /> },
        { id: "sandbox", name: "Sandbox", icon: <Box size={14} /> },
        { id: "survival", name: "Survival", icon: <Flame size={14} /> },
        { id: "exploration", name: "Exploration", icon: <Eye size={14} /> },
        { id: "open-world", name: "Open World", icon: <Box size={14} /> },
        { id: "shooter", name: "Shooter", icon: <Zap size={14} /> },
        { id: "fps", name: "FPS", icon: <Eye size={14} /> },
        { id: "horror", name: "Horror", icon: <Flame size={14} /> },
        { id: "life-sim", name: "Life Sim", icon: <Box size={14} /> },
        { id: "multiplayer", name: "Multiplayer", icon: <Box size={14} /> },
        { id: "puzzle", name: "Puzzle", icon: <Box size={14} /> },
        { id: "platformer", name: "Platformer", icon: <Award size={14} /> },
        { id: "metroidvania", name: "Metroidvania", icon: <Zap size={14} /> },
        { id: "mythology", name: "Mythology", icon: <Sparkles size={14} /> },
        { id: "party", name: "Party", icon: <Sparkles size={14} /> },
        { id: "social-deduction", name: "Social Deduction", icon: <Eye size={14} /> },
        { id: "farming", name: "Farming", icon: <Box size={14} /> },
        { id: "indie", name: "Indie", icon: <Award size={14} /> },
        { id: "hack-and-slash", name: "Hack and Slash", icon: <Zap size={14} /> },
        { id: "strategy", name: "Strategy", icon: <Box size={14} /> },
        { id: "turn-based", name: "Turn-Based", icon: <Box size={14} /> },
        { id: "racing", name: "Racing", icon: <Zap size={14} /> },
        { id: "city-building", name: "City Building", icon: <Box size={14} /> },
        { id: "roguelike", name: "Roguelike", icon: <Flame size={14} /> },
        { id: "fighting", name: "Fighting", icon: <Zap size={14} /> },
    ];

    // Kiểm tra trạng thái đăng nhập
    useEffect(() => {
        const checkLoggedIn = () => {
            try {
                const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
                const accessToken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
                if (storedUser && accessToken) {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                } else {
                    setUser(null);
                }
            } catch (err) {
                console.error("Error checking user login:", err);
                setUser(null);
            }
        };

        checkLoggedIn();
    }, []);

    // Fetch games and wishlist
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch games
                const gamesData = await getGames();
                const games = Array.isArray(gamesData) ? gamesData : gamesData.games || [];
                if (!games.length) {
                    throw new Error("Không có trò chơi nào được trả về từ server");
                }
                setGames(games);
                setFilteredGames(games);

                const gta = games.find((game) => game.name === "Grand Thief Auto V (GTA 5)");
                setFeaturedGame(gta || games[0]);

                // Fetch wishlist and set favorite states
                if (user && user.id) {
                    const wishlistData = await getWishlist();
                    const userWishlist = wishlistData.find((item) => {
                        const userId = user.id ? String(user.id) : null;
                        const itemUserId = item.user_id ? String(item.user_id) : item.userId ? String(item.userId) : null;
                        return userId && itemUserId && (itemUserId === userId || Number(itemUserId) === Number(userId));
                    });

                    if (userWishlist) {
                        const favGameIds = userWishlist.fav_game_id || userWishlist.favGameId || [];
                        const favoriteMap = {};
                        games.forEach((game) => {
                            favoriteMap[game.id] = favGameIds.some(
                                (favId) => Number(favId) === Number(game.id) || favId.toString() === game.id.toString()
                            );
                        });
                        setIsFavorite(favoriteMap);
                    }
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
                setError(error.message || "Không thể tải dữ liệu. Vui lòng kiểm tra kết nối hoặc thử lại sau.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const filterByCategory = (category) => {
        setActiveCategory(category);
        if (category === "all") {
            setFilteredGames(games);
        } else {
            const filtered = games.filter(game =>
                game.tags.includes(category.toLowerCase())
            );
            setFilteredGames(filtered);
        }
    };

    const navigateToGameDetail = (game) => {
        if (!game?.id) return
        alert(`Bạn đã chọn mua ${game.title}!`)
        navigate(`/game/${game.id}`) // Điều hướng đến trang chi tiết
    };

    const handleFavoriteToggle = async (game, e) => {
        if (e) {
            e.stopPropagation();
        }
        if (!user || !user.id) {
            alert("Vui lòng đăng nhập để thêm game vào danh sách yêu thích!");
            navigate("/login");
            return;
        }

        try {
            setWishlistLoading(true);
            setWishlistError(null);
            const wishlistData = await getWishlist();
            let userWishlist = wishlistData.find((item) => {
                const userId = user.id ? String(user.id) : null;
                const itemUserId = item.user_id ? String(item.user_id) : item.userId ? String(item.userId) : null;
                return userId && itemUserId && (itemUserId === userId || Number(itemUserId) === Number(userId));
            });

            // Nếu không có wishlist cho người dùng, tạo mới
            if (!userWishlist) {
                userWishlist = {
                    user_id: Number(user.id),
                    fav_game_id: [Number(game.id)],
                };
                await createWishlist(userWishlist);
                setIsFavorite({ ...isFavorite, [game.id]: true });
                alert(`${game.name} đã được thêm vào danh sách yêu thích!`);
                window.dispatchEvent(new Event("wishlistUpdated"));
                setWishlistLoading(false);
                return;
            }

            const favGameIds = userWishlist.fav_game_id || userWishlist.favGameId || [];
            let updatedFavGameIds;

            if (isFavorite[game.id]) {
                // Xóa game khỏi wishlist
                updatedFavGameIds = favGameIds.filter(
                    (favId) => Number(favId) !== Number(game.id) && favId.toString() !== game.id.toString()
                );
                setIsFavorite({ ...isFavorite, [game.id]: false });
                alert(`${game.name} đã được xóa khỏi danh sách yêu thích!`);
            } else {
                // Thêm game vào wishlist
                updatedFavGameIds = [...favGameIds, Number(game.id)];
                setIsFavorite({ ...isFavorite, [game.id]: true });
                alert(`${game.name} đã được thêm vào danh sách yêu thích!`);
            }

            // Cập nhật wishlist qua API
            await updateWishlist(userWishlist.id, { ...userWishlist, fav_game_id: updatedFavGameIds });
            window.dispatchEvent(new Event("wishlistUpdated"));
            setWishlistLoading(false);
        } catch (err) {
            console.error("Error updating wishlist:", err);
            setWishlistError("Không thể cập nhật danh sách yêu thích. Vui lòng thử lại sau.");
            setWishlistLoading(false);
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price);
    };

    const nextSlide = () => {
        if (featuredGame) {
            setActiveSlide((prev) => (prev === featuredGame.images.length - 1 ? 0 : prev + 1));
        }
    };

    const prevSlide = () => {
        if (featuredGame) {
            setActiveSlide((prev) => (prev === 0 ? featuredGame.images.length - 1 : prev - 1));
        }
    };

    const getTagIcon = (tag) => {
        switch (tag) {
            case "action":
                return <span className="bg-red-500/20 text-red-400 p-1.5 rounded-md text-xs flex items-center">
                    <Zap className="w-3 h-3 mr-1" /> Action
                </span>;
            case "adventure":
                return <span className="bg-green-500/20 text-green-400 p-1.5 rounded-md text-xs flex items-center">
                    <Award className="w-3 h-3 mr-1" /> Adventure
                </span>;
            case "role-playing":
                return <span className="bg-blue-500/20 text-blue-400 p-1.5 rounded-md text-xs flex items-center">
                    <Star className="w-3 h-3 mr-1" /> Role-Playing
                </span>;
            case "sports":
                return <span className="bg-orange-500/20 text-orange-400 p-1.5 rounded-md text-xs flex items-center">
                    <Trophy className="w-3 h-3 mr-1" /> Sports
                </span>;
            case "simulation":
                return <span className="bg-pink-500/20 text-pink-400 p-1.5 rounded-md text-xs flex items-center">
                    <Box className="w-3 h-3 mr-1" /> Simulation
                </span>;
            case "sci-fi":
                return <span className="bg-indigo-500/20 text-indigo-400 p-1.5 rounded-md text-xs flex items-center">
                    <Box className="w-3 h-3 mr-1" /> Sci-Fi
                </span>;
            case "fantasy":
                return <span className="bg-purple-500/20 text-purple-400 p-1.5 rounded-md text-xs flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" /> Fantasy
                </span>;
            case "stealth":
                return <span className="bg-gray-500/20 text-gray-400 p-1.5 rounded-md text-xs flex items-center">
                    <Eye className="w-3 h-3 mr-1" /> Stealth
                </span>;
            case "sandbox":
                return <span className="bg-yellow-500/20 text-yellow-400 p-1.5 rounded-md text-xs flex items-center">
                    <Box className="w-3 h-3 mr-1" /> Sandbox
                </span>;
            case "survival":
                return <span className="bg-teal-500/20 text-teal-400 p-1.5 rounded-md text-xs flex items-center">
                    <Flame className="w-3 h-3 mr-1" /> Survival
                </span>;
            case "fps":
                return <span className="bg-red-600/20 text-red-400 p-1.5 rounded-md text-xs flex items-center">
                    <Eye className="w-3 h-3 mr-1" /> FPS
                </span>;
            case "open-world":
                return <span className="bg-emerald-500/20 text-emerald-400 p-1.5 rounded-md text-xs flex items-center">
                    <Box className="w-3 h-3 mr-1" /> Open World
                </span>;
            case "multiplayer":
                return <span className="bg-blue-600/20 text-blue-400 p-1.5 rounded-md text-xs flex items-center">
                    <Tag className="w-3 h-3 mr-1" /> Multiplayer
                </span>;
            case "racing":
                return <span className="bg-amber-500/20 text-amber-400 p-1.5 rounded-md text-xs flex items-center">
                    <Zap className="w-3 h-3 mr-1" /> Racing
                </span>;
            case "indie":
                return <span className="bg-violet-500/20 text-violet-400 p-1.5 rounded-md text-xs flex items-center">
                    <Sparkles className="w-3 h-3 mr-1" /> Indie
                </span>;
            case "strategy":
                return <span className="bg-cyan-500/20 text-cyan-400 p-1.5 rounded-md text-xs flex items-center">
                    <Box className="w-3 h-3 mr-1" /> Strategy
                </span>;
            default:
                return <span className="bg-gray-500/20 text-gray-400 p-1.5 rounded-md text-xs flex items-center">
                    <Tag className="w-3 h-3 mr-1" /> {tag}
                </span>;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 text-white flex items-center justify-center">
                <div className="text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="inline-block"
                    >
                        <Zap className="h-8 w-8 text-purple-300" />
                    </motion.div>
                    <p className="mt-4 text-lg">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 text-white flex items-center justify-center">
                <div className="text-center bg-purple-900/50 p-10 rounded-xl border border-purple-700">
                    <h3 className="text-2xl font-bold text-purple-200 mb-2">Lỗi tải dữ liệu</h3>
                    <p className="text-purple-300 max-w-md mx-auto">
                        {error}
                    </p>
                    <Button
                        className="mt-4 bg-purple-800 hover:bg-purple-700 text-white"
                        onClick={() => window.location.reload()}
                    >
                        Thử lại
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 text-white pb-16">
            {wishlistError && (
                <div className="fixed top-4 right-4 bg-red-600/90 text-white p-4 rounded-lg shadow-lg">
                    <p>{wishlistError}</p>
                    <Button
                        className="mt-2 bg-red-700 hover:bg-red-800"
                        onClick={() => setWishlistError(null)}
                    >
                        Đóng
                    </Button>
                </div>
            )}
            <main className="container mx-auto px-4 pt-8">
                <motion.h1
                    className="text-3xl md:text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 text-center"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    Khám Phá Các Tựa Game Hấp Dẫn
                </motion.h1>

                {featuredGame && (
                    <motion.div
                        className="relative rounded-2xl overflow-hidden mb-12 shadow-[0_5px_30px_rgba(109,40,217,0.7)]"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="relative h-[400px] md:h-[500px]">
                            <div className="absolute inset-0">
                                {featuredGame.images.map((image, index) => (
                                    <motion.div
                                        key={index}
                                        className="absolute inset-0"
                                        initial={{ opacity: 0, scale: 1.1 }}
                                        animate={{
                                            opacity: activeSlide === index ? 1 : 0,
                                            scale: activeSlide === index ? 1 : 1.1
                                        }}
                                        transition={{ duration: 0.8 }}
                                    >
                                        <img
                                            src={image}
                                            alt={featuredGame.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </motion.div>
                                ))}
                                <div className="absolute inset-0 bg-gradient-to-t from-purple-950/95 via-purple-900/70 to-transparent"></div>
                            </div>

                            <button
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-purple-900/60 hover:bg-purple-800 p-3 rounded-full text-white z-10 backdrop-blur-sm border border-purple-700/50 transition-colors"
                                onClick={prevSlide}
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-purple-900/60 hover:bg-purple-800 p-3 rounded-full text-white z-10 backdrop-blur-sm border border-purple-700/50 transition-colors"
                                onClick={nextSlide}
                            >
                                <ChevronRight size={24} />
                            </button>

                            <div className="absolute top-4 left-4 z-10">
                                <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white uppercase tracking-wide px-3 py-1">
                                    <Sparkles className="h-4 w-4 mr-1" /> Nổi bật
                                </Badge>
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                                <div className="flex flex-col md:flex-row items-start md:items-end justify-between">
                                    <div>
                                        <div className="flex items-center space-x-2 mb-3">
                                            <Badge className="bg-purple-600 text-white">{featuredGame.details.publisher}</Badge>
                                            <div className="flex items-center text-yellow-400 text-sm">
                                                <Star className="h-4 w-4 mr-1 fill-current" />
                                                <span>4.8</span>
                                            </div>
                                        </div>
                                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{featuredGame.name}</h1>
                                        <p className="text-gray-300 mb-4 max-w-2xl line-clamp-2">
                                            {featuredGame.details.describe.substring(0, 150)}...
                                        </p>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {featuredGame.tags.map((tag, idx) => (
                                                <span key={idx} className="mr-2">{getTagIcon(tag)}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end mt-4 md:mt-0">
                                        <p className="text-2xl font-bold text-white mb-2">{formatPrice(featuredGame.price)} ₫</p>
                                        <div className="flex space-x-3">
                                            <Button
                                                className="bg-purple-800/80 hover:bg-purple-700 border border-purple-600 text-white"
                                                onClick={() => navigateToGameDetail(featuredGame)}
                                            >
                                                Xem Chi Tiết
                                            </Button>
                                            <Button
                                                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
                                                onClick={() => navigateToGameDetail(featuredGame)}
                                            >
                                                Mua Ngay
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                                {featuredGame.images.map((_, idx) => (
                                    <button
                                        key={idx}
                                        className={`w-2 h-2 rounded-full ${activeSlide === idx ? 'bg-white' : 'bg-white/50'}`}
                                        onClick={() => setActiveSlide(idx)}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                <div className="mb-10">
                    <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300">Danh mục sản phẩm</span>
                    </h2>
                    <div className="bg-purple-950/40 backdrop-blur-sm p-5 rounded-xl border border-purple-800/50 shadow-lg">
                        <div className="flex flex-wrap gap-3">
                            {allCategories.map((category) => (
                                <button
                                    key={category.id}
                                    className={`px-4 py-2.5 rounded-full transition-all duration-300 flex items-center ${activeCategory === category.id
                                        ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white font-medium shadow-md'
                                        : 'bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 border border-purple-700/50'}`}
                                    onClick={() => filterByCategory(category.id)}
                                >
                                    <span className="mr-1.5">{category.icon}</span>
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredGames && filteredGames.map((game) => (
                        <motion.div
                            key={game.id}
                            className="group"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * parseInt(game.id) % 5 }}
                            onHoverStart={() => setHoveredGameId(game.id)}
                            onHoverEnd={() => setHoveredGameId(null)}
                        >
                            <Card className="bg-purple-950/60 backdrop-blur-sm border border-purple-700/50 hover:border-pink-500/80 overflow-hidden transition-all duration-300 
                                hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] rounded-xl transform hover:-translate-y-1">
                                <div className="relative h-52 overflow-hidden">
                                    <img
                                        src={game.thumbnail_image}
                                        alt={game.name}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-purple-950 via-purple-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 
                                        flex items-end justify-center pb-6">
                                        <div className="flex space-x-2">
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                className="bg-purple-800/90 hover:bg-purple-700 text-white border border-purple-500 rounded-full px-4"
                                                onClick={() => navigateToGameDetail(game)}
                                            >
                                                <Info className="h-4 w-4 mr-1" />
                                                Chi tiết
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-full"
                                                onClick={() => navigateToGameDetail(game)}
                                            >
                                                <ShoppingCart className="h-4 w-4 mr-1" />
                                                Mua ngay
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="absolute top-2 right-2">
                                        <Badge className="bg-black/60 text-white border border-purple-700/50 backdrop-blur-sm">
                                            {game.details["age-limit"]}
                                        </Badge>
                                    </div>
                                    <button
                                        className="absolute top-2 left-2 bg-black/40 p-1.5 rounded-full backdrop-blur-sm border border-purple-700/50
                                            hover:bg-pink-600/30 hover:border-pink-500 transition-colors duration-300"
                                        onClick={(e) => handleFavoriteToggle(game, e)}
                                        disabled={wishlistLoading}
                                    >
                                        <Heart
                                            className={`h-4 w-4 ${isFavorite[game.id] ? 'text-pink-500 fill-pink-500' : 'text-white'}`}
                                        />
                                    </button>
                                </div>
                                <CardContent className="p-5">
                                    <motion.div
                                        className="flex flex-col space-y-3"
                                        animate={{ y: hoveredGameId === game.id ? -5 : 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div>
                                            <h3 className="font-semibold text-white text-lg line-clamp-1">{game.name}</h3>
                                            <p className="text-purple-300 text-sm">{game.details.publisher}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {game.tags.slice(0, 2).map((tag, idx) => (
                                                <span key={idx} className="text-xs">{getTagIcon(tag)}</span>
                                            ))}
                                            {game.tags.length > 2 && (
                                                <span className="text-xs bg-purple-800/40 text-purple-300 p-1.5 rounded-md flex items-center">
                                                    <Tag className="w-3 h-3 mr-1" />+{game.tags.length - 2}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between pt-2">
                                            <p className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-300">
                                                {formatPrice(game.price)} ₫
                                            </p>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    size="sm"
                                                    className="bg-purple-800/70 hover:bg-purple-700 text-white rounded-full h-8 w-8 p-0"
                                                    onClick={(e) => handleFavoriteToggle(game, e)}
                                                    disabled={wishlistLoading}
                                                >
                                                    <Heart className={`h-4 w-4 ${isFavorite[game.id] ? 'text-pink-500 fill-pink-500' : 'text-white'}`} />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-full h-8 w-8 p-0"
                                                    onClick={() => navigateToGameDetail(game)}
                                                >
                                                    <ShoppingCart className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {filteredGames.length === 0 && !isLoading && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="bg-purple-900/50 p-10 rounded-xl border border-purple-700">
                            <h3 className="text-2xl font-bold text-purple-200 mb-2">Không tìm thấy sản phẩm</h3>
                            <p className="text-purple-300 max-w-md mx-auto">
                                Không tìm thấy sản phẩm nào phù hợp với tiêu chí tìm kiếm của bạn. Vui lòng thử lại với từ khóa khác.
                            </p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}