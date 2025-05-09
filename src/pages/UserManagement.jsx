import { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Button } from "../components/ui/button";
import { Edit, Trash2, Eye, Search } from "lucide-react";
import { getUsers, updateUser, createUser } from "../api/users";
import { uploadImagesToCloudinary } from "../api/cloudinary";
import { motion } from "framer-motion";
import { Input } from "../components/ui/input";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    id: "",
    f_name: "",
    l_name: "",
    username: "",
    dob: "",
    avatar: "",
    status: "active",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getUsers().then((data) =>
      setUsers(data.map((user) => ({ ...user, status: user.status || "active" })))
    );
  }, []);

  const validateInputs = (data) => {
    const newErrors = {};
    if (!data.f_name.trim()) newErrors.f_name = "Họ không được để trống";
    if (!data.l_name.trim()) newErrors.l_name = "Tên không được để trống";
    if (!data.username.trim()) newErrors.username = "Username không được để trống";
    if (data.dob && isNaN(new Date(data.dob).getTime())) newErrors.dob = "Ngày sinh không hợp lệ";
    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleClearAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview("");
    setFormData({ ...formData, avatar: "" });
  };

  const handleClearForm = () => {
    if (window.confirm("Bạn có chắc muốn xóa trắng tất cả các trường?")) {
      setFormData({
        id: "",
        f_name: "",
        l_name: "",
        username: "",
        dob: "",
        avatar: "",
        status: "active",
      });
      setAvatarFile(null);
      setAvatarPreview("");
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    const validationErrors = validateInputs(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      alert("Vui lòng sửa các lỗi trước khi lưu!");
      return;
    }

    let avatarUrl = formData.avatar;
    if (avatarFile) {
      const uploadedUrls = await uploadImagesToCloudinary([avatarFile]);
      avatarUrl = uploadedUrls[0] || "https://res.cloudinary.com/dqnj8bsgu/image/upload/v1746630940/avatar_f6yerg.jpg";
    }

    const newUser = {
      ...formData,
      avatar: avatarUrl,
      dob: formData.dob ? { $date: new Date(formData.dob).toISOString() } : "",
      id: formData.id || String(users.length + 1),
      status: formData.status || "active",
    };

    try {
      if (formData.id) {
        await updateUser(formData.id, newUser);
        setUsers(users.map((u) => (u.id === formData.id ? newUser : u)));
      } else {
        const createdUser = await createUser(newUser);
        setUsers([...users, createdUser]);
      }
      handleClearForm();
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Lỗi khi lưu người dùng!");
    }
  };

  const handleEditUser = (user) => {
    setFormData({
      id: user.id,
      f_name: user.f_name,
      l_name: user.l_name,
      username: user.username,
      dob: user.dob?.$date ? new Date(user.dob.$date).toISOString().split("T")[0] : "",
      avatar: user.avatar || "",
      status: user.status || "active",
    });
    setAvatarPreview(user.avatar || "");
    setAvatarFile(null);
    setErrors({});
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa người dùng này?")) {
      try {
        const updatedUser = users.find((u) => u.id === id);
        updatedUser.status = "deleted";
        await updateUser(id, updatedUser);
        setUsers(users.map((u) => (u.id === id ? updatedUser : u)));
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Lỗi khi xóa người dùng!");
      }
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users
    .filter((u) => (showDeleted ? u.status === "deleted" : u.status !== "deleted"))
    .filter((u) => {
      const fullName = `${u.f_name} ${u.l_name}`.toLowerCase();
      const username = u.username.toLowerCase();
      const search = searchTerm.toLowerCase();
      return fullName.includes(search) || username.includes(search);
    });

  const columns = [
    {
      name: "Avatar",
      cell: (row) => (
        <img
          src={
            row.avatar ||
            "https://res.cloudinary.com/dqnj8bsgu/image/upload/v1746561931/default_avatar.jpg"
          }
          alt={`${row.f_name} ${row.l_name}`}
          className="w-10 h-10 rounded-full object-cover"
        />
      ),
      width: "80px",
    },
    {
      name: "Họ Tên",
      selector: (row) => `${row.f_name} ${row.l_name}`,
      sortable: true,
      cell: (row) => <span className="text-white">{`${row.f_name} ${row.l_name}`}</span>,
    },
    {
      name: "Username",
      selector: (row) => row.username,
      sortable: true,
      cell: (row) => <span className="text-white">{row.username}</span>,
    },
    {
      name: "Ngày Sinh",
      selector: (row) =>
        row.dob?.$date ? new Date(row.dob.$date).toLocaleDateString("vi-VN") : "N/A",
      sortable: true,
      cell: (row) => (
        <span className="text-white">
          {row.dob?.$date ? new Date(row.dob.$date).toLocaleDateString("vi-VN") : "N/A"}
        </span>
      ),
    },
    {
      name: "Trạng Thái",
      cell: (row) => (
        <span
          className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
            row.status === "active"
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-red-500/20 text-red-400 border border-red-500/30"
          }`}
        >
          {row.status === "active" ? "Hoạt Động" : "Đã Xóa"}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Hành Động",
      cell: (row) => (
        <div className="flex gap-2">
          <Button
            onClick={() => handleEditUser(row)}
            variant="ghost"
            className="h-8 w-8 rounded-full bg-purple-800/50 hover:bg-blue-600/70 text-white"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => handleDeleteUser(row.id)}
            variant="ghost"
            className="h-8 w-8 rounded-full bg-purple-800/50 hover:bg-red-600/70 text-white"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
      width: "120px",
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
          backgroundColor: "hsl(266, 46%, 15%)",
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

  return (
    <div className="container mx-auto">
      <motion.div
        className="bg-zinc-900/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-purple-800/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-2 mb-6">
          <h1 className="text-3xl font-bold text-white">Quản Lý Người Dùng</h1>
        </div>

        {/* Form Thêm/Sửa Người Dùng */}
        <motion.div
          className="bg-zinc-900/95 rounded-lg p-6 border border-purple-700/50 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-white mb-4">
            {formData.id ? "Sửa Người Dùng" : "Thêm Người Dùng Mới"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                type="text"
                name="f_name"
                placeholder="Họ"
                value={formData.f_name}
                onChange={handleInputChange}
                className={`bg-purple-800/80 border-purple-700/50 text-white rounded-lg ${errors.f_name ? "border-red-500" : ""}`}
              />
              {errors.f_name && <p className="text-red-500 text-sm mt-1">{errors.f_name}</p>}
            </div>
            <div>
              <Input
                type="text"
                name="l_name"
                placeholder="Tên"
                value={formData.l_name}
                onChange={handleInputChange}
                className={`bg-purple-800/80 border-purple-700/50 text-white rounded-lg ${errors.l_name ? "border-red-500" : ""}`}
              />
              {errors.l_name && <p className="text-red-500 text-sm mt-1">{errors.l_name}</p>}
            </div>
            <div>
              <Input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleInputChange}
                className={`bg-purple-800/80 border-purple-700/50 text-white rounded-lg ${errors.username ? "border-red-500" : ""}`}
              />
              {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
            </div>
            <div>
              <Input
                type="date"
                name="dob"
                placeholder="Ngày sinh"
                value={formData.dob}
                onChange={handleInputChange}
                className={`bg-purple-800/80 border-purple-700/50 text-white rounded-lg ${errors.dob ? "border-red-500" : ""}`}
              />
              {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
            </div>
            <div className="col-span-2">
              <label className="text-white mb-2 block">Tải lên ảnh Avatar</label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="bg-purple-800/80 border-purple-700/50 text-white rounded-lg w-full"
              />
              {avatarPreview && (
                <div className="mt-4 relative w-20 h-20">
                  <img
                    src={avatarPreview}
                    alt="Avatar Preview"
                    className="w-full h-full rounded-full object-cover"
                  />
                  <Button
                    onClick={handleClearAvatar}
                    className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white w-6 h-6 rounded-full p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
            <div>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="bg-purple-800/80 border-purple-700/50 text-white rounded-lg w-full p-2"
              >
                <option value="active">Hoạt Động</option>
                <option value="deleted">Đã Xóa</option>
              </select>
            </div>
          </div>
          <div className="flex gap-4 mt-4">
            <Button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-lg"
            >
              {formData.id ? "Cập Nhật" : "Thêm"}
            </Button>
            <Button
              onClick={handleClearForm}
              className="bg-purple-800/80 hover:bg-purple-700 text-white rounded-lg"
            >
              Xóa Trắng
            </Button>
          </div>
        </motion.div>

        {/* Separator */}
        <hr className="my-8 border-0 h-1 bg-gradient-to-r from-transparent via-purple-600 to-transparent" />

        {/* Danh sách Người Dùng */}
        <motion.div
          className="bg-zinc-900/90 rounded-lg p-6 border border-purple-700/50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">
              {showDeleted ? "Danh Sách Tài Khoản Đã Xóa" : "Danh Sách Người Dùng"}
            </h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Tìm theo tên hoặc username"
                  value={searchTerm}
                  onChange={handleSearch}
                  className="bg-purple-800/80 border-purple-700/50 text-white rounded-lg pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
              </div>
              <Button
                onClick={() => setShowDeleted(!showDeleted)}
                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-lg"
              >
                <Eye className="w-4 h-4 mr-2" />
                {showDeleted ? "Xem Tài Khoản Hoạt Động" : "Xem Tài Khoản Đã Xóa"}
              </Button>
            </div>
          </div>
          <DataTable
            columns={columns}
            data={filteredUsers}
            customStyles={customStyles}
            pagination
            paginationPerPage={10}
            highlightOnHover
            pointerOnHover
            noDataComponent={<span className="text-white py-4">Không có người dùng nào</span>}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default UserManagement;