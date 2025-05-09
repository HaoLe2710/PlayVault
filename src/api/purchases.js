const API_URL = 'https://playvaultdatadeloy-production.up.railway.app/purchases'

export async function getPurchases() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch purchases: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching purchases:", error);
        throw error;
    }
}

export async function getPurchaseByUserId(userId) {
    try {
        const response = await fetch(`${API_URL}?user_id=${userId}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch purchase for user ${userId}: ${response.statusText}`);
        }
        const purchases = await response.json();
        return purchases[0] || null; // Trả về purchase đầu tiên hoặc null nếu không có
    } catch (error) {
        console.error(`Error fetching purchase for user ${userId}:`, error);
        throw error;
    }
}

export async function createPurchase(purchaseData) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(purchaseData),
        });
        if (!response.ok) {
            throw new Error(`Failed to create purchase: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error creating purchase:", error);
        throw error;
    }
}

export async function updatePurchase(purchaseId, purchaseData) {
    try {
        const response = await fetch(`${API_URL}/${purchaseId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(purchaseData),
        });
        if (!response.ok) {
            throw new Error(`Failed to update purchase: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error updating purchase ${purchaseId}:`, error);
        throw error;
    }
}