import { useState, useEffect, useRef } from "react";
import { Save, Upload, Camera, User, ShoppingCart } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUsers } from "../../api/users"; // Import users API

// Define the form schema with validation rules
const formSchema = z
    .object({
        name: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
        phone: z
            .string()
            .regex(/^[0-9]{10,11}$/, { message: "Số điện thoại phải có 10-11 chữ số" })
            .optional()
            .or(z.literal("")),
        email: z.string().email({ message: "Email không hợp lệ" }).optional().or(z.literal("")),
        gender: z.enum(["male", "female", "other"], {
            required_error: "Vui lòng chọn giới tính",
        }),
        birthDay: z.string().optional(),
        birthMonth: z.string().optional(),
        birthYear: z.string().optional(),
        address: z.string().optional().or(z.literal("")),
    })
    .refine(
        (data) => {
            if (data.birthDay || data.birthMonth || data.birthYear) {
                return data.birthDay && data.birthMonth && data.birthYear;
            }
            return true;
        },
        {
            message: "Vui lòng chọn đầy đủ ngày tháng năm sinh",
            path: ["birthDay"],
        },
    );

export default function UserProfile() {
    const [avatarUrl, setAvatarUrl] = useState("/placeholder.svg?height=200&width=200");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userOrders, setUserOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("profile");
    const fileInputRef = useRef(null);

    // Initialize the form
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            phone: "",
            email: "",
            gender: "male",
            birthDay: "",
            birthMonth: "",
            birthYear: "",
            address: "",
        },
    });

    // Load user data from API and storage on mount
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Lấy thông tin đăng nhập từ local/session storage
                const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
                if (storedUser) {
                    const userData = JSON.parse(storedUser);

                    // Nếu có userId, thử lấy thông tin chi tiết từ API
                    if (userData.id || userData._id) {
                        try {
                            const userId = userData.id || userData._id;
                            const users = await getUsers();
                            const userFromApi = users.find(user => user.id === userId || user._id === userId);

                            // Merge dữ liệu từ API với dữ liệu từ storage
                            if (userFromApi) {
                                userData.avatar = userFromApi.avatar || userData.avatar;
                                userData.email = userFromApi.email || userData.email;
                                userData.address = userFromApi.address || userData.address;
                                // Có thể bổ sung thêm các trường khác
                            }
                        } catch (apiError) {
                            console.warn("Could not fetch user data from API:", apiError);
                            // Tiếp tục với dữ liệu từ storage nếu API gặp lỗi
                        }
                    }

                    // Xử lý avatar URL
                    if (userData.avatar) {
                        setAvatarUrl(userData.avatar);
                    } else {
                        // Generate avatar từ initials nếu không có avatar
                        const fullName = `${userData.f_name || ""} ${userData.l_name || ""}`.trim();
                        if (fullName) {
                            setAvatarUrl(`https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=9333ea&color=ffffff&size=200`);
                        }
                    }

                    // Parse date of birth
                    let birthDay = "";
                    let birthMonth = "";
                    let birthYear = "";
                    if (userData.dob && userData.dob.$date) {
                        const date = new Date(userData.dob.$date);
                        if (!isNaN(date.getTime())) {
                            birthDay = date.getUTCDate().toString();
                            birthMonth = (date.getUTCMonth() + 1).toString();
                            birthYear = date.getUTCFullYear().toString();
                        }
                    }

                    // Reset form với dữ liệu mới
                    form.reset({
                        name: `${userData.f_name || ""} ${userData.l_name || ""}`.trim() || "Unknown",
                        phone: userData.phone || "",
                        email: userData.email || "",
                        gender: userData.gender || "male",
                        address: userData.address || "",
                        birthDay,
                        birthMonth,
                        birthYear,
                    });
                }
            } catch (error) {
                console.error("Error loading user data:", error);
                toast.error("Lỗi", {
                    description: "Không thể tải dữ liệu người dùng.",
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [form]);

    // Fetch order history when tab changes to orders
    useEffect(() => {
        if (activeTab === "orders") {
            fetchOrderHistory();
        }
    }, [activeTab]);

    // Fetch order history from API
    // Fetch order history from API
    const fetchOrderHistory = async () => {
        setOrdersLoading(true);
        try {
            // Lấy thông tin người dùng từ localStorage
            const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
            if (!storedUser) {
                throw new Error('Thông tin người dùng không tồn tại');
            }

            const userData = JSON.parse(storedUser);
            const userId = userData.id || userData._id;

            if (!userId) {
                throw new Error('ID người dùng không tồn tại');
            }

            // Fetch all data in parallel - Lấy song song cả games và đơn hàng
            const [gamesResponse, boughtResponse] = await Promise.all([
                fetch("http://localhost:3001/games").then(res => res.json()),
                fetch("http://localhost:3001/bought").then(res => res.json())
            ]);

            console.log("Dữ liệu đơn hàng:", boughtResponse);
            console.log("Dữ liệu games:", gamesResponse);

            // Tìm đơn hàng của người dùng
            const userBoughtItems = boughtResponse.filter(item =>
                item.user_id?.toString() === userId?.toString() ||
                item.user_id === Number(userId) ||
                item.userId === userId
            );

            console.log("Đơn hàng của người dùng:", userBoughtItems);

            if (!userBoughtItems || userBoughtItems.length === 0) {
                console.log("Không tìm thấy đơn hàng cho người dùng");
                setUserOrders([]);
                setOrdersLoading(false);
                return;
            }

            // Mảng chứa đơn hàng đã xử lý (mỗi game = 1 đơn hàng)
            let processedOrders = [];

            // Xử lý từng đơn hàng
            userBoughtItems.forEach((order, orderIndex) => {
                const orderDate = new Date(order.createdAt || order.date || Date.now()).toLocaleDateString("vi-VN");
                const baseOrderStatus = order.status || "Đã giao";

                // Kiểm tra cả bought_game_id và boughtGameId
                const bought_game_ids = order.bought_game_id || order.boughtGameId || [];

                if (!bought_game_ids || !Array.isArray(bought_game_ids) || bought_game_ids.length === 0) {
                    // Xử lý đơn hàng có một game
                    const gameId = order.gameId || order.game_id;
                    if (gameId) {
                        const game = gamesResponse.find(g => {
                            const gId = g.id.toString();
                            const oId = gameId.toString();
                            return gId === oId || gId.includes(oId) || oId.includes(gId);
                        });

                        if (game) {
                            // Lấy giá tiền từ API hoặc từ đơn hàng
                            const price = game.price || order.total || 0;

                            // Tạo mã đơn hàng mới
                            const orderId = order.id || `ORD-${Math.floor(Math.random() * 1000000)}`;

                            // Thêm đơn hàng mới cho game
                            processedOrders.push({
                                id: orderId,
                                date: orderDate,
                                status: baseOrderStatus,
                                price: price,
                                priceFormatted: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price),
                                name: game.name,
                                image: game.imageUrl || game.img,
                                gameId: game.id,
                                tags: game.tags || [],
                                publisher: game.details?.publisher || game.publisher,
                                published_date: game.details?.published_date?.$date || game.published_date,
                                age_limit: game.details?.["age-limit"] || game.age_limit
                            });
                        }
                    }
                } else {
                    // Xử lý đơn hàng có nhiều game - tạo 1 đơn hàng riêng cho mỗi game
                    const pricePerGame = Math.round((order.total || 0) / bought_game_ids.length);

                    bought_game_ids.forEach((gameId, index) => {
                        const game = gamesResponse.find(g => {
                            const gId = g.id.toString();
                            const oId = gameId.toString();
                            return gId === oId || gId.includes(oId) || oId.includes(gId);
                        });

                        if (game) {
                            // Giá riêng cho từng game hoặc dùng giá trung bình
                            const price = game.price || pricePerGame;

                            // Tạo mã đơn hàng độc nhất cho mỗi game
                            const orderId = `${order.id || 'ORD'}-${index + 1}` || `ORD-${Math.floor(Math.random() * 1000000)}-${index + 1}`;

                            // Thêm đơn hàng mới cho game
                            processedOrders.push({
                                id: orderId,
                                date: orderDate,
                                status: baseOrderStatus,
                                price: price,
                                priceFormatted: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price),
                                name: game.name,
                                image: game.imageUrl || game.img,
                                gameId: game.id,
                                tags: game.tags || [],
                                publisher: game.details?.publisher || game.publisher,
                                published_date: game.details?.published_date?.$date || game.published_date,
                                age_limit: game.details?.["age-limit"] || game.age_limit
                            });
                        }
                    });
                }
            });

            // Sắp xếp theo ngày mua mới nhất lên đầu
            processedOrders.sort((a, b) => new Date(b.date) - new Date(a.date));

            console.log("Đơn hàng đã xử lý:", processedOrders);

            setUserOrders(processedOrders);

            // Lưu lịch sử đơn hàng vào localStorage để có thể sử dụng offline
            localStorage.setItem('user_orders', JSON.stringify(processedOrders));
        } catch (error) {
            console.error("Error fetching order history:", error);
            toast.error("Lỗi", {
                description: "Không thể tải lịch sử đơn hàng. Vui lòng thử lại sau.",
            });
            // Nếu lỗi, giữ lại dữ liệu lịch sử đơn hàng trong localStorage (nếu có)
            const savedOrders = localStorage.getItem('user_orders');
            if (savedOrders) {
                setUserOrders(JSON.parse(savedOrders));
            }
        } finally {
            setOrdersLoading(false);
        }
    };

    // Xử lý click vào nút upload avatar
    const handleAvatarUploadClick = () => {
        fileInputRef.current?.click();
    };

    // Xử lý khi file avatar được chọn
    const handleAvatarChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatarUrl(e.target.result);

                // Update avatar trong storage
                const storedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}");
                const updatedUser = {
                    ...storedUser,
                    avatar: e.target.result
                };

                const storage = localStorage.getItem("user") ? localStorage : sessionStorage;
                storage.setItem("user", JSON.stringify(updatedUser));

                toast.success("Cập nhật ảnh đại diện thành công");
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle form submission
    async function onSubmit(values) {
        setIsSubmitting(true);
        try {
            // Split name into f_name and l_name
            const nameParts = values.name.trim().split(" ");
            const f_name = nameParts[0] || "Unknown";
            const l_name = nameParts.slice(1).join(" ") || "";

            // Construct dob if birth date fields are provided
            let dob = null;
            if (values.birthDay && values.birthMonth && values.birthYear) {
                const date = new Date(
                    Date.UTC(
                        parseInt(values.birthYear),
                        parseInt(values.birthMonth) - 1,
                        parseInt(values.birthDay),
                    ),
                );
                if (!isNaN(date.getTime())) {
                    dob = { $date: date.toISOString() };
                } else {
                    throw new Error("Invalid date");
                }
            }

            // Update user data
            const storedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user") || "{}");
            const updatedUser = {
                ...storedUser,
                f_name,
                l_name,
                phone: values.phone,
                email: values.email,
                gender: values.gender,
                address: values.address,
                dob: dob || storedUser.dob || null,
                avatar: avatarUrl, // Include the avatar URL
            };

            // Update storage
            const storage = localStorage.getItem("user") ? localStorage : sessionStorage;
            storage.setItem("user", JSON.stringify(updatedUser));

            toast.success("Thành công", {
                description: "Hồ sơ đã được cập nhật thành công.",
            });
        } catch (error) {
            console.error("Error saving profile:", error);
            toast.error("Lỗi", {
                description: "Không thể cập nhật hồ sơ. Vui lòng thử lại.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    if (isLoading) {
        return (
            <div className="container mx-auto max-w-4xl py-8">
                <div className="bg-purple-950/60 backdrop-blur-xl border border-purple-700 shadow-[0_0_30px_rgba(168,85,247,0.4)] rounded-2xl p-16 flex items-center justify-center">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="h-20 w-20 rounded-full bg-purple-800/50 mb-4"></div>
                        <div className="h-6 w-48 bg-purple-800/50 rounded-md mb-3"></div>
                        <div className="h-4 w-72 bg-purple-800/50 rounded-md"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-4xl py-8">
            <Card className="bg-purple-950/60 backdrop-blur-xl border border-purple-700 shadow-[0_0_30px_rgba(168,85,247,0.4)] rounded-2xl overflow-hidden">
                <CardContent className="p-8">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white">Hồ sơ người dùng</h2>
                        <p className="text-purple-300">Quản lý thông tin cá nhân và theo dõi đơn hàng của bạn</p>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 h-auto p-1 bg-purple-900/40 mb-8">
                            <TabsTrigger
                                value="profile"
                                className="py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
                            >
                                <User className="h-4 w-4 mr-2" />
                                Thông tin cá nhân
                            </TabsTrigger>
                            <TabsTrigger
                                value="orders"
                                className="py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
                            >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Lịch sử đơn hàng
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile" className="mt-0">
                            <div className="flex flex-col md:flex-row gap-8">
                                {/* Avatar section */}
                                <div className="flex flex-col items-center">
                                    <div className="relative mb-4">
                                        <Avatar className="h-32 w-32 border-4 border-purple-500/30">
                                            <AvatarImage src={avatarUrl} alt="Avatar" />
                                            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white text-2xl">
                                                {form.watch("name")?.charAt(0) || "U"}
                                            </AvatarFallback>
                                        </Avatar>

                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
                                            onClick={handleAvatarUploadClick}
                                        >
                                            <Camera className="h-5 w-5" />
                                        </Button>

                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                        />
                                    </div>
                                    <p className="text-purple-300 text-sm text-center max-w-[180px]">
                                        Nhấp vào biểu tượng máy ảnh để thay đổi ảnh đại diện
                                    </p>
                                </div>

                                {/* Form section */}
                                <div className="flex-1">
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-purple-200">Họ và tên</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Nhập họ và tên"
                                                                {...field}
                                                                className="bg-purple-900/40 border-purple-600 focus:border-purple-500 text-white"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <FormField
                                                    control={form.control}
                                                    name="email"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-purple-200">Email</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="Nhập email"
                                                                    {...field}
                                                                    className="bg-purple-900/40 border-purple-600 focus:border-purple-500 text-white"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="phone"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-purple-200">Số điện thoại</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="Nhập số điện thoại"
                                                                    {...field}
                                                                    className="bg-purple-900/40 border-purple-600 focus:border-purple-500 text-white"
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name="gender"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-purple-200">Giới tính</FormLabel>
                                                        <FormControl>
                                                            <RadioGroup
                                                                defaultValue={field.value}
                                                                onValueChange={field.onChange}
                                                                className="flex space-x-4"
                                                            >
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem value="male" id="male" className="border-purple-500 text-purple-500" />
                                                                    <Label htmlFor="male" className="text-purple-200">Nam</Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem value="female" id="female" className="border-purple-500 text-purple-500" />
                                                                    <Label htmlFor="female" className="text-purple-200">Nữ</Label>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <RadioGroupItem value="other" id="other" className="border-purple-500 text-purple-500" />
                                                                    <Label htmlFor="other" className="text-purple-200">Khác</Label>
                                                                </div>
                                                            </RadioGroup>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <div className="space-y-2">
                                                <FormLabel className="text-purple-200">Ngày sinh</FormLabel>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <FormField
                                                        control={form.control}
                                                        name="birthDay"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <Select
                                                                    value={field.value}
                                                                    onValueChange={field.onChange}
                                                                >
                                                                    <SelectTrigger className="bg-purple-900/40 border-purple-600 text-white">
                                                                        <SelectValue placeholder="Ngày" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                                                            <SelectItem key={day} value={day.toString()}>
                                                                                {day}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="birthMonth"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <Select
                                                                    value={field.value}
                                                                    onValueChange={field.onChange}
                                                                >
                                                                    <SelectTrigger className="bg-purple-900/40 border-purple-600 text-white">
                                                                        <SelectValue placeholder="Tháng" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                                                            <SelectItem key={month} value={month.toString()}>
                                                                                {month}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={form.control}
                                                        name="birthYear"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <Select
                                                                    value={field.value}
                                                                    onValueChange={field.onChange}
                                                                >
                                                                    <SelectTrigger className="bg-purple-900/40 border-purple-600 text-white">
                                                                        <SelectValue placeholder="Năm" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {Array.from(
                                                                            { length: 100 },
                                                                            (_, i) => new Date().getFullYear() - i
                                                                        ).map((year) => (
                                                                            <SelectItem key={year} value={year.toString()}>
                                                                                {year}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                            </div>

                                            <FormField
                                                control={form.control}
                                                name="address"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-purple-200">Địa chỉ</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Nhập địa chỉ"
                                                                {...field}
                                                                className="bg-purple-900/40 border-purple-600 focus:border-purple-500 text-white"
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <Button
                                                type="submit"
                                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <div className="flex items-center">
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                                        Đang cập nhật...
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center">
                                                        <Save className="mr-2 h-4 w-4" />
                                                        Lưu thông tin
                                                    </div>
                                                )}
                                            </Button>
                                        </form>
                                    </Form>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="orders" className="mt-0">
                            <div className="space-y-6">
                                {ordersLoading ? (
                                    <div className="flex justify-center p-8">
                                        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : userOrders.length === 0 ? (
                                    <div className="text-center py-12">
                                        <ShoppingCart className="mx-auto h-12 w-12 text-purple-400 mb-4" />
                                        <h3 className="text-xl font-medium text-white mb-2">Chưa có đơn hàng nào</h3>
                                        <p className="text-purple-300">Bạn chưa có đơn hàng nào</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="border-b border-purple-700/40">
                                                    <th className="text-left py-3 px-4 text-purple-300 font-medium">Mã đơn hàng</th>
                                                    <th className="text-left py-3 px-4 text-purple-300 font-medium">Trò chơi</th>
                                                    <th className="text-left py-3 px-4 text-purple-300 font-medium">Ngày mua</th>
                                                    <th className="text-left py-3 px-4 text-purple-300 font-medium">Trạng thái</th>
                                                    <th className="text-right py-3 px-4 text-purple-300 font-medium">Giá tiền</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {userOrders.map((order, index) => (
                                                    <tr
                                                        key={order.id}
                                                        className={`border-b border-purple-700/20 hover:bg-purple-800/10 transition-colors ${index > 0 && userOrders[index - 1].date === order.date ? '' : 'border-t-4 border-t-purple-800'}`}
                                                    >
                                                        {/* Mã đơn hàng */}
                                                        <td className="py-4 px-4 text-white font-medium">{order.id}</td>

                                                        {/* Thông tin game */}
                                                        <td className="py-4 px-4">
                                                            <div className="flex items-center gap-3">
                                                                {order.image && (
                                                                    <div className="w-10 h-10 rounded overflow-hidden">
                                                                        <img
                                                                            src={order.image}
                                                                            alt={order.name}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    </div>
                                                                )}
                                                                <div className="flex flex-col">
                                                                    <span className="text-purple-200 font-medium">{order.name}</span>

                                                                    {order.publisher && (
                                                                        <span className="text-purple-300 text-xs mt-1">
                                                                            <span className="font-medium">Nhà phát hành:</span> {order.publisher}
                                                                        </span>
                                                                    )}

                                                                    {order.tags && order.tags.length > 0 && (
                                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                                            {order.tags.map((tag, idx) => (
                                                                                <span key={idx} className="px-2 py-0.5 bg-purple-700/40 text-purple-200 text-xs rounded-full">
                                                                                    {tag}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}

                                                                    {order.age_limit && (
                                                                        <span className="text-purple-300 text-xs mt-1">
                                                                            <span className="font-medium">Độ tuổi:</span> {order.age_limit}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Ngày mua */}
                                                        <td className="py-4 px-4 text-purple-200">{order.date}</td>

                                                        {/* Trạng thái */}
                                                        <td className="py-4 px-4">
                                                            <span className="inline-block px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">
                                                                {order.status}
                                                            </span>
                                                        </td>

                                                        {/* Giá tiền */}
                                                        <td className="py-4 px-4 text-right text-white font-medium">
                                                            {order.priceFormatted}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}