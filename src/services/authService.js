// Authentication Service - Centralized auth management with role-based access control

const ROLES = {
    USER: 'USER',
    ADMIN: 'ADMIN',
    SUPER_ADMIN: 'SUPER_ADMIN'
};

class AuthService {
    // Storage keys
    TOKEN_KEY = 'token';
    ROLE_KEY = 'userRole';
    USER_DATA_KEY = 'userData';

    /**
     * Normalize backend role format to frontend format
     * Backend sends: "ROLE_USER", "ROLE_ADMIN", "ROLE_SUPER_ADMIN"
     * Frontend uses: "USER", "ADMIN", "SUPER_ADMIN"
     * @param {string|string[]} backendRole - Role from backend (can be string or array)
     * @returns {string} Normalized role
     */
    normalizeRole(backendRole) {
        // Handle array of roles (take first role)
        if (Array.isArray(backendRole)) {
            backendRole = backendRole[0];
        }

        // Remove "ROLE_" prefix if present
        const role = backendRole.replace('ROLE_', '');

        // Validate and return
        if (Object.values(ROLES).includes(role)) {
            return role;
        }

        // Default to USER if invalid
        console.warn('Invalid role received:', backendRole, '- defaulting to USER');
        return ROLES.USER;
    }

    /**
     * Store authentication data after successful login
     * @param {string} token - JWT token
     * @param {string|string[]} role - User role (can be "ROLE_USER" or ["ROLE_USER"])
     * @param {object} userData - Additional user data
     */
    login(token, role, userData = {}) {
        if (!token) {
            console.error('Token is required for login');
            return false;
        }

        // Normalize the role
        const normalizedRole = this.normalizeRole(role);

        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.ROLE_KEY, normalizedRole);
        localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userData));

        return true;
    }

    /**
     * Clear all authentication data
     */
    logout() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.ROLE_KEY);
        localStorage.removeItem(this.USER_DATA_KEY);
    }

    /**
     * Get stored token
     * @returns {string|null}
     */
    getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    /**
     * Get stored user role
     * @returns {string|null}
     */
    getRole() {
        return localStorage.getItem(this.ROLE_KEY);
    }

    /**
     * Get stored user data
     * @returns {object|null}
     */
    getUserData() {
        const data = localStorage.getItem(this.USER_DATA_KEY);
        return data ? JSON.parse(data) : null;
    }

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        return !!this.getToken();
    }

    /**
     * Check if user has USER role
     * @returns {boolean}
     */
    isUser() {
        return this.getRole() === ROLES.USER;
    }

    /**
     * Check if user has ADMIN role
     * @returns {boolean}
     */
    isAdmin() {
        return this.getRole() === ROLES.ADMIN;
    }

    /**
     * Check if user has SUPER_ADMIN role
     * @returns {boolean}
     */
    isSuperAdmin() {
        return this.getRole() === ROLES.SUPER_ADMIN;
    }

    /**
     * Check if user has admin privileges (ADMIN or SUPER_ADMIN)
     * @returns {boolean}
     */
    hasAdminAccess() {
        const role = this.getRole();
        return role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;
    }

    /**
     * Check if user has any of the specified roles
     * @param {string[]} allowedRoles - Array of allowed roles
     * @returns {boolean}
     */
    hasRole(allowedRoles) {
        const userRole = this.getRole();
        return allowedRoles.includes(userRole);
    }

    /**
     * Get appropriate redirect path based on user role
     * @returns {string}
     */
    getDefaultRedirect() {
        const role = this.getRole();

        switch (role) {
            case ROLES.USER:
                return '/home';
            case ROLES.ADMIN:
                return '/admin/panel';
            case ROLES.SUPER_ADMIN:
                return '/super-admin/panel';
            default:
                return '/';
        }
    }

    /**
     * Validate if role can access a specific portal
     * @param {string} portal - Portal type ('user', 'admin', 'super-admin')
     * @param {string} userRole - User's role
     * @returns {boolean}
     */
    canAccessPortal(portal, userRole = null) {
        const role = userRole || this.getRole();

        switch (portal) {
            case 'user':
                // All roles can access user portal
                return true;
            case 'admin':
                // Admin and Super Admin can access admin portal
                return role === ROLES.ADMIN || role === ROLES.SUPER_ADMIN;
            case 'super-admin':
                // Only Super Admin can access super admin portal
                return role === ROLES.SUPER_ADMIN;
            default:
                return false;
        }
    }

    /**
     * Get role display name
     * @param {string} role - Role constant
     * @returns {string}
     */
    getRoleDisplayName(role = null) {
        const userRole = role || this.getRole();

        switch (userRole) {
            case ROLES.USER:
                return 'User';
            case ROLES.ADMIN:
                return 'Administrator';
            case ROLES.SUPER_ADMIN:
                return 'Super Administrator';
            default:
                return 'Guest';
        }
    }
}

// Export singleton instance
const authService = new AuthService();
export { authService, ROLES };
export default authService;
