const API_URL = 'http://localhost:3001/games'

export async function getGames() {
    try {
        const response = await fetch(API_URL)
        if (!response.ok) {
            throw new Error(`Failed to fetch games: ${response.statusText}`)
        }
        return await response.json()
    } catch (error) {
        console.error('Error fetching games:', error)
        throw error
    }
}

export async function getGameById(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`)
        if (!response.ok) {
            throw new Error(`Failed to fetch game ${id}: ${response.statusText}`)
        }
        return await response.json()
    } catch (error) {
        console.error(`Error fetching game ${id}:`, error)
        throw error
    }
}