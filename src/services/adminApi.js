import api from './api';

/**
 * Get all users from Admin API
 */
export async function getUsers() {
    try {
        const response = await api.get('/admin/users');

        // Support both:
        // { data: [...] }
        // and directly returned [...]
        return response.data?.data ?? response.data ?? [];
    } catch (error) {
        console.error('Failed to fetch users:', error);
        throw error;
    }
}