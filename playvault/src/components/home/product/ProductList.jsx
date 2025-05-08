
import { useState } from "react"
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { ShoppingCart, Search } from "lucide-react"

export default function ProductGrid(products) {
    const [hoveredProduct, setHoveredProduct] = useState(null)

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {products.map((product) => (
                <div
                    key={product.id}
                    className="border border-gray-200 p-2 relative"
                    onMouseEnter={() => setHoveredProduct(product.id)}
                    onMouseLeave={() => setHoveredProduct(null)}
                >
                    <div className="relative">
                        <LazyLoadImage
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
            ))}
        </div>
    )
}
