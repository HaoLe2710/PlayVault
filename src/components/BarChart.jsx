import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Customized } from "recharts";
import { useState } from "react";

function BarChartComponent({ title, data, dataType }) {
  // Kiểm tra nếu data.labels hoặc data.values không hợp lệ
  if (!data || !data.labels || !data.values || data.labels.length === 0) {
    return (
      <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-500/30">
        <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
        <p className="text-purple-300 text-center">Đang tải dữ liệu...</p>
      </div>
    );
  }

  // Chuyển đổi dữ liệu thành định dạng Recharts
  const chartData = data.labels.map((label, index) => ({
    name: label,
    value: data.values[index],
    thumbnail: data.thumbnails[index] || "https://placehold.co/40x40/3a1a5e/ffffff?text=No+Image",
  }));

  // Custom component để vẽ thumbnail trên đầu cột
  const CustomBar = (props) => {
    const { x, y, width, height, thumbnail } = props;
    const [isHovered, setIsHovered] = useState(false);

    return (
      <g>
        {/* Thumbnail */}
        <image
          x={x + width / 2 - 20} // Căn giữa thumbnail
          y={y - 50} // Đặt thumbnail phía trên cột
          width={40}
          height={40}
          href={thumbnail}
          preserveAspectRatio="xMidYMid slice"
          className="rounded-md"
        />
        {/* Bar với hover effect */}
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill="hsl(120, 60%, 70%)"
          className={`transition-transform duration-200 ${isHovered ? "scale-y-105 brightness-110" : ""}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        />
      </g>
    );
  };

  return (
    <div className="bg-purple-900/20 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-purple-500/30">
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      <BarChart
        width={500}
        height={400} // Tăng chiều cao
        data={chartData}
        margin={{ top: 0, right: 0, left: 0, bottom: 20 }} // Tăng top/bottom margin để chứa thumbnail và label
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
        <XAxis
          dataKey="name"
          stroke="#fff"
          tick={{ fill: "#fff", fontSize: 12 }}
          angle={-45} // Xoay label 45 độ
          textAnchor="end" // Căn chỉnh cuối label
          height={80} // Tăng chiều cao XAxis để chứa label xéo
          interval={0} // Hiển thị tất cả label
          tickMargin={10}
          style={{
            whiteSpace: "normal",
            wordWrap: "break-word",
            overflow: "visible",
          }}
          tickLine={false}
        />
        <YAxis stroke="#fff" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(120, 60%, 70%)",
            border: "1px solid rgba(139, 92, 246, 0.5)",
            color: "#fff",
          }}
          formatter={(value) => [`${value} ${dataType}`, dataType]}
        />
        <Legend
          layout="horizontal" // Bố cục ngang
          verticalAlign="top" // Đặt legend phía dưới
          align="right" // Căn giữa
          wrapperStyle={{ color: "#fff", paddingBottom: 20 }} // Thêm padding và giữ màu trắng
          formatter={() => dataType} // Hiển thị dataType trong legend
          payload={[{ value: dataType, type: "square", color: "hsl(120, 60%, 70%)" }]}
        />
        <Bar dataKey="value" shape={<CustomBar />} />
      </BarChart>
    </div>
  );
}

export default BarChartComponent;