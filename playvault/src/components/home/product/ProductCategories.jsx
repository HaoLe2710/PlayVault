import { Lightbulb, Gamepad2, Watch, Gift, Laptop } from "lucide-react"

export default function ProductCategories() {
    const categories = [
        {
            name: "GAME",
            icon: (
                <div className="bg-gray-100 rounded-full p-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                            fill="#333"
                            stroke="#333"
                            strokeWidth="1.5"
                        />
                        <circle cx="12" cy="12" r="3" fill="#FFD700" />
                    </svg>
                </div>
            ),
        },
        {
            name: "MÁY GAME",
            icon: (
                <div className="bg-gray-100 rounded-full p-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="2" y="6" width="20" height="12" rx="2" fill="#444" />
                        <rect x="4" y="8" width="16" height="8" rx="1" fill="#888" />
                        <rect x="2" y="10" width="2" height="4" rx="1" fill="#FFD700" />
                        <rect x="20" y="10" width="2" height="4" rx="1" fill="#FFD700" />
                    </svg>
                </div>
            ),
        },
        {
            name: "DIGITAL CARDS",
            icon: (
                <div className="bg-gray-100 rounded-full p-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="4" width="14" height="16" rx="2" fill="#f5f5f5" stroke="#333" strokeWidth="1.5" />
                        <rect x="6" y="6" width="10" height="2" rx="1" fill="#FFD700" />
                    </svg>
                </div>
            ),
        },
        {
            name: "APPLE",
            icon: (
                <div className="bg-gray-100 rounded-full p-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M14.94 5.19A4.38 4.38 0 0 0 16 2a4.44 4.44 0 0 0-3 1.52 4.17 4.17 0 0 0-1 3.09 3.69 3.69 0 0 0 2.94-1.42z"
                            fill="#000"
                        />
                        <path
                            d="M19.45 12.04c-.03-3.49 2.77-5.17 2.9-5.25a6.08 6.08 0 0 0-4.82-2.67c-2.03-.21-4 1.21-5.03 1.21-1.06 0-2.64-1.19-4.36-1.16-2.2.04-4.26 1.31-5.4 3.29-2.33 4.05-.58 10 1.64 13.27 1.12 1.6 2.43 3.4 4.14 3.33 1.68-.07 2.3-1.07 4.32-1.07 2 0 2.58 1.07 4.35 1.02 1.8-.03 2.95-1.62 4.03-3.24a13.54 13.54 0 0 0 1.84-3.75c-.05-.02-3.58-1.4-3.61-5.48z"
                            fill="#000"
                        />
                    </svg>
                </div>
            ),
        },
        {
            name: "SURFACE",
            icon: <Laptop className="bg-gray-100 rounded-full p-2" size={40} />,
        },
        {
            name: "PHỤ KIỆN",
            icon: <Watch className="bg-gray-100 rounded-full p-2" size={40} />,
        },
        {
            name: "PHỤ KIỆN GAME",
            icon: <Gamepad2 className="bg-gray-100 rounded-full p-2" size={40} />,
        },
        {
            name: "ĐỒ CHƠI & QUÀ TẶNG",
            icon: <Gift className="bg-gray-100 rounded-full p-2" size={40} />,
        },
        {
            name: "ĐỒ CÔNG NGHỆ",
            icon: <Lightbulb className="bg-gray-100 rounded-full p-2" size={40} />,
        },
    ]

    return (
        <div className="w-full bg-white py-8 px-4 md:px-8">
            <h2 className="text-center text-2xl md:text-3xl font-bold text-gray-800 mb-8">DANH MỤC SẢN PHẨM</h2>

            <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4">
                {categories.map((category, index) => (
                    <div key={index} className="flex flex-col items-center">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-white shadow-sm rounded-lg flex items-center justify-center mb-2 hover:shadow-md transition-shadow duration-300">
                            {category.icon}
                        </div>
                        <span className="text-xs md:text-sm font-medium text-center">{category.name}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
