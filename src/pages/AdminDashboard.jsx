import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import BarChart from "../components/BarChart";
import {
  calculateCurrentStatistics,
  getPreviousStatistics,
  autoSaveStatistics,
} from "../api/statistic";
import { motion } from "framer-motion";

function AdminDashboard() {
  const [currentStats, setCurrentStats] = useState({
    revenue: 0,
    num_of_user: 0,
    num_of_interaction: 0,
    avg_cus_spend: 0,
    top_purchased_games: [],
    top_commented_games: [],
    all_comments: [],
    time: "",
  });
  const [previousStats, setPreviousStats] = useState({
    revenue: 0,
    num_of_user: 0,
    num_of_interaction: 0,
    avg_cus_spend: 0,
    top_purchased_games: [],
    top_commented_games: [],
  });
  const [error, setError] = useState(null);

  const fetchStatistics = async () => {
    try {
      const [current, previous] = await Promise.all([
        calculateCurrentStatistics(),
        getPreviousStatistics(),
      ]);
      setCurrentStats(current);
      setPreviousStats(previous);
      await autoSaveStatistics();
      setError(null);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      setError("Không thể tải dữ liệu thống kê. Vui lòng thử lại.");
    }
  };

  useEffect(() => {
    fetchStatistics();
    const interval = setInterval(fetchStatistics, 24 * 60 * 60 * 1000); // Check daily
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <motion.div
          className="bg-zinc-900/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-purple-800/50 text-red-500 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {error}
        </motion.div>
      </div>
    );
  }

  // Note for BarChart component update:
  // The BarChart component should be modified to:
  // 1. Accept a `thumbnails` array in the `data` prop to display images at the top of each bar.
  // 2. Support text wrapping for `labels` using CSS (e.g., `white-space: normal; word-wrap: break-word;`).
  // 3. Use gradient fill for bars (e.g., `linear-gradient(to top, #db2777, #9333ea)`).
  // 4. Ensure bars have hover effects (e.g., slight scale increase or brightness change).
  // Example pseudo-implementation:
  /*
  function BarChart({ title, data }) {
    return (
      <div className="bg-zinc-900/90 rounded-lg p-6 border border-purple-700/50">
        <h2 className="text-xl font-semibold text-white mb-4">{title}</h2>
        <div className="relative">
          {data.values.map((value, index) => (
            <div key={index} className="flex flex-col items-center">
              <img
                src={data.thumbnails[index] || "https://placehold.co/40x40"}
                alt={data.labels[index]}
                className="w-10 h-10 object-cover rounded-md mb-2"
              />
              <div
                className="bg-gradient-to-t from-pink-600 to-purple-600 hover:brightness-125"
                style={{ height: `${value * 10}px`, width: "40px" }}
              />
              <span className="text-white text-sm mt-2 text-center break-words w-24">
                {data.labels[index]}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  */

  return (
    <div className="container mx-auto">
      <motion.div
        className="bg-zinc-900/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-purple-800/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>

        {/* Stat Cards */}
        <motion.div
          className="bg-zinc-900/95 rounded-lg p-6 border border-purple-700/50 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-white mb-4">Thống Kê Tháng Này</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Tổng Doanh Thu (Tháng)"
              value={`${currentStats.revenue.toLocaleString("vi-VN")} VND`}
              change={`${(
                previousStats.revenue
                  ? ((currentStats.revenue - previousStats.revenue) / previousStats.revenue) * 100
                  : 0
              ).toFixed(1)}%`}
              isPositive={currentStats.revenue >= previousStats.revenue}
            />
            <StatCard
              title="Người Dùng Mới (Tháng)"
              value={currentStats.num_of_user}
              change={`${(
                previousStats.num_of_user
                  ? ((currentStats.num_of_user - previousStats.num_of_user) / previousStats.num_of_user) * 100
                  : 0
              ).toFixed(1)}%`}
              isPositive={currentStats.num_of_user >= previousStats.num_of_user}
            />
            <StatCard
              title="Lượt Tương Tác (Tháng)"
              value={currentStats.num_of_interaction}
              change={`${(
                previousStats.num_of_interaction
                  ? ((currentStats.num_of_interaction - previousStats.num_of_interaction) / previousStats.num_of_interaction) * 100
                  : 0
              ).toFixed(1)}%`}
              isPositive={currentStats.num_of_interaction >= previousStats.num_of_interaction}
            />
            <StatCard
              title="Chi Tiêu TB (Khách)"
              value={`${currentStats.avg_cus_spend.toLocaleString("vi-VN")} VND`}
              change={`${(
                previousStats.avg_cus_spend
                  ? ((currentStats.avg_cus_spend - previousStats.avg_cus_spend) / previousStats.avg_cus_spend) * 100
                  : 0
              ).toFixed(1)}%`}
              isPositive={currentStats.avg_cus_spend >= previousStats.avg_cus_spend}
            />
          </div>
        </motion.div>

        {/* Separator */}
        <hr className="my-8 border-0 h-1 bg-gradient-to-r from-transparent via-purple-600 to-transparent" />

        {/* Charts */}
        <motion.div
          className="bg-zinc-900/95 rounded-lg p-6 border border-purple-700/50 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h2 className="text-xl font-semibold text-white mb-4">Biểu Đồ Thống Kê</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BarChart
              title="Top 5 Game Được Bình Luận Nhiều Nhất"
              data={{
                labels: currentStats.top_commented_games?.map((game) => game.name) || [],
                values: currentStats.top_commented_games?.map((game) => game.commentCount) || [],
                thumbnails: currentStats.top_commented_games?.map((game) => game.thumbnail_image || "https://placehold.co/40x40/3a1a5e/ffffff?text=No+Image") || [],
              }}
            />
            <BarChart
              title="Top 5 Game Bán Chạy Nhất"
              data={{
                labels: currentStats.top_purchased_games?.map((game) => game.name) || [],
                values: currentStats.top_purchased_games?.map((game) => game.purchaseCount) || [],
                thumbnails: currentStats.top_purchased_games?.map((game) => game.thumbnail_image || "https://placehold.co/40x40/3a1a5e/ffffff?text=No+Image") || [],
              }}
            />
          </div>
        </motion.div>

        {/* Separator */}
        <hr className="my-8 border-0 h-1 bg-gradient-to-r from-transparent via-purple-600 to-transparent" />

        {/* All Comments */}
        <motion.div
          className="bg-zinc-900/95 rounded-lg p-6 border border-purple-700/50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-white mb-4">Bình Luận Tháng Này ({currentStats.time})</h2>
          {currentStats.all_comments?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-white">
                <thead>
                  <tr className="bg-purple-800/30">
                    <th className="p-3">Tên Game</th>
                    <th className="p-3">Người Dùng</th>
                    <th className="p-3">Điểm Đánh Giá</th>
                    <th className="p-3">Bình Luận</th>
                    <th className="p-3">Ngày</th>
                  </tr>
                </thead>
                <tbody>
                  {currentStats.all_comments.map((comment, idx) => {
                    // Fetch game name (assuming game data is available in top_purchased_games or top_commented_games)
                    const game = [
                      ...currentStats.top_purchased_games,
                      ...currentStats.top_commented_games,
                    ].find((g) => g.id === comment.game_id);
                    const gameName = game ? game.name : comment.game_id;
                    const commentDate = comment.commented_date?.$date
                      ? new Date(comment.commented_date.$date)
                      : new Date(comment.commented_date);

                    return (
                      <tr
                        key={idx}
                        className="border-b border-purple-500/20 hover:bg-purple-700/20"
                      >
                        <td className="p-3">{gameName}</td>
                        <td className="p-3">{comment.user_id}</td>
                        <td className="p-3">{comment.rating}</td>
                        <td className="p-3">{comment.comment}</td>
                        <td className="p-3">
                          {isNaN(commentDate.getTime())
                            ? "N/A"
                            : commentDate.toLocaleDateString("vi-VN")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-purple-300">Không có bình luận nào trong tháng này.</p>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default AdminDashboard;