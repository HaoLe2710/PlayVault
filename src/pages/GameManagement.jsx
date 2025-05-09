import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { Trash2, Edit, Heart } from "lucide-react";
import { getGames, addGame, updateGame, deleteGame } from "../api/games";
import { uploadImagesToCloudinary } from "../api/cloudinary";
import DataTable from "react-data-table-component";
import { motion } from "framer-motion";
import { Input } from "../components/ui/input";

function GameManagement() {
  const [games, setGames] = useState([]);
  const [newGame, setNewGame] = useState({
    name: "",
    price: "",
    tags: [],
    details: { publisher: "", describe: "", "age-limit": "" },
    images: [],
    thumbnail_image: "",
    minimum_configuration: { os: "", cpu: "", ram: "", gpu: "", disk: "" },
    recommended_configuration: { os: "", cpu: "", ram: "", gpu: "", disk: "" },
  });
  const [editingGame, setEditingGame] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const data = await getGames();
      setGames(data.games || data);
    } catch (error) {
      console.error("Error fetching games:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateInputs = (game) => {
    const newErrors = {};
    if (!game.name.trim()) newErrors.name = "Tên game không được để trống";
    if (!game.price || isNaN(game.price) || Number(game.price) < 0) newErrors.price = "Giá phải là số không âm";
    if (!game.details.publisher.trim()) newErrors.publisher = "Nhà phát hành không được để trống";
    if (!game.tags.length || game.tags.every(tag => !tag.trim())) newErrors.tags = "Phải có ít nhất một tag hợp lệ";
    if (!game.details.describe.trim()) newErrors.describe = "Mô tả không được để trống";
    if (!game.minimum_configuration.os.trim()) newErrors.min_os = "OS tối thiểu không được để trống";
    if (!game.minimum_configuration.cpu.trim()) newErrors.min_cpu = "CPU tối thiểu không được để trống";
    if (!game.minimum_configuration.ram.trim()) newErrors.min_ram = "RAM tối thiểu không được để trống";
    if (!game.minimum_configuration.gpu.trim()) newErrors.min_gpu = "GPU tối thiểu không được để trống";
    if (!game.minimum_configuration.disk.trim()) newErrors.min_disk = "Disk tối thiểu không được để trống";
    if (!game.recommended_configuration.os.trim()) newErrors.rec_os = "OS đề nghị không được để trống";
    if (!game.recommended_configuration.cpu.trim()) newErrors.rec_cpu = "CPU đề nghị không được để trống";
    if (!game.recommended_configuration.ram.trim()) newErrors.rec_ram = "RAM đề nghị không được để trống";
    if (!game.recommended_configuration.gpu.trim()) newErrors.rec_gpu = "GPU đề nghị không được để trống";
    if (!game.recommended_configuration.disk.trim()) newErrors.rec_disk = "Disk đề nghị không được để trống";
    return newErrors;
  };

  const setDefaultConfiguration = () => {
    const defaultConfig = {
      minimum_configuration: {
        os: "Windows 10",
        cpu: "Intel i5",
        ram: "8GB",
        gpu: "NVIDIA GTX 970",
        disk: "50GB",
      },
      recommended_configuration: {
        os: "Windows 11",
        cpu: "Intel i7",
        ram: "16GB",
        gpu: "NVIDIA RTX 3060",
        disk: "100GB",
      },
    };
    if (editingGame) {
      setEditingGame((prev) => ({ ...prev, ...defaultConfig }));
    } else {
      setNewGame((prev) => ({ ...prev, ...defaultConfig }));
    }
    setErrors({});
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles((prev) => [...prev, ...files]);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...previews]);
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    if (editingGame) {
      setEditingGame((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
    } else {
      setNewGame((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview("");
    if (editingGame) {
      setEditingGame((prev) => ({ ...prev, thumbnail_image: "" }));
    } else {
      setNewGame((prev) => ({ ...prev, thumbnail_image: "" }));
    }
  };

  const clearAllFields = () => {
    if (window.confirm("Bạn có chắc muốn xóa trắng tất cả các trường?")) {
      setNewGame({
        name: "",
        price: "",
        tags: [],
        details: { publisher: "", describe: "", "age-limit": "" },
        images: [],
        thumbnail_image: "",
        minimum_configuration: { os: "", cpu: "", ram: "", gpu: "", disk: "" },
        recommended_configuration: { os: "", cpu: "", ram: "", gpu: "", disk: "" },
      });
      setEditingGame(null);
      setImageFiles([]);
      setImagePreviews([]);
      setThumbnailFile(null);
      setThumbnailPreview("");
      setErrors({});
    }
  };

  const handleAddGame = async () => {
    const gameToValidate = {
      ...newGame,
      price: newGame.price.trim() ? Number(newGame.price) : "",
      tags: newGame.tags.filter(tag => tag.trim()),
    };
    const validationErrors = validateInputs(gameToValidate);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      alert("Vui lòng sửa các lỗi trước khi thêm game!");
      return;
    }

    let uploadedImageUrls = newGame.images;
    let uploadedThumbnailUrl = newGame.thumbnail_image;

    if (imageFiles.length > 0) {
      uploadedImageUrls = await uploadImagesToCloudinary(imageFiles);
    }
    if (thumbnailFile) {
      uploadedThumbnailUrl = (await uploadImagesToCloudinary([thumbnailFile]))[0];
    }

    const gameToAdd = {
      ...newGame,
      price: Number(newGame.price),
      images: uploadedImageUrls,
      thumbnail_image: uploadedThumbnailUrl,
      tags: newGame.tags.filter(tag => tag.trim()),
    };
    try {
      await addGame(gameToAdd);
      await fetchGames();
      clearAllFields();
    } catch (error) {
      console.error("Error adding game:", error);
      alert("Lỗi khi thêm game!");
    }
  };

  const handleEditGame = (game) => {
    setEditingGame({
      ...game,
      price: game.price.toString(),
    });
    setImagePreviews(game.images || []);
    setImageFiles([]);
    setThumbnailPreview(game.thumbnail_image || "");
    setThumbnailFile(null);
    setErrors({});
  };

  const handleUpdateGame = async () => {
    if (!editingGame) return;

    const gameToValidate = {
      ...editingGame,
      price: editingGame.price.trim() ? Number(editingGame.price) : "",
      tags: editingGame.tags.filter(tag => tag.trim()),
    };
    const validationErrors = validateInputs(gameToValidate);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      alert("Vui lòng sửa các lỗi trước khi cập nhật game!");
      return;
    }

    let updatedImageUrls = editingGame.images;
    let updatedThumbnailUrl = editingGame.thumbnail_image;

    if (imageFiles.length > 0) {
      const newImageUrls = await uploadImagesToCloudinary(imageFiles);
      updatedImageUrls = [...editingGame.images, ...newImageUrls];
    }
    if (thumbnailFile) {
      updatedThumbnailUrl = (await uploadImagesToCloudinary([thumbnailFile]))[0];
    }

    const updatedGame = {
      ...editingGame,
      price: Number(editingGame.price),
      images: updatedImageUrls,
      thumbnail_image: updatedThumbnailUrl,
      tags: editingGame.tags.filter(tag => tag.trim()),
    };
    try {
      await updateGame(editingGame.id, updatedGame);
      await fetchGames();
      setEditingGame(null);
      setImageFiles([]);
      setImagePreviews([]);
      setThumbnailFile(null);
      setThumbnailPreview("");
      setErrors({});
    } catch (error) {
      console.error("Error updating game:", error);
      alert("Lỗi khi cập nhật game!");
    }
  };

  const handleDeleteGame = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa game này?")) {
      try {
        await deleteGame(id);
        await fetchGames();
      } catch (error) {
        console.error("Error deleting game:", error);
        alert("Lỗi khi xóa game!");
      }
    }
  };

  const columns = [
    {
      name: "Tên",
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => <span className="text-white">{row.name}</span>,
    },
    {
      name: "Giá",
      selector: (row) => row.price,
      sortable: true,
      cell: (row) => (
        <span className="text-white">{row.price.toLocaleString("vi-VN")} VND</span>
      ),
    },
    {
      name: "Tags",
      selector: (row) => row.tags.join(", "),
      cell: (row) => <span className="text-white">{row.tags.join(", ")}</span>,
    },
    {
      name: "Nhà Phát Hành",
      selector: (row) => row.details.publisher,
      cell: (row) => <span className="text-white">{row.details.publisher}</span>,
    },
    {
      name: "Thumbnail",
      cell: (row) => (
        <img
          src={row.thumbnail_image || "https://placehold.co/50x50/3a1a5e/ffffff?text=No+Image"}
          alt={`Thumbnail ${row.name}`}
          className="w-12 h-12 object-cover rounded-md"
        />
      ),
    },
    {
      name: "Hành Động",
      cell: (row) => (
        <div className="flex gap-2">
          <Button
            onClick={() => handleEditGame(row)}
            variant="ghost"
            className="h-8 w-8 rounded-full bg-purple-800/50 hover:bg-blue-600/70 text-white"
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => handleDeleteGame(row.id)}
            variant="ghost"
            className="h-8 w-8 rounded-full bg-purple-800/50 hover:bg-red-600/70 text-white"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
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
          backgroundColor: "hsl(266, 46%, 15%)",
        },
      },
    },
    pagination: {
      style: {
        backgroundColor: "hsl(266, 46%, 15%)",
        color: "#ffffff",
        border_top: "1px solid hsl(266, 46%, 20%)",
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
          <Heart className="h-6 w-6 text-red-500 fill-red-500" />
          <h1 className="text-3xl font-bold text-white">Quản Lý Game</h1>
        </div>

        {/* Form Thêm/Sửa Game */}
        <motion.div
          className="bg-zinc-900/95 rounded-lg p-6 border border-purple-700/50 mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h2 className="text-xl font-semibold text-white mb-4">
            {editingGame ? "Sửa Game" : "Thêm Game Mới"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                type="text"
                placeholder="Tên game"
                value={editingGame ? editingGame.name : newGame.name}
                onChange={(e) =>
                  editingGame
                    ? setEditingGame({ ...editingGame, name: e.target.value })
                    : setNewGame({ ...newGame, name: e.target.value })
                }
                className={`bg-purple-800/80 border-purple-700/50 text-white rounded-lg ${errors.name ? "border-red-500" : ""}`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <Input
                type="text"
                placeholder="Giá (VND)"
                value={editingGame ? editingGame.price : newGame.price}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "");
                  editingGame
                    ? setEditingGame({ ...editingGame, price: value })
                    : setNewGame({ ...newGame, price: value });
                }}
                className={`bg-purple-800/80 border-purple-700/50 text-white rounded-lg ${errors.price ? "border-red-500" : ""}`}
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>
            <div>
              <Input
                type="text"
                placeholder="Tags (cách nhau bằng dấu phẩy)"
                value={editingGame ? editingGame.tags.join(",") : newGame.tags.join(",")}
                onChange={(e) => {
                  const tags = e.target.value.split(",").map((tag) => tag.trim());
                  editingGame
                    ? setEditingGame({ ...editingGame, tags })
                    : setNewGame({ ...newGame, tags });
                }}
                className={`bg-purple-800/80 border-purple-700/50 text-white rounded-lg ${errors.tags ? "border-red-500" : ""}`}
              />
              {errors.tags && <p className="text-red-500 text-sm mt-1">{errors.tags}</p>}
            </div>
            <div>
              <Input
                type="text"
                placeholder="Nhà phát hành"
                value={editingGame ? editingGame.details.publisher : newGame.details.publisher}
                onChange={(e) =>
                  editingGame
                    ? setEditingGame({
                        ...editingGame,
                        details: { ...editingGame.details, publisher: e.target.value },
                      })
                    : setNewGame({
                        ...newGame,
                        details: { ...newGame.details, publisher: e.target.value },
                      })
                }
                className={`bg-purple-800/80 border-purple-700/50 text-white rounded-lg ${errors.publisher ? "border-red-500" : ""}`}
              />
              {errors.publisher && <p className="text-red-500 text-sm mt-1">{errors.publisher}</p>}
            </div>
            <div className="col-span-2">
              <label className="text-white mb-2 block">Mô tả game</label>
              <textarea
                placeholder="Mô tả game"
                value={editingGame ? editingGame.details.describe : newGame.details.describe}
                onChange={(e) =>
                  editingGame
                    ? setEditingGame({
                        ...editingGame,
                        details: { ...editingGame.details, describe: e.target.value },
                      })
                    : setNewGame({
                        ...newGame,
                        details: { ...newGame.details, describe: e.target.value },
                      })
                }
                className={`bg-purple-800/80 border industriali-700/50 text-white rounded-lg w-full p-2 ${errors.describe ? "border-red-500" : ""}`}
                rows="4"
              />
              {errors.describe && <p className="text-red-500 text-sm mt-1">{errors.describe}</p>}
            </div>
            {/* Configuration Inputs */}
            <div className="col-span-2">
              <h3 className="text-white mb-2">Cấu Hình Tối Thiểu</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    type="text"
                    placeholder="OS"
                    value={editingGame ? editingGame.minimum_configuration.os : newGame.minimum_configuration.os}
                    onChange={(e) =>
                      editingGame
                        ? setEditingGame({
                            ...editingGame,
                            minimum_configuration: { ...editingGame.minimum_configuration, os: e.target.value },
                          })
                        : setNewGame({
                            ...newGame,
                            minimum_configuration: { ...newGame.minimum_configuration, os: e.target.value },
                          })
                    }
                    className={`bg-purple-800/80 border-purple-700/50 text-white rounded-lg ${errors.min_os ? "border-red-500" : ""}`}
                  />
                  {errors.min_os && <p className="text-red-500 text-sm mt-1">{errors.min_os}</p>}
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder="CPU"
                    value={editingGame ? editingGame.minimum_configuration.cpu : newGame.minimum_configuration.cpu}
                    onChange={(e) =>
                      editingGame
                        ? setEditingGame({
                            ...editingGame,
                            minimum_configuration: { ...editingGame.minimum_configuration, cpu: e.target.value },
                          })
                        : setNewGame({
                            ...newGame,
                            minimum_configuration: { ...newGame.minimum_configuration, cpu: e.target.value },
                          })
                    }
                    className={`bg-purple-800/80 border-purple-700/50 text-white rounded-lg ${errors.min_cpu ? "border-red-500" : ""}`}
                  />
                  {errors.min_cpu && <p className="text-red-500 text-sm mt-1">{errors.min_cpu}</p>}
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder="RAM"
                    value={editingGame ? editingGame.minimum_configuration.ram : newGame.minimum_configuration.ram}
                    onChange={(e) =>
                      editingGame
                        ? setEditingGame({
                            ...editingGame,
                            minimum_configuration: { ...editingGame.minimum_configuration, ram: e.target.value },
                          })
                        : setNewGame({
                            ...newGame,
                            minimum_configuration: { ...newGame.minimum_configuration, ram: e.target.value },
                          })
                    }
                    className={`bg-purple-800/80 border-purple-700/50 text-white rounded-lg ${errors.min_ram ? "border-red-500" : ""}`}
                  />
                  {errors.min_ram && <p className="text-red-500 text-sm mt-1">{errors.min_ram}</p>}
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder="GPU"
                    value={editingGame ? editingGame.minimum_configuration.gpu : newGame.minimum_configuration.gpu}
                    onChange={(e) =>
                      editingGame
                        ? setEditingGame({
                            ...editingGame,
                            minimum_configuration: { ...editingGame.minimum_configuration, gpu: e.target.value },
                          })
                        : setNewGame({
                            ...newGame,
                            minimum_configuration: { ...newGame.minimum_configuration, gpu: e.target.value },
                          })
                    }
                    className={`bg-purple-800/80 border-purple-700/50 text-white rounded-lg ${errors.min_gpu ? "border-red-500" : ""}`}
                  />
                  {errors.min_gpu && <p className="text-red-500 text-sm mt-1">{errors.min_gpu}</p>}
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder="Disk"
                    value={editingGame ? editingGame.minimum_configuration.disk : newGame.minimum_configuration.disk}
                    onChange={(e) =>
                      editingGame
                        ? setEditingGame({
                            ...editingGame,
                            minimum_configuration: { ...editingGame.minimum_configuration, disk: e.target.value },
                          })
                        : setNewGame({
                            ...newGame,
                            minimum_configuration: { ...newGame.minimum_configuration, disk: e.target.value },
                          })
                    }
                    className={`bg-purple-800/80 border-purple-700/50 text-white rounded-lg ${errors.min_disk ? "border-red-500" : ""}`}
                  />
                  {errors.min_disk && <p className="text-red-500 text-sm mt-1">{errors.min_disk}</p>}
                </div>
              </div>
              <h3 className="text-white mt-4 mb-2">Cấu Hình Đề Nghị</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Input
                    type="text"
                    placeholder="OS"
                    value={editingGame ? editingGame.recommended_configuration.os : newGame.recommended_configuration.os}
                    onChange={(e) =>
                      editingGame
                        ? setEditingGame({
                            ...editingGame,
                            recommended_configuration: { ...editingGame.recommended_configuration, os: e.target.value },
                          })
                        : setNewGame({
                            ...newGame,
                            recommended_configuration: { ...newGame.recommended_configuration, os: e.target.value },
                          })
                    }
                    className={`bg-purple-800/80 border-purple-700/50 text-white rounded-lg ${errors.rec_os ? "border-red-500" : ""}`}
                  />
                  {errors.rec_os && <p className="text-red-500 text-sm mt-1">{errors.rec_os}</p>}
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder="CPU"
                    value={editingGame ? editingGame.recommended_configuration.cpu : newGame.recommended_configuration.cpu}
                    onChange={(e) =>
                      editingGame
                        ? setEditingGame({
                            ...editingGame,
                            recommended_configuration: { ...editingGame.recommended_configuration, cpu: e.target.value },
                          })
                        : setNewGame({
                            ...newGame,
                            recommended_configuration: { ...newGame.recommended_configuration, cpu: e.target.value },
                          })
                    }
                    className={`bg-purple-800/80 border-purple-700/50 text-white rounded-lg ${errors.rec_cpu ? "border-red-500" : ""}`}
                  />
                  {errors.rec_cpu && <p className="text-red-500 text-sm mt-1">{errors.rec_cpu}</p>}
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder="RAM"
                    value={editingGame ? editingGame.recommended_configuration.ram : newGame.recommended_configuration.ram}
                    onChange={(e) =>
                      editingGame
                        ? setEditingGame({
                            ...editingGame,
                            recommended_configuration: { ...editingGame.recommended_configuration, ram: e.target.value },
                          })
                        : setNewGame({
                            ...newGame,
                            recommended_configuration: { ...newGame.recommended_configuration, ram: e.target.value },
                          })
                    }
                    className={`bg-purple-800/80 border-purple-700/50 text-white rounded-lg ${errors.rec_ram ? "border-red-500" : ""}`}
                  />
                  {errors.rec_ram && <p className="text-red-500 text-sm mt-1">{errors.rec_ram}</p>}
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder="GPU"
                    value={editingGame ? editingGame.recommended_configuration.gpu : newGame.recommended_configuration.gpu}
                    onChange={(e) =>
                      editingGame
                        ? setEditingGame({
                            ...editingGame,
                            recommended_configuration: { ...editingGame.recommended_configuration, gpu: e.target.value },
                          })
                        : setNewGame({
                            ...newGame,
                            recommended_configuration: { ...newGame.recommended_configuration, gpu: e.target.value },
                          })
                    }
                    className={`bg-purple-800/80 border-purple-700/50 text-white rounded-lg ${errors.rec_gpu ? "border-red-500" : ""}`}
                  />
                  {errors.rec_gpu && <p className="text-red-500 text-sm mt-1">{errors.rec_gpu}</p>}
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder="Disk"
                    value={editingGame ? editingGame.recommended_configuration.disk : newGame.recommended_configuration.disk}
                    onChange={(e) =>
                      editingGame
                        ? setEditingGame({
                            ...editingGame,
                            recommended_configuration: { ...editingGame.recommended_configuration, disk: e.target.value },
                          })
                        : setNewGame({
                            ...newGame,
                            recommended_configuration: { ...newGame.recommended_configuration, disk: e.target.value },
                          })
                    }
                    className={`bg-purple-800/80 border-purple-700/50 text-white rounded-lg ${errors.rec_disk ? "border-red-500" : ""}`}
                  />
                  {errors.rec_disk && <p className="text-red-500 text-sm mt-1">{errors.rec_disk}</p>}
                </div>
              </div>
              <Button
                onClick={setDefaultConfiguration}
                className="mt-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-lg"
              >
                Đặt Cấu Hình Mặc Định
              </Button>
            </div>
            {/* Thumbnail Upload */}
            <div className="col-span-2 mt-4">
              <label className="text-white mb-2 block">Tải lên ảnh Thumbnail (chỉ 1 ảnh)</label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="bg-purple-800/80 border-purple-700/50 text-white rounded-lg w-full"
              />
              {thumbnailPreview && (
                <div className="mt-4 relative w-32 h-32">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail Preview"
                    className="w-full h-full object-cover rounded-md"
                  />
                  <Button
                    onClick={removeThumbnail}
                    className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white w-6 h-6 rounded-full p-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
            {/* Images Upload */}
            <div className="col-span-2 mt-4">
              <label className="text-white mb-2 block">Tải lên hình ảnh game</label>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageChange}
                className="bg-purple-800/80 border-purple-700/50 text-white rounded-lg w-full"
              />
              <div className="mt-4 grid grid-cols-4 gap-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Xem trước ${index}`}
                      className="w-full h-24 object-cover rounded-md"
                    />
                    <Button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white w-6 h-6 rounded-full p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              onClick={editingGame ? handleUpdateGame : handleAddGame}
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-lg"
            >
              {editingGame ? "Cập Nhật" : "Thêm Game"}
            </Button>
            <Button
              onClick={clearAllFields}
              className="bg-purple-800/80 hover:bg-purple-700 text-white rounded-lg"
            >
              Xóa Trắng Tất Cả
            </Button>
          </div>
        </motion.div>

        {/* Separator */}
        <hr className="my-8 border-0 h-1 bg-gradient-to-r from-transparent via-purple-600 to-transparent" />

        {/* Danh sách Game */}
        <motion.div
          className="bg-zinc-900/90 rounded-lg p-6 border border-purple-700/50"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <h2 className="text-xl font-semibold text-white mb-4">Danh Sách Game</h2>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-purple-300 animate-pulse">Đang tải dữ liệu...</div>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={games}
              pagination
              paginationPerPage={10}
              customStyles={customStyles}
              noDataComponent={<span className="text-white py-4">Không có game nào</span>}
            />
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

export default GameManagement;