import React from 'react';
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Home from './pages/Home.jsx';
import Sidebar from "../src/components/home/sidebar";
import Footer from "../src/components/home/footer";
import Navbar from "../src/components/home/navbar";
import UserProfiles from "./pages/UserProfiles.jsx";
import Bought from "./pages/Bought.jsx";
import Favorite from "./pages/Favorite.jsx";
import Login from "./pages/Login.jsx";
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import CartPage from './pages/CartPage.jsx';

// Layout component để bao bọc các trang với Sidebar, Navbar và Footer
function MainLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-purple-500 to-indigo-800 flex">
      {/* Sidebar cố định bên trái */}
      <div className="fixed top-0 left-0 h-full w-20 z-10">
        <Sidebar />
      </div>
      <div className="flex-1 ml-20 flex flex-col">
        {/* Navbar cố định ở trên cùng */}
        <div className="fixed top-0 left-20 right-0 z-20">
          <Navbar />
        </div>
        {/* Thêm padding-top để tránh nội dung bị che bởi Navbar */}
        <div className="container mx-auto p-4 flex-grow mt-24">
          <div className="bg-black/20 backdrop-blur-md rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-4 overflow-y-auto">
              <Outlet /> {/* Render các route con tại đây */}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route layout chính cho tất cả các trang trừ login */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Home />} /> {/* Placeholder, thay bằng component Products */}
          <Route path="/favorites" element={<Favorite />} />
          <Route path="/bought" element={<Bought />} />
          <Route path="/cart" element={<CartPage />} /> {/* Placeholder, thay bằng component Cart */}
          <Route path="/profile" element={<UserProfiles />} />
        </Route>
        {/* Route độc lập cho trang đăng nhập */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} /> {/* Route cho trang đăng ký */}
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/admindashboard' element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>

  );
}

export default App;