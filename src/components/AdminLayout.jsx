import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Home, Gamepad2, Users, LogOut } from "lucide-react";
import icon from "../assets/icon.png"; // Import hình ảnh icon.png
import { useState, useEffect } from "react";

function AdminLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Load user from localStorage or sessionStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  // Get user initials
  const getUserInitials = (user) => {
    if (!user) return "";
    return `${user.f_name?.charAt(0) || ""}${user.l_name?.charAt(0) || ""}`.toUpperCase();
  };

  const menuItems = [
    { id: "dashboard", icon: Home, label: "Dashboard", path: "/admin" },
    { id: "games", icon: Gamepad2, label: "Quản lý Game", path: "/admin/games" },
    { id: "users", icon: Users, label: "Quản lý Người dùng", path: "/admin/users" },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-20 bg-gradient-to-b from-purple-950 to-indigo-950 flex flex-col items-center py-8 fixed top-0 left-0 h-screen z-10 shadow-xl border-r border-purple-800/30">
        <div className="mb-10">
          <div className="w-10 h-10 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
            <img
              src={icon}
              alt="Admin Logo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col items-center space-y-8 mt-4">
          {menuItems.map((item) => (
            <NavItem
              key={item.id}
              to={item.path}
              icon={<item.icon className="w-6 h-6" />}
              label={item.label}
              isLink
            />
          ))}
        </div>

        <div className="mt-auto mb-8 flex flex-col items-center space-y-4">
          <NavItem
            icon={<LogOut className="w-6 h-6" />}
            label="Đăng xuất"
            onClick={handleLogout}
            isLink={false}
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 ml-20">
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({ to, icon, label, isLink = true, onClick }) {
  return (
    <div className="relative group">
      {isLink ? (
        <NavLink
          to={to}
          className={({ isActive }) =>
            `block w-12 h-12 rounded-xl flex items-center justify-center ${
              isActive
                ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white"
                : "text-purple-300 bg-purple-900/20"
            }`
          }
        >
          {icon}
        </NavLink>
      ) : (
        <button
          onClick={onClick}
          className="block w-12 h-12 rounded-xl flex items-center justify-center text-purple-300 bg-purple-900/20 hover:bg-gradient-to-r hover:from-pink-600 hover:to-purple-600 hover:text-white"
        >
          {icon}
        </button>
      )}

      <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm py-1 px-3 rounded-md whitespace-nowrap z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
        {label}
      </div>
    </div>
  );
}

export default AdminLayout;