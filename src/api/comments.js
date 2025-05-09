const API_URL = 'https://playvaultdatadeloy-production.up.railway.app/comments';
import { getUsers } from "./users";

export async function getComments() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch comments: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
}

export async function getCommentsByGameId(gameId) {
  try {
    const response = await fetch(`${API_URL}?game_id=${gameId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch comments for game ${gameId}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching comments for game ${gameId}:`, error);
    throw error;
  }
}

export async function getCommentsWithUsers() {
  try {
    const commentsResponse = await fetch(API_URL);
    if (!commentsResponse.ok) {
      throw new Error(`Failed to fetch comments: ${commentsResponse.statusText}`);
    }
    const comments = await commentsResponse.json();
    const users = await getUsers();

    return comments.map((comment) => {
      const user = users.find((u) => Number(u.id) === Number(comment.user_id));
      return {
        ...comment,
        user: user || { username: "Unknown User" },
        date: comment.date || { $date: new Date().toISOString() },
      };
    });
  } catch (error) {
    console.error("Error fetching comments with users:", error);
    throw error;
  }
}

export async function getCommentsByGameIdWithUsers(gameId) {
  try {
    const commentsResponse = await fetch(`${API_URL}?game_id=${gameId}`);
    if (!commentsResponse.ok) {
      throw new Error(`Failed to fetch comments for game ${gameId}: ${commentsResponse.statusText}`);
    }
    const comments = await commentsResponse.json();
    const users = await getUsers();

    return comments.map((comment) => {
      const user = users.find((u) => Number(u.id) === Number(comment.user_id));
      return {
        ...comment,
        user: user || { username: "Unknown User" },
        date: comment.date || { $date: new Date().toISOString() },
        isPositive: comment.rating >= 3,
      };
    });
  } catch (error) {
    console.error(`Error fetching comments for game ${gameId} with users:`, error);
    throw error;
  }
}

export async function addComment(comment) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...comment,
        date: { $date: new Date().toISOString() },
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to add comment: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
}