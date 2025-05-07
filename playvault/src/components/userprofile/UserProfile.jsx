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

                    // Fetch user's order history - demo only
                    // Trong thực tế bạn sẽ gọi API để lấy lịch sử đơn hàng
                    setUserOrders([
                        {
                            id: "ORD-" + Math.floor(Math.random() * 1000000),
                            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString("vi-VN"),
                            status: "Đã giao",
                            total: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.floor(Math.random() * 2000000) + 500000)
                        },
                        {
                            id: "ORD-" + Math.floor(Math.random() * 1000000),
                            date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toLocaleDateString("vi-VN"),
                            status: "Đã giao",
                            total: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.floor(Math.random() * 1000000) + 200000)
                        }
                    ]);
                }
            } catch (error) {
                console.error("Error loading user data:", error);
                toast.error("Lỗi", {
                    description: "Không thể tải dữ liệu người dùng.",
                    style: { background: "#fef2f2", border: "1px solid #f99d9d", color: "#b91c1c" },
                    duration: 3000,
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [form]);

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
                style: { background: "#f0fdf4", border: "1px solid #9ae6b4", color: "#15803d" },
                duration: 3000,
            });
        } catch (error) {
            console.error("Error saving profile:", error);
            toast.error("Lỗi", {
                description: "Không thể cập nhật hồ sơ. Vui lòng thử lại.",
                style: { background: "#fef2f2", border: "1px solid #f99d9d", color: "#b91c1c" },
                duration: 3000,
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
                        <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                            Hồ Sơ Người Dùng
                        </h1>
                        <p className="text-purple-300">Quản lý thông tin hồ sơ để cá nhân hóa tài khoản</p>
                        <div className="mt-4 border-b border-purple-700/40" />
                    </div>

                    <Tabs defaultValue="profile" value={activeTab} onValueChange={setActiveTab} className="mt-6">
                        <TabsList className="grid grid-cols-2 mb-8 bg-purple-900/30">
                            <TabsTrigger value="profile" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                                Thông tin tài khoản
                            </TabsTrigger>
                            <TabsTrigger value="orders" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-purple-600 data-[state=active]:text-white">
                                Lịch sử đơn hàng
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="profile" className="mt-0">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                        <div className="lg:col-span-2">
                                            <div className="space-y-6">
                                                <FormField
                                                    control={form.control}
                                                    name="name"
                                                    render={({ field }) => (
                                                        <FormItem className="grid grid-cols-3 items-center">
                                                            <FormLabel className="text-left font-medium text-purple-200">Tên</FormLabel>
                                                            <div className="col-span-2">
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        className="max-w-md bg-purple-900/40 border-purple-600 text-white placeholder-purple-300 focus:ring-purple-500 focus:border-purple-500 rounded-lg"
                                                                        placeholder="Nhập tên của bạn"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-pink-400 text-sm mt-1" />
                                                            </div>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="email"
                                                    render={({ field }) => (
                                                        <FormItem className="grid grid-cols-3 items-center">
                                                            <FormLabel className="text-left font-medium text-purple-200">Email</FormLabel>
                                                            <div className="col-span-2">
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        className="max-w-md bg-purple-900/40 border-purple-600 text-white placeholder-purple-300 focus:ring-purple-500 focus:border-purple-500 rounded-lg"
                                                                        placeholder="Nhập email của bạn"
                                                                        type="email"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-pink-400 text-sm mt-1" />
                                                            </div>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="phone"
                                                    render={({ field }) => (
                                                        <FormItem className="grid grid-cols-3 items-center">
                                                            <FormLabel className="text-left font-medium text-purple-200">Số điện thoại</FormLabel>
                                                            <div className="col-span-2">
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        className="max-w-md bg-purple-900/40 border-purple-600 text-white placeholder-purple-300 focus:ring-purple-500 focus:border-purple-500 rounded-lg"
                                                                        placeholder="Nhập số điện thoại của bạn"
                                                                        type="tel"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-pink-400 text-sm mt-1" />
                                                            </div>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="address"
                                                    render={({ field }) => (
                                                        <FormItem className="grid grid-cols-3 items-center">
                                                            <FormLabel className="text-left font-medium text-purple-200">Địa chỉ</FormLabel>
                                                            <div className="col-span-2">
                                                                <FormControl>
                                                                    <Input
                                                                        {...field}
                                                                        className="max-w-md bg-purple-900/40 border-purple-600 text-white placeholder-purple-300 focus:ring-purple-500 focus:border-purple-500 rounded-lg"
                                                                        placeholder="Nhập địa chỉ của bạn"
                                                                    />
                                                                </FormControl>
                                                                <FormMessage className="text-pink-400 text-sm mt-1" />
                                                            </div>
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="gender"
                                                    render={({ field }) => (
                                                        <FormItem className="grid grid-cols-3 items-center">
                                                            <FormLabel className="text-left font-medium text-purple-200">Giới tính</FormLabel>
                                                            <div className="col-span-2">
                                                                <FormControl>
                                                                    <RadioGroup
                                                                        onValueChange={field.onChange}
                                                                        value={field.value}
                                                                        className="flex gap-8"
                                                                    >
                                                                        {[
                                                                            { value: "male", label: "Nam" },
                                                                            { value: "female", label: "Nữ" },
                                                                            { value: "other", label: "Khác" },
                                                                        ].map((option) => (
                                                                            <div
                                                                                key={option.value}
                                                                                className="flex items-center space-x-2 group"
                                                                            >
                                                                                <RadioGroupItem
                                                                                    value={option.value}
                                                                                    id={option.value}
                                                                                    className="border-purple-500 text-pink-600 focus:ring-purple-500"
                                                                                />
                                                                                <Label
                                                                                    htmlFor={option.value}
                                                                                    className="font-medium text-purple-200 group-hover:text-pink-400 cursor-pointer"
                                                                                >
                                                                                    {option.label}
                                                                                </Label>
                                                                            </div>
                                                                        ))}
                                                                    </RadioGroup>
                                                                </FormControl>
                                                                <FormMessage className="text-pink-400 text-sm mt-1" />
                                                            </div>
                                                        </FormItem>
                                                    )}
                                                />

                                                <div className="grid grid-cols-3 items-start">
                                                    <Label className="text-left font-medium text-purple-200 pt-2">Ngày sinh</Label>
                                                    <div className="col-span-2 flex gap-3 justify-between">
                                                        <FormField
                                                            control={form.control}
                                                            name="birthDay"
                                                            render={({ field }) => (
                                                                <FormItem className="flex-1">
                                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                                        <FormControl>
                                                                            <SelectTrigger className="bg-purple-900/40 border-purple-600 text-white focus:ring-purple-500">
                                                                                <SelectValue placeholder="Ngày" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent className="bg-purple-900 border-purple-700 text-white">
                                                                            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                                                                <SelectItem key={day} value={day.toString()}>
                                                                                    {day}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage className="text-pink-400 text-sm mt-1" />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={form.control}
                                                            name="birthMonth"
                                                            render={({ field }) => (
                                                                <FormItem className="flex-1">
                                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                                        <FormControl>
                                                                            <SelectTrigger className="bg-purple-900/40 border-purple-600 text-white focus:ring-purple-500">
                                                                                <SelectValue placeholder="Tháng" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent className="bg-purple-900 border-purple-700 text-white">
                                                                            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                                                                <SelectItem key={month} value={month.toString()}>
                                                                                    {month}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage className="text-pink-400 text-sm mt-1" />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={form.control}
                                                            name="birthYear"
                                                            render={({ field }) => (
                                                                <FormItem className="flex-1">
                                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                                        <FormControl>
                                                                            <SelectTrigger className="bg-purple-900/40 border-purple-600 text-white focus:ring-purple-500">
                                                                                <SelectValue placeholder="Năm" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent className="bg-purple-900 border-purple-700 text-white max-h-60">
                                                                            {Array.from(
                                                                                { length: 80 },
                                                                                (_, i) => new Date().getFullYear() - i
                                                                            ).map((year) => (
                                                                                <SelectItem key={year} value={year.toString()}>
                                                                                    {year}
                                                                                </SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage className="text-pink-400 text-sm mt-1" />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 items-center pt-4">
                                                    <div></div>
                                                    <div className="col-span-2">
                                                        <Button
                                                            type="submit"
                                                            disabled={isSubmitting}
                                                            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-medium px-6 py-2 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                                                        >
                                                            <Save className="mr-2 h-4 w-4" />
                                                            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center justify-start">
                                            <div className="relative group">
                                                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full opacity-75 group-hover:opacity-100 blur group-hover:blur-md transition duration-1000"></div>
                                                <div className="relative rounded-full p-1 bg-purple-900/80 flex items-center justify-center">
                                                    <Avatar className="h-40 w-40 border-4 border-purple-800 group-hover:border-purple-600 transition-all duration-300">
                                                        <AvatarImage
                                                            src={avatarUrl}
                                                            alt={form.getValues().name}
                                                            className="object-cover"
                                                        />
                                                        <AvatarFallback className="bg-gradient-to-br from-pink-700 to-purple-700 text-2xl text-white">
                                                            {form.getValues().name
                                                                ? form.getValues().name.charAt(0).toUpperCase()
                                                                : <User className="h-10 w-10" />}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                </div>
                                            </div>

                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleAvatarChange}
                                            />

                                            <div className="mt-6 space-y-3">
                                                <Button
                                                    type="button"
                                                    onClick={handleAvatarUploadClick}
                                                    className="bg-purple-800/60 hover:bg-purple-700 text-white w-full flex items-center justify-center py-2 rounded-lg"
                                                >
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    Tải ảnh lên
                                                </Button>

                                                <div className="text-xs text-purple-400 text-center px-2">
                                                    Cho phép JPG, GIF hoặc PNG. Tối đa 2MB.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </Form>
                        </TabsContent>

                        <TabsContent value="orders" className="mt-0">
                            <div className="bg-purple-900/20 rounded-xl p-6">
                                <h3 className="text-xl font-semibold text-white mb-6">Lịch sử đơn hàng</h3>

                                {userOrders.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="bg-purple-900/40 inline-block p-3 rounded-full mb-3">
                                            <ShoppingCart className="h-8 w-8 text-purple-300" />
                                        </div>
                                        <p className="text-purple-300">Bạn chưa có đơn hàng nào</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="border-b border-purple-700/40">
                                                    <th className="text-left py-3 px-4 text-purple-300 font-medium">Mã đơn hàng</th>
                                                    <th className="text-left py-3 px-4 text-purple-300 font-medium">Ngày</th>
                                                    <th className="text-left py-3 px-4 text-purple-300 font-medium">Trạng thái</th>
                                                    <th className="text-right py-3 px-4 text-purple-300 font-medium">Tổng tiền</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {userOrders.map((order) => (
                                                    <tr key={order.id} className="border-b border-purple-700/20 hover:bg-purple-800/10 transition-colors">
                                                        <td className="py-4 px-4 text-white font-medium">{order.id}</td>
                                                        <td className="py-4 px-4 text-purple-200">{order.date}</td>
                                                        <td className="py-4 px-4">
                                                            <span className="inline-block px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">
                                                                {order.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-4 text-right text-white font-medium">{order.total}</td>
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