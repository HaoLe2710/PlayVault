import { useEffect, useState } from "react";
import StatCard from "../components/StatCard";
import BarChart from "../components/BarChart";
import {
  calculateCurrentStatistics,
  getPreviousStatistics,
  autoSaveStatistics,
} from "../api/statistic";
import { motion } from "framer-motion";
import DataTable from "react-data-table-component";
import { Input } from "../components/ui/input";
import { Search } from "lucide-react";

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
  const [commentSearchTerm, setCommentSearchTerm] = useState("");
  const [soldGamesSearchTerm, setSoldGamesSearchTerm] = useState("");

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

  const handleCommentSearch = (e) => {
    setCommentSearchTerm(e.target.value);
  };

  const handleSoldGamesSearch = (e) => {
    setSoldGamesSearchTerm(e.target.value);
  };

  const filteredComments = currentStats.all_comments.filter((comment) => {
    const search = commentSearchTerm.toLowerCase();
    return (
      comment.game_name.toLowerCase().includes(search) ||
      comment.username.toLowerCase().includes(search)
    );
  });

  const filteredSoldGames = currentStats.top_purchased_games.filter((game) => {
    const search = soldGamesSearchTerm.toLowerCase();
    return game.name.toLowerCase().includes(search);
  });

  const commentColumns = [
    {
      name: "Tên Game",
      selector: (row) => row.game_name,
      sortable: true,
      cell: (row) => <span className="text-white">{row.game_name}</span>,
    },
    {
      name: "Người Dùng",
      selector: (row) => row.username,
      sortable: true,
      cell: (row) => <span className="text-white">{row.username}</span>,
    },
    {
      name: "Điểm Đánh Giá",
      selector: (row) => row.rating,
      sortable: true,
      cell: (row) => <span className="text-white">{row.rating}</span>,
    },
    {
      name: "Bình Luận",
      selector: (row) => row.comment,
      cell: (row) => <span className="text-white">{row.comment}</span>,
    },
    {
      name: "Ngày",
      selector: (row) => row.commented_date,
      sortable: true,
      cell: (row) => {
        const commentDate = row.commented_date?.$date
          ? new Date(row.commented_date.$date)
          : new Date(row.commented_date);
        return (
          <span className="text-white">
            {isNaN(commentDate.getTime()) ? "N/A" : commentDate.toLocaleDateString("vi-VN")}
          </span>
        );
      },
    },
  ];

  const soldGamesColumns = [
    {
      name: "Tên Game",
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => <span className="text-white">{row.name}</span>,
    },
    {
      name: "Số Lượt Mua",
      selector: (row) => row.purchaseCount,
      sortable: true,
      cell: (row) => <span className="text-white">{row.purchaseCount}</span>,
    },
    {
      name: "Tổng Doanh Thu",
      selector: (row) => row.totalRevenue,
      sortable: true,
      cell: (row) => (
        <span className="text-white">{row.totalRevenue.toLocaleString("vi-VN")} VND</span>
      ),
    },
  ];

  const customStyles = {
    table: {
      style: {
        backgroundColor: "transparent",
        borderRadius: "8px",
        border: "1px solid hsl(266, 46%, 20%)",
        fontFamily: "Inter, sans-serif",
      },
    },
    tableWrapper: {
      style: {
        backgroundColor: "transparent",
        borderRadius: "8px",
      },
    },
    head: {
      style: {
        backgroundColor: "hsl(266, 46%, 15%)",
        borderBottom: "1px solid hsl(266, 46%, 20%)",
      },
    },
    headRow: {
      style: {
        backgroundColor: "transparent",
      },
    },
    headCells: {
      style: {
        color: "#ffffff",
        fontWeight: "600",
        fontSize: "16px",
        fontFamily: "Inter, sans-serif",
        padding: "12px",
      },
    },
    cells: {
      style: {
        color: "#ffffff",
        backgroundColor: "transparent",
        padding: "12px",
        borderTop: "1px solid hsl(266, 46%, 20%)",
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
      },
    },
    rows: {
      style: {
        backgroundColor: "hsl(266, 46%, 10%)",
        "&:hover": {
          backgroundColor: "hsl(266, 60%, 15%)", // Darker, richer purple on hover
        },
      },
    },
    pagination: {
      style: {
        backgroundColor: "hsl(266, 46%, 15%)",
        color: "#ffffff",
        borderTop: "1px solid hsl(266, 46%, 20%)",
        fontFamily: "Inter, sans-serif",
      },
      pageButtonsStyle: {
        color: "#ffffff",
        backgroundColor: "transparent",
        "&:hover:not(:disabled)": {
          backgroundColor: "hsl(266, 46%, 20%)",
        },
        "&:disabled": {
          color: "hsl(266, 46%, 50%)",
        },
      },
    },
  };

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
              dataType={"Lượt bình luận"}
              data={{
                labels: currentStats.top_commented_games?.map((game) => game.name) || [],
                values: currentStats.top_commented_games?.map((game) => game.commentCount) || [],
                thumbnails:
                  currentStats.top_commented_games?.map(
                    (game) => game.thumbnail_image || "https://placehold.co/40x40/3a1a5e/ffffff?text=No+Image"
                  ) || [],
              }}
            />
            <BarChart
              title="Top 5 Game Bán Chạy Nhất"
              dataType={"Lượt bán"}
              data={{
                labels: currentStats.top_purchased_games?.map((game) => game.name) || [],
                values: currentStats.top_purchased_games?.map((game) => game.purchaseCount) || [],
                thumbnails:
                  currentStats.top_purchased_games?.map(
                    (game) => game.thumbnail_image || "https://placehold.co/40x40/3a1a5e/ffffff?text=No+Image"
                  ) || [],
              }}
            />
          </div>
        </motion.div>

        {/* Separator */}
        <hr className="my-8 border-0 h-1 bg-gradient-to-r from-transparent via-purple-600 to-transparent" />

        {/* Sold Games Table */}
        <motion.div
          className="bg-zinc-900/95 rounded-lg p-6 border border-purple-700/50 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Game Đã Bán Trong Tháng ({currentStats.time})</h2>
            <div className="relative">
              <Input
                type="text"
                placeholder="Tìm theo tên game"
                value={soldGamesSearchTerm}
                onChange={handleSoldGamesSearch}
                className="bg-purple-800/80 border-purple-700/50 text-white rounded-lg pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
            </div>
          </div>
          <DataTable
            columns={soldGamesColumns}
            data={filteredSoldGames}
            customStyles={customStyles}
            pagination
            paginationPerPage={10}
            highlightOnHover
            pointerOnHover
            noDataComponent={<span className="text-white py-4">Không có game nào được bán trong tháng này</span>}
          />
        </motion.div>

        {/* Separator */}
        <hr className="my-8 border-0 h-1 bg-gradient-to-r from-transparent via-purple-600 to-transparent" />

        {/* Comments Table */}
        <motion.div
          className="bg-zinc-900/95 rounded-lg p-6 border border-purple-700/50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Bình Luận Tháng Này ({currentStats.time})</h2>
            <div className="relative">
              <Input
                type="text"
                placeholder="Tìm theo tên game hoặc người dùng"
                value={commentSearchTerm}
                onChange={handleCommentSearch}
                className="bg-purple-800/80 border-purple-700/50 text-white rounded-lg pl-10"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
            </div>
          </div>
          <DataTable
            columns={commentColumns}
            data={filteredComments}
            customStyles={customStyles}
            pagination
            paginationPerPage={10}
            highlightOnHover
            pointerOnHover
            noDataComponent={<span className="text-white py-4">Không có bình luận nào trong tháng này</span>}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default AdminDashboard;