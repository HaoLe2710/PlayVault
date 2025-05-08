"use client"

import { useState } from "react"
import Image from "next/image"
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

export default function ProductGrid() {
    const [hoveredProduct, setHoveredProduct] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const productsPerPage = 10

    // Calculate the products to display on the current page
    const indexOfLastProduct = currentPage * productsPerPage
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage
    const currentProducts = allProducts.slice(indexOfFirstProduct, indexOfLastProduct)
    const totalPages = Math.ceil(allProducts.length / productsPerPage)

    // Change page
    const goToPage = (pageNumber) => {
        setCurrentPage(pageNumber)
        // Reset hover state when changing pages
        setHoveredProduct(null)
        // Scroll to top when changing pages
        window.scrollTo(0, 0)
    }

    const nextPage = () => {
        if (currentPage < totalPages) {
            goToPage(currentPage + 1)
        }
    }

    const prevPage = () => {
        if (currentPage > 1) {
            goToPage(currentPage - 1)
        }
    }

    // Product component to avoid repetition
    const ProductItem = ({ product }) => (
        <div
            key={product.id}
            className="border border-gray-200 p-2 relative"
            onMouseEnter={() => setHoveredProduct(product.id)}
            onMouseLeave={() => setHoveredProduct(null)}
        >
            <div className="relative">
                <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={300}
                    height={300}
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
                <h3 className="text-sm font-medium">{product.name}</h3>
                <p className="text-sm mt-1">{product.price}</p>
            </div>
        </div>
    )

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {currentProducts.map((product) => (
                    <ProductItem key={product.id} product={product} />
                ))}
            </div>

            {/* Pagination controls */}
            <div className="flex justify-center items-center mt-8 space-x-2">
                <Button variant="outline" size="icon" onClick={prevPage} disabled={currentPage === 1}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>

                {Array.from({ length: totalPages }, (_, i) => (
                    <Button
                        key={i + 1}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(i + 1)}
                    >
                        {i + 1}
                    </Button>
                ))}

                <Button variant="outline" size="icon" onClick={nextPage} disabled={currentPage === totalPages}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
