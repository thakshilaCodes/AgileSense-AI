/**
 * Simple user context utility
 * In a real app, this would come from your authentication system
 * For now, we'll use localStorage to simulate logged-in user
 */

// Get current logged-in user from localStorage
// In a real app, this would come from your auth context/state management
export const getCurrentUser = () => {
  // Try to get from localStorage (set during login)
  const userStr = localStorage.getItem('currentUser');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      return null;
    }
  }
  
  // Fallback: return a default user for demo purposes
  // In production, this should redirect to login if no user
  return {
    email: 'user@example.com',
    name: 'Current User',
  };
};

// Set current user (called after login)
export const setCurrentUser = (user) => {
  localStorage.setItem('currentUser', JSON.stringify(user));
};

// Clear current user (called on logout)
export const clearCurrentUser = () => {
  localStorage.removeItem('currentUser');
};

