import { useState, useEffect, useRef } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Search, User, ShoppingCart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Load user from storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navItems = [
    { name: "Trang chủ", path: "/" },
    { name: "Sản phẩm", path: "/products" },
    { name: "Ưa thích", path: "/favorites" },
    { name: "Đã mua", path: "/bought" },
    { name: "Giỏ hàng", path: "/cart" },
  ];

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");
    setUser(null);
    setIsDropdownOpen(false);
    navigate('/login');
  };

  // Get user initials
  const getUserInitials = (user) => {
    if (!user) return "";
    return `${user.f_name?.charAt(0) || ""}${user.l_name?.charAt(0) || ""}`;
  };

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-900 to-indigo-900 shadow-lg">
      <div className="flex items-center space-x-8">
        {navItems.map((item, index) => (
          <Link
            to={item.path}
            key={index}
            className={`text-lg font-semibold relative ${location.pathname === item.path ? "text-white" : "text-purple-200"
              }`}
          >
            {item.name}
            {location.pathname === item.path && (
              <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-pink-500 to-purple-500"></span>
            )}
          </Link>
        ))}
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 w-5 h-5"
          />
          <input
            type="text"
            placeholder="Tìm kiếm trò chơi..."
            className="bg-black/40 text-white pl-12 pr-4 py-2.5 rounded-full w-64 focus:outline-none focus:ring-1 focus:ring-purple-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Link to="/cart" className="text-purple-200">
          <ShoppingCart className="w-6 h-6" />
        </Link>

        {user ? (
          <div className="relative" ref={dropdownRef}>
            <div
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-white text-lg font-semibold cursor-pointer"
              onClick={toggleDropdown}
              title={`${user.f_name} ${user.l_name}`}
            >
              {getUserInitials(user)}
            </div>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-purple-900/95 backdrop-blur-md border border-purple-700 rounded-lg shadow-xl z-50">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-white rounded-t-lg"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <div className="py-1">Hồ sơ cá nhân</div>
                </Link>
                <div className="w-full border-t border-purple-700/50"></div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-white rounded-b-lg"
                >
                  <div className="py-1 flex items-center">
                    <LogOut className="w-4 h-4 mr-2" />
                    Đăng xuất
                  </div>
                </button>
              </div>
            )}
          </div>
        ) : (
          <Button
            onClick={() => navigate('/login')}
            className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-5 py-2 rounded-full font-semibold"
          >
            <User className="w-5 h-5 mr-2" />
            Đăng nhập
          </Button>
        )}
      </div>
    </div>
  );
}