// src/api/users.js

const API_URL = 'http://localhost:3000/users'

export async function getUsers() {
  try {
    const response = await fetch(API_URL)
    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error
  }
}

export async function getUserById(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`)
    if (!response.ok) {
      throw new Error(`Failed to fetch user ${id}: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error)
    throw error
  }
}
