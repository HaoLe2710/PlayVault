"use client"

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, ShoppingCart, CheckCircle, XCircle } from "lucide-react";
import { Button } from "../components/ui/Button";
import { getGames } from "../api/games";
import { getCart, addToCart, removeFromCart, checkoutCart, checkoutAllCart } from "../api/cart";

function CartPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const userId = 18; // Replace with actual user ID from auth context

  // Calculate total price of selected items
  const totalPrice = cartItems
    .filter((item) => selectedItems.includes(item.id))
    .reduce((sum, item) => {
      const game = games.find((g) => g.id === item.id);
      return sum + (game ? game.price : 0);
    }, 0);

  // Fetch cart items and game details
  useEffect(() => {
    const fetchCartData = async () => {
      try {
        // Fetch all games
        const allGames = await getGames();
        setGames(allGames);

        // Fetch cart items
        const cart = await getCart(userId);
        setCartItems(cart);

        // Initialize selected items (all items selected by default)
        setSelectedItems(cart.map((item) => item.id));
        setLoading(false);
      } catch (err) {
        console.error("Error fetching cart data:", err);
        setError("Không thể tải dữ liệu giỏ hàng. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    fetchCartData();
  }, [userId]);

  // Remove game from cart
  const handleRemoveFromCart = async (gameId) => {
    try {
      const updatedCart = await removeFromCart(userId, gameId);
      setCartItems(updatedCart);
      setSelectedItems(selectedItems.filter((id) => id !== gameId));
    } catch (error) {
      alert("Không thể xóa game khỏi giỏ hàng.");
    }
  };

  // Toggle selection of a game
  const handleToggleSelect = (gameId) => {
    if (selectedItems.includes(gameId)) {
      setSelectedItems(selectedItems.filter((id) => id !== gameId));
    } else {
      setSelectedItems([...selectedItems, gameId]);
    }
  };

  // Checkout selected items
  const handleCheckoutSelected = async () => {
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất một game để thanh toán!");
      return;
    }
    try {
      const selectedGames = cartItems
        .filter((item) => selectedItems.includes(item.id))
        .map((item) => {
          const game = games.find((g) => g.id === item.id);
          return { id: item.id, name: game ? game.name : "Unknown", price: game ? game.price : 0 };
        });
      await checkoutCart(userId, selectedItems);
      alert(`Thanh toán các game: ${selectedGames.map((g) => g.name).join(", ")} với tổng giá ${totalPrice.toLocaleString("vi-VN")} VND`);
      // Refresh cart
      const updatedCart = await getCart(userId);
      setCartItems(updatedCart);
      setSelectedItems([]);
    } catch (error) {
      alert("Thanh toán thất bại. Vui lòng thử lại.");
    }
  };

  // Checkout all items
  const handleCheckoutAll = async () => {
    if (cartItems.length === 0) {
      alert("Giỏ hàng trống!");
      return;
    }
    try {
      const allGames = cartItems.map((item) => {
        const game = games.find((g) => g.id === item.id);
        return { id: item.id, name: game ? game.name : "Unknown", price: game ? game.price : 0 };
      });
      await checkoutAllCart(userId);
      alert(`Thanh toán toàn bộ giỏ hàng: ${allGames.map((g) => g.name).join(", ")} với tổng giá ${totalPrice.toLocaleString("vi-VN")} VND`);
      // Refresh cart
      const updatedCart = await getCart(userId);
      setCartItems(updatedCart);
      setSelectedItems([]);
    } catch (error) {
      alert("Thanh toán thất bại. Vui lòng thử lại.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
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
          Quay về Trang chủ
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8 text-white">Giỏ Hàng</h1>

      {cartItems.length === 0 ? (
        <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-500/30 text-center">
          <p className="text-purple-300 text-lg mb-4">Giỏ hàng của bạn đang trống.</p>
          <Button
            variant="outline"
            className="border-purple-400 text-purple-200 hover:bg-purple-700 hover:text-white"
            onClick={() => navigate("/")}
          >
            Tiếp tục mua sắm
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Cart Items List */}
          <div className="lg:col-span-3">
            <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-500/30">
              <h2 className="text-2xl font-bold mb-4 text-white">Sản Phẩm Trong Giỏ Hàng</h2>
              <div className="space-y-4">
                {cartItems.map((item) => {
                  const game = games.find((g) => g.id === item.id);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center bg-purple-800/30 p-4 rounded-lg border border-purple-500/20 hover:bg-purple-700/20"
                    >
                      {/* Checkbox for selection */}
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleToggleSelect(item.id)}
                        className="mr-4 h-5 w-5 text-purple-600 focus:ring-purple-500 border-purple-400 rounded"
                      />

                      {/* Game Thumbnail */}
                      <img
                        src={game?.thumbnail_image || "/placeholder.jpg"}
                        alt={game?.name || "Unknown Game"}
                        className="w-24 h-16 object-cover rounded mr-4"
                        onError={(e) => (e.target.src = "/placeholder.jpg")}
                      />

                      {/* Game Info */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white">{game?.name || "Unknown Game"}</h3>
                        <p className="text-purple-300 text-sm">
                          {game?.price === 0 ? "Miễn phí" : `${game?.price.toLocaleString("vi-VN")} VND`}
                        </p>
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="outline"
                        className="border-red-400 text-red-200 hover:bg-red-600 hover:text-white"
                        onClick={() => handleRemoveFromCart(item.id)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Checkout Summary */}
          <div className="lg:col-span-1">
            <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-500/30 sticky top-4">
              <h2 className="text-2xl font-bold mb-4 text-white">Tóm Tắt Thanh Toán</h2>
              <div className="mb-6">
                <p className="text-purple-300">Số lượng sản phẩm: <span className="text-white font-medium">{selectedItems.length}</span></p>
                <p className="text-purple-300">Tổng tiền: <span className="text-white font-bold text-xl">{totalPrice.toLocaleString("vi-VN")} VND</span></p>
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleCheckoutSelected}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={selectedItems.length === 0}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Thanh Toán Các Mục Đã Chọn
                </Button>
                <Button
                  onClick={handleCheckoutAll}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Thanh Toán Toàn Bộ
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-purple-400 text-purple-200 hover:bg-purple-700 hover:text-white"
                  onClick={() => navigate("/")}
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  Tiếp Tục Mua Sắm
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;