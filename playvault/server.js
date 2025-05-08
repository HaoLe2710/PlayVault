const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('data/games_data.json');
const middlewares = jsonServer.defaults();
const { v4: uuidv4 } = require('uuid');

// Áp dụng middleware mặc định (CORS, logging, v.v.)
server.use(middlewares);

// Phân tích JSON body cho yêu cầu POST
server.use(jsonServer.bodyParser);

// Endpoint /login tùy chỉnh
server.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Coi email là username
    const username = email;

    // Lấy danh sách users từ file JSON
    const db = router.db;
    const users = db.get('users').value();

    // Tìm người dùng theo username và password
    const user = users.find(
        (u) => u.username === username && u.password === password
    );

    if (!user) {
        return res.status(401).json({
            error: 'Đăng nhập thất bại',
            message: 'Tên người dùng hoặc mật khẩu không đúng',
        });
    }

    // Tạo dữ liệu người dùng trả về
    const userResponse = {
        id: user.id,
        name: `${user.f_name} ${user.l_name}`,
        username: user.username,
        dob: user.dob.$date,
    };

    // Tạo accessToken giả lập
    const accessToken = uuidv4();

    // Trả về accessToken và thông tin người dùng
    res.json({
        accessToken,
        user: userResponse,
    });
});

// Sử dụng router cho các endpoint khác
server.use(router);

// Khởi động server trên cổng 3001
const PORT = 3001;
server.listen(PORT, () => {
    console.log(`JSON Server đang chạy trên http://localhost:${PORT}`);
});