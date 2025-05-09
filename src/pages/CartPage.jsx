import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, ShoppingCart, CheckCircle, XCircle, CreditCard } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Toaster, toast } from "../components/ui/sonner";
import { getGameById } from "../api/games";
import { getCart, addToCart, removeFromCart, checkoutCart, checkoutAllCart } from "../api/cart";
import { motion } from "framer-motion";

function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [user, setUser] = useState(null);

  // Check if user is logged in
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
          setError("Vui lòng đăng nhập để xem giỏ hàng.");
        }
      } catch (err) {
        console.error("Error checking user login:", err);
        setUser(null);
        setError("Vui lòng đăng nhập để xem giỏ hàng.");
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();

    window.addEventListener("storage", checkLoggedIn);
    return () => window.removeEventListener("storage", checkLoggedIn);
  }, []);

  // Calculate total price of selected items
  const totalPrice = cartItems
    .filter((item) => item && item.id && selectedItems.includes(String(item.id)))
    .reduce((sum, item) => {
      const game = games.find((g) => String(g.id) === String(item.id));
      return sum + (game ? game.price : 0);
    }, 0);

  // Fetch cart items and game details
  useEffect(() => {
    const fetchCartData = async () => {
      if (!user) return;
      try {
        // Fetch cart items
        const cart = await getCart(user.id);
        console.log("Fetched cart items:", cart);

        // Validate cart items (item is an object with id)
        const validCartItems = cart.filter((item, index) => {
          if (!item || typeof item !== "object" || !item.id || isNaN(item.id) || item.id <= 0) {
            console.warn(`Invalid cart item at index ${index}:`, item);
            toast.warning(`Một sản phẩm không hợp lệ trong giỏ hàng đã bị bỏ qua.`);
            return false;
          }
          return true;
        });

        console.log("Valid cart items:", validCartItems);
        setCartItems(validCartItems);

        // Fetch game details for each cart item
        const gamePromises = validCartItems.map(async (item) => {
          try {
            const game = await getGameById(item.id);
            console.log(`Fetched game for ID ${item.id}:`, game);
            return game;
          } catch (err) {
            console.warn(`Failed to fetch game with ID ${item.id}:`, err);
            toast.warning(`Sản phẩm với ID ${item.id} không tồn tại và đã bị xóa khỏi giỏ hàng.`);
            return null;
          }
        });

        const fetchedGames = (await Promise.all(gamePromises)).filter((game) => game !== null);
        console.log("Fetched games:", fetchedGames);
        setGames(fetchedGames);

        // Initialize selected items (all valid items selected by default)
        setSelectedItems(validCartItems.map((item) => String(item.id)));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching cart data:", err);
        setError(`Không thể tải dữ liệu giỏ hàng: ${err.message}`);
        setLoading(false);
      }
    };

    fetchCartData();
  }, [user]);

  // Remove game from cart
  const handleRemoveFromCart = async (gameId) => {
    try {
      const updatedCart = await removeFromCart(user.id, gameId);
      // Validate updated cart
      const validUpdatedCart = updatedCart.filter((item) => item && typeof item === "object" && item.id && !isNaN(item.id) && item.id > 0);
      setCartItems(validUpdatedCart);
      setSelectedItems(selectedItems.filter((id) => id !== String(gameId)));
      toast.success("Đã xóa game khỏi giỏ hàng!", {
        description: (
          <div>
            <p>Sản phẩm đã được xóa thành công.</p>
            <Button
              className="mt-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
              onClick={() => navigate("/products")}
            >
              Tiếp tục mua sắm
            </Button>
          </div>
        ),
        duration: 5000,
      });
    } catch (error) {
      console.error("Error removing from cart:", error);
      toast.error("Không thể xóa game khỏi giỏ hàng.");
    }
  };

  // Toggle selection of a game
  const handleToggleSelect = (gameId) => {
    const normalizedId = String(gameId);
    if (selectedItems.includes(normalizedId)) {
      setSelectedItems(selectedItems.filter((id) => id !== normalizedId));
    } else {
      setSelectedItems([...selectedItems, normalizedId]);
    }
  };

  // Navigate to checkout page with selected items
  const handleProceedToCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất một game để thanh toán!");
      return;
    }
    navigate("/checkout", { state: { selectedItems, totalPrice } });
  };

  // Checkout all items
  const handleCheckoutAll = async () => {
    if (cartItems.length === 0) {
      toast.error("Giỏ hàng trống!");
      return;
    }
    try {
      const allGames = cartItems
        .filter((item) => item && item.id)
        .map((item) => {
          const game = games.find((g) => String(g.id) === String(item.id));
          return { id: item.id, name: game ? game.name : "Unknown", price: game ? game.price : 0 };
        });
      await checkoutAllCart(user.id);
      toast.success("Thanh toán toàn bộ giỏ hàng thành công!", {
        description: (
          <div>
            <p>Bạn đã mua: {allGames.map((g) => g.name).join(", ")}</p>
            <p>Tổng giá: {totalPrice.toLocaleString("vi-VN")} VND</p>
            <Button
              className="mt-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
              onClick={() => navigate("/products")}
            >
              Tiếp tục mua sắm
            </Button>
          </div>
        ),
        duration: 5000,
      });
      // Refresh cart
      const updatedCart = await getCart(user.id);
      const validUpdatedCart = updatedCart.filter((item) => item && typeof item === "object" && item.id && !isNaN(item.id) && item.id > 0);
      setCartItems(validUpdatedCart);
      setSelectedItems([]);
    } catch (error) {
      console.error("Error during checkout all:", error);
      toast.error("Thanh toán thất bại. Vui lòng thử lại.");
    }
  };

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
    );
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
            <ShoppingCart className="h-10 w-10 text-purple-500/70" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Lỗi giỏ hàng</h2>
          <p className="text-red-400 max-w-md mb-6">{error}</p>
          <Button
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg shadow transition-all duration-300 flex items-center gap-2"
            onClick={() => navigate("/login")}
          >
            <XCircle className="h-4 w-4" />
            Đăng nhập
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-zinc-900/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-purple-800/50">
      <Toaster richColors position="top-right" />
      {/* Header */}
      <motion.div
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-purple-500" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">Giỏ Hàng</h1>
          </div>
          <p className="text-purple-300 mt-2">
            {user && `${user.f_name} ${user.l_name} • `}{cartItems.length} sản phẩm
          </p>
        </div>
      </motion.div>

      {cartItems.length === 0 ? (
        <motion.div
          className="bg-purple-900/30 border border-purple-700/30 rounded-lg p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <ShoppingCart className="h-12 w-12 mx-auto text-purple-500 mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-white mb-2">Giỏ hàng trống</h3>
          <p className="text-purple-300 max-w-md mx-auto">
            Bạn chưa thêm sản phẩm nào vào giỏ hàng. Hãy khám phá cửa hàng để thêm game yêu thích!
          </p>
          <Button
            className="mt-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
            onClick={() => navigate("/products")}
          >
            Khám phá cửa hàng
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Cart Items List */}
          <div className="lg:col-span-3">
            <motion.div
              className="bg-purple-900/40 border border-purple-700/50 rounded-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-white mb-4">Sản Phẩm Trong Giỏ Hàng</h2>
              <div className="space-y-5">
                {cartItems.map((item) => {
                  if (!item || !item.id) {
                    console.warn("Skipping invalid item:", item);
                    return null;
                  }
                  const game = games.find((g) => String(g.id) === String(item.id));
                  return (
                    <motion.div
                      key={String(item.id)}
                      className="flex bg-purple-900/40 border border-purple-700/50 rounded-lg hover:shadow-lg transition-all duration-200 hover:border-purple-600/70 group"
                      whileHover={{ scale: 1.02 }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div
                        className="w-32 h-24 bg-cover bg-center flex-shrink-0 rounded-l-lg"
                        style={{
                          backgroundImage: `url(${game?.thumbnail_image || "https://placehold.co/400x200/3a1a5e/ffffff?text=Game+Image"})`,
                        }}
                      ></div>
                      <div className="flex-1 p-4 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(String(item.id))}
                            onChange={() => handleToggleSelect(item.id)}
                            className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-purple-400 rounded"
                          />
                          <div>
                            <h3 className="text-lg font-semibold text-white group-hover:text-purple-200">
                              {game?.name || "Unknown Game"}
                            </h3>
                            <p className="text-purple-300 text-sm">
                              {game?.price === 0 ? "Miễn phí" : `${game?.price.toLocaleString("vi-VN")} VND`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-purple-200 hover:bg-purple-700 hover:text-white"
                            onClick={() => navigate(`/game/${item.id}`)}
                          >
                            Xem chi tiết
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full bg-purple-800/50 hover:bg-red-600/70 text-white"
                            onClick={() => handleRemoveFromCart(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Xóa khỏi giỏ hàng</span>
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Checkout Summary */}
          <div className="lg:col-span-1">
            <motion.div
              className="bg-purple-900/40 border border-purple-700/50 rounded-lg p-6 sticky top-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-white mb-4">Tóm Tắt Thanh Toán</h2>
              <div className="mb-6 space-y-2">
                <p className="text-purple-300">
                  Số lượng sản phẩm: <span className="text-white font-medium">{selectedItems.length}</span>
                </p>
                <p className="text-purple-300">
                  Tổng tiền: <span className="text-white font-bold text-xl">{totalPrice.toLocaleString("vi-VN")} VND</span>
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleProceedToCheckout}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg hover:shadow-purple-500/30"
                  disabled={selectedItems.length === 0}
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Tiến Hành Thanh Toán
                </Button>
                <Button
                  onClick={handleCheckoutAll}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-purple-500/30"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Thanh Toán Toàn Bộ
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-purple-800/80 border-purple-700/50 text-purple-200 hover:bg-purple-700 hover:text-white"
                  onClick={() => navigate("/products")}
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  Tiếp Tục Mua Sắm
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;