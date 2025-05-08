
import { useState, useEffect } from "react"
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { ShoppingCart, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

// Sample data with 20 products
const allProducts = [
    {
        id: 1,
        name: "Game Ys VIII: Lacrimosa of Dana – PS5",
        price: "1.200.000 đ",
        image: "/placeholder.svg?height=300&width=300",
    },
    {
        id: 2,
        name: "Game Sifu – PS5",
        price: "950.000 đ",
        image: "/placeholder.svg?height=300&width=300",
    },
    {
        id: 3,
        name: "Game Ghostwire: Tokyo – PS5",
        price: "1.000.000 đ",
        image: "/placeholder.svg?height=300&width=300",
    },
    {
        id: 4,
        name: "Game Kena: Bridge of Spirits – PS5",
        price: "850.000 đ",
        image: "/placeholder.svg?height=300&width=300",
    },
    {
        id: 5,
        name: "Game Tennis On-Court – PS5",
        price: "950.000 đ",
        image: "/placeholder.svg?height=300&width=300",
    },
    {
        id: 6,
        name: "Game Hogwarts Legacy – PS5",
        price: "1.150.000 đ",
        image: "/placeholder.svg?height=300&width=300",
    },
    {
        id: 7,
        name: "Game Final Fantasy XVI – PS5",
        price: "1.300.000 đ",
        image: "/placeholder.svg?height=300&width=300",
    },
    {
        id: 8,
        name: "Game Resident Evil 4 – PS5",
        price: "1.100.000 đ",
        image: "/placeholder.svg?height=300&width=300",
    },
    {
        id: 9,
        name: "Game Spider-Man 2 – PS5",
        price: "1.400.000 đ",
        image: "/placeholder.svg?height=300&width=300",
    },
    {
        id: 10,
        name: "Game God of War Ragnarök – PS5",
        price: "1.250.000 đ",
        image: "/placeholder.svg?height=300&width=300",
    },
    {
        id: 11,
        name: "Game Demon's Souls – PS5",
        price: "1.050.000 đ",
        image: "/placeholder.svg?height=300&width=300",
    },
    {
        id: 12,
        name: "Game Horizon Forbidden West – PS5",
        price: "1.200.000 đ",
        image: "/placeholder.svg?height=300&width=300",
    },
    {
        id: 13,
        name: "Game Gran Turismo 7 – PS5",
        price: "1.150.000 đ",
        image: "/placeholder.svg?height=300&width=300",
    },
    {
        id: 14,
        name: "Game Ratchet & Clank: Rift Apart – PS5",
        price: "1.100.000 đ",
        image: "/placeholder.svg?height=300&width=300",
    },
    {
        id: 15,
        name: "Game Returnal – PS5",
        price: "1.050.000 đ",
        image: "/placeholder.svg?height=300&width=300",
    },
    {
        id: 16,
        name: "Game Deathloop – PS5",
        price: "950.000 đ",
        image: "/placeholder.svg?height=300&width=300",
    },
    {
        id: 17,
        name: "Game Elden Ring – PS5",
        price: "1.300.000 đ",
        image: "/placeholder.svg?height=300&width=300",
    },
    {
        id: 18,
        name: "Game The Last of Us Part I – PS5",
        price: "1.200.000 đ",
        image: "/placeholder.svg?height=300&width=300",
    },
    {
        id: 19,
        name: "Game Forspoken – PS5",
        price: "1.100.000 đ",
        image: "/placeholder.svg?height=300&width=300",
    },
    {
        id: 20,
        name: "Game Dying Light 2 – PS5",
        price: "1.000.000 đ",
        image: "/placeholder.svg?height=300&width=300",
    },
]

export default function ProductCarousel() {
    const [hoveredProduct, setHoveredProduct] = useState(null)
    const [displayedProducts, setDisplayedProducts] = useState([])
    const [remainingProducts, setRemainingProducts] = useState(allProducts)
    const [history, setHistory] = useState([]) // Lưu lịch sử các trang đã xem

    // Number of products to show at once (responsive)
    const getVisibleItems = () => {
        if (typeof window !== "undefined") {
            if (window.innerWidth < 640) return 1 // Mobile
            if (window.innerWidth < 768) return 2 // Small tablets
            if (window.innerWidth < 1024) return 3 // Tablets
            return 5 // Desktop
        }
        return 5 // Default for SSR
    }

    const visibleItems = getVisibleItems()

    // Initialize displayed products on mount
    useEffect(() => {
        const initialProducts = remainingProducts.slice(0, visibleItems)
        setDisplayedProducts(initialProducts)
        setRemainingProducts(remainingProducts.slice(visibleItems))
        setHistory([initialProducts])
    }, [])

    const showNextProducts = () => {
        if (remainingProducts.length === 0) return // Không còn sản phẩm mới

        const newProducts = remainingProducts.slice(0, visibleItems)
        setDisplayedProducts(newProducts)
        setRemainingProducts(remainingProducts.slice(visibleItems))
        setHistory([...history, newProducts]) // Thêm trang mới vào lịch sử
    }

    const showPreviousProducts = () => {
        if (history.length <= 1) return // Không có trang trước đó

        const newHistory = history.slice(0, -1) // Xóa trang hiện tại
        const previousProducts = newHistory[newHistory.length - 1] // Lấy trang trước
        setDisplayedProducts(previousProducts)
        setHistory(newHistory)

        // Khôi phục remainingProducts để đảm bảo tính nhất quán
        const allDisplayedIds = newHistory.flat().map((p) => p.id)
        setRemainingProducts(allProducts.filter((p) => !allDisplayedIds.includes(p.id)))
    }

    // Product component to avoid repetition
    const ProductItem = ({ product }) => (
        <div
            className="flex-shrink-0 w-52 border border-gray-200 p-2 relative"
            onMouseEnter={() => setHoveredProduct(product.id)}
            onMouseLeave={() => setHoveredProduct(null)}
        >
            <div className="relative">
                <LazyLoadImage
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={200}
                    height={200}
                    className="w-full h-auto"
                />

                {/* Quick action buttons that slide in from right on hover */}
                <div
                    className={`absolute top-2 right-2 bg-white rounded-md shadow-md flex flex-col transform transition-transform duration-300 ${hoveredProduct === product.id ? "translate-x-0" : "translate-x-16 opacity-0"
                        }`}
                >
                    <button className="p-2 hover:bg-gray-100 transition-colors">
                        <ShoppingCart className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 transition-colors">
                        <Search className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="mt-2">
                <h3 className="text-sm font-medium truncate">{product.name}</h3>
                <p className="text-sm mt-1">{product.price}</p>
            </div>
        </div>
    )

    return (
        <div className="relative">
            {/* Left navigation button */}
            <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md"
                onClick={showPreviousProducts}
                disabled={history.length <= 1}
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Product carousel */}
            <div className="flex overflow-x-hidden gap-4 py-4 px-10">
                {displayedProducts.map((product) => (
                    <ProductItem key={product.id} product={product} />
                ))}
            </div>

            {/* Right navigation button */}
            <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md"
                onClick={showNextProducts}
                disabled={remainingProducts.length === 0}
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    )
}