import { Routes, Route } from "react-router-dom"
import AdminLayout from "./components/AdminLayout"
import AdminDashboard from "./pages/AdminDashboard"
import FeedbackManagement from "./pages/FeedbackManagement"
import GameManagement from "./pages/GameManagement"
import UserManagement from "./pages/UserManagement"

function HomePage() {
  return (
    <div className="container mx-auto text-white text-center mt-10">
      <h1 className="text-4xl font-bold mb-4">Chào mừng đến với Game Store</h1>
      <p className="text-lg">Truy cập <a href="/admin" className="text-purple-400 underline">Trang Admin</a> để quản lý hệ thống.</p>
    </div>
  )
}

function NotFoundPage() {
  return (
    <div className="container mx-auto text-white text-center mt-10">
      <h1 className="text-4xl font-bold mb-4">404 - Trang không tìm thấy</h1>
      <p className="text-lg">Đường dẫn bạn truy cập không tồn tại. Quay lại <a href="/admin" className="text-purple-400 underline">Trang Admin</a>.</p>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/feedback" element={<FeedbackManagement />} />
        <Route path="/admin/games" element={<GameManagement />} />
        <Route path="/admin/users" element={<UserManagement />} />
      </Route>
      {/* Trang mặc định cho "/" */}
      <Route path="/" element={<HomePage />} />
      {/* Trang 404 cho các đường dẫn không hợp lệ */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App