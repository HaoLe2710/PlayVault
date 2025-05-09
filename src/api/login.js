const USERS_API_URL = 'https://playvaultdatadeloy-production.up.railway.app/users'
export async function loginUser(username, password) {
    try {
        const response = await fetch(`${USERS_API_URL}?username=${encodeURIComponent(username)}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch user: ${response.statusText}`);
        }
        const users = await response.json();

        if (users.length === 0) {
            throw new Error("Không tìm thấy người dùng với tên đăng nhập này");
        }

        const user = users[0];
        if (user.password !== password) {
            throw new Error("Mật khẩu không đúng, vui lòng kiểm tra lại");
        }

        return user;
    } catch (error) {
        console.error("Error during login:", error);
        throw error;
    }
}