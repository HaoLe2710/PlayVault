import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CreditCard, CheckCircle, XCircle } from "lucide-react";
import { Button } from "../components/ui/button";
import { Toaster, toast } from "../components/ui/sonner";
import { getGameById } from "../api/games";
import { getCart, updateCart } from "../api/cart";
import { getPurchaseByUserId, createPurchase, updatePurchase } from "../api/purchases";
import { motion } from "framer-motion";

function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedItems = [], totalPrice = 0 } = location.state || {};
  const [games, setGames] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          setError("Vui lòng đăng nhập để thực hiện thanh toán.");
        }
      } catch (err) {
        console.error("Error checking user login:", err);
        setUser(null);
        setError("Vui lòng đăng nhập để thực hiện thanh toán.");
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Lấy thông tin game từ selectedItems
  useEffect(() => {
    const fetchGames = async () => {
      if (!user || selectedItems.length === 0) return;
      try {
        const gamePromises = selectedItems.map(async (gameId) => {
          try {
            const game = await getGameById(gameId);
            return game;
          } catch (err) {
            console.warn(`Failed to fetch game with ID ${gameId}:`, err);
            toast.warning(`Sản phẩm với ID ${gameId} không tồn tại.`);
            return null;
          }
        });

        const fetchedGames = (await Promise.all(gamePromises)).filter((game) => game !== null);
        setGames(fetchedGames);
      } catch (err) {
        console.error("Error fetching games:", err);
        setError("Không thể tải dữ liệu sản phẩm.");
      }
    };

    fetchGames();
  }, [user, selectedItems]);

  // Xử lý thanh toán
  const handleConfirmPayment = async () => {
    if (!user || selectedItems.length === 0) {
      toast.error("Không có sản phẩm để thanh toán!");
      return;
    }

    try {
      console.log("Starting payment process", { userId: user.id, selectedItems, totalPrice });

      const currentDate = new Date().toISOString();
      const purchaseData = {
        user_id: Number(user.id),
        games_purchased: selectedItems.map((gameId) => {
          const game = games.find((g) => String(g.id) === String(gameId));
          return {
            game_id: Number(gameId),
            price: game ? game.price : 0,
            purchased_at: { $date: currentDate },
          };
        }),
      };

      console.log("Purchase data prepared:", purchaseData);

      // Kiểm tra và cập nhật lịch sử mua hàng
      const existingPurchase = await getPurchaseByUserId(user.id);
      console.log("Existing purchase:", existingPurchase);

      if (existingPurchase) {
        const updatedGamesPurchased = [
          ...existingPurchase.games_purchased,
          ...purchaseData.games_purchased,
        ];
        await updatePurchase(existingPurchase.id, {
          ...existingPurchase,
          games_purchased: updatedGamesPurchased,
        });
        console.log("Updated purchase:", updatedGamesPurchased);
      } else {
        await createPurchase(purchaseData);
        console.log("Created new purchase:", purchaseData);
      }

      // Xóa các game đã thanh toán khỏi giỏ hàng
      const cartResponse = await fetch(`https://playvaultdatadeloy-production.up.railway.app/cart?user_id=${user.id}`);
      if (!cartResponse.ok) {
        throw new Error(`Failed to fetch cart: ${cartResponse.statusText}`);
      }
      const cartData = await cartResponse.json();
      const cart = cartData[0];
      console.log("Cart data:", cart);

      if (cart && cart.cart_items && cart.cart_items.length > 0) {
        const updatedCartItems = cart.cart_items.filter(
          (item) => !selectedItems.map(String).includes(String(item.id))
        );
        const cartUpdateData = {
          id: cart.id,
          user_id: Number(user.id),
          cart_items: updatedCartItems,
        };
        await updateCart(cart.id, cartUpdateData);
        console.log("Updated cart:", cartUpdateData);
      }

      // Hiển thị thông báo thanh toán thành công
      toast.success("Thanh toán thành công!", {
        description: (
          <div className="bg-purple-900/40 border border-purple-700/50 p-4 rounded-lg">
            <p className="text-purple-200">Bạn đã mua: {games.map((g) => g.name).join(", ")}</p>
            <p className="text-purple-200">Tổng giá: {totalPrice.toLocaleString("vi-VN")} VND</p>
            <Button
              className="mt-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
              onClick={() => navigate("/products")}
            >
              Tiếp tục mua sắm
            </Button>
          </div>
        ),
        duration: 5000,
        style: { background: "rgba(39, 39, 42, 0.9)", color: "#fff", border: "1px solid rgba(107, 33, 168, 0.5)" },
      });

      // Trì hoãn chuyển hướng để đảm bảo toast hiển thị
      setTimeout(() => {
        navigate("/products");
      }, 5000);
    } catch (error) {
      console.error("Error during payment:", error);
      toast.error(`Thanh toán thất bại: ${error.message || "Vui lòng thử lại."}`, {
        style: { background: "rgba(39, 39, 42, 0.9)", color: "#fff", border: "1px solid rgba(107, 33, 168, 0.5)" },
      });
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
            <CreditCard className="h-10 w-10 text-purple-500/70" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Lỗi thanh toán</h2>
          <p className="text-red-400 max-w-md mb-6">{error}</p>
          <Button
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white py-2 px-4 rounded-lg shadow transition-all duration-300 flex items-center gap-2"
            onClick={() => navigate("/login")}
          >
            <CreditCard className="h-4 w-4" />
            Đăng nhập
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-zinc-900/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-purple-800/50">
      <Toaster richColors position="top-right" expand={true} />
      {/* Header */}
      <motion.div
        className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-green-500" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">Thanh Toán</h1>
          </div>
          <p className="text-purple-300 mt-2">
            {user && `${user.f_name} ${user.l_name} • `}{games.length} sản phẩm
          </p>
        </div>
      </motion.div>

      {games.length === 0 ? (
        <motion.div
          className="bg-purple-900/30 border border-purple-700/30 rounded-lg p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <CreditCard className="h-12 w-12 mx-auto text-purple-500 mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-white mb-2">Không có sản phẩm để thanh toán</h3>
          <p className="text-purple-300 max-w-md mx-auto">
            Giỏ hàng của bạn hiện đang trống. Hãy thêm game từ trang cửa hàng để thanh toán.
          </p>
          <Button
            className="mt-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
            onClick={() => navigate("/cart")}
          >
            Quay lại giỏ hàng
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Danh sách sản phẩm */}
          <div className="lg:col-span-3">
            <motion.div
              className="bg-purple-900/40 border border-purple-700/50 rounded-lg p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-white mb-4">Sản Phẩm Thanh Toán</h2>
              <div className="space-y-5">
                {games.map((game) => (
                  <motion.div
                    key={String(game.id)}
                    className="flex bg-purple-900/40 border border-purple-700/50 rounded-lg hover:shadow-lg transition-all duration-200 hover:border-purple-600/70 group"
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className="w-32 h-24 bg-cover bg-center flex-shrink-0 rounded-l-lg"
                      style={{
                        backgroundImage: `url(${game.thumbnail_image || "https://placehold.co/400x200/3a1a5e/ffffff?text=Game+Image"})`,
                      }}
                    ></div>
                    <div className="flex-1 p-4 flex justify-between items-center">
                      <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-purple-200">{game.name}</h3>
                        <p className="text-purple-300 text-sm">
                          {game.price === 0 ? "Miễn phí" : `${game.price.toLocaleString("vi-VN")} VND`}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-purple-200 hover:bg-purple-700 hover:text-white"
                        onClick={() => navigate(`/game/${game.id}`)}
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Tóm tắt thanh toán */}
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
                  Số lượng sản phẩm: <span className="text-white font-medium">{games.length}</span>
                </p>
                <p className="text-purple-300">
                  Tổng tiền:{" "}
                  <span className="text-white font-bold text-xl">
                    {totalPrice.toLocaleString("vi-VN")} VND
                  </span>
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleConfirmPayment}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg hover:shadow-purple-500/30"
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Xác Nhận Thanh Toán
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-purple-800/80 border-purple-700/50 text-purple-200 hover:bg-purple-700 hover:text-white"
                  onClick={() => navigate("/cart")}
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  Quay Lại Giỏ Hàng
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CheckoutPage;