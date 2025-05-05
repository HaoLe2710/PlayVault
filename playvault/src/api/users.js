// src/api/users.js

const API_URL = "http://localhost:3000/users"

export async function getUsers() {
  try {
    const response = await fetch(API_URL)
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching users:", error)
    throw error
  }
}

export async function getUserById(userId) {
  try {
    const response = await fetch(`${API_URL}/${userId}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch user ${userId}: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error)
    throw error
  }
}

export async function getCurrentUser() {
  // Trong ứng dụng thực tế, bạn sẽ lấy thông tin người dùng đã đăng nhập
  // Ở đây chúng ta giả định người dùng có ID 1 đang đăng nhập
  try {
    return await getUserById(1)
  } catch (error) {
    console.error("Error fetching current user:", error)
    return null
  }
}
