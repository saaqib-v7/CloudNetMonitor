"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
class UserService {
    constructor() {
        this.users = new Map();
        // Add default admin user
        this.users.set('admin', {
            id: 'admin',
            username: 'admin',
            email: 'admin@example.com',
            password: bcrypt_1.default.hashSync('admin', 10), // Hash admin password like other users
            role: 'admin',
            preferences: {
                theme: 'dark',
                defaultTimeRange: '24h',
                alertNotifications: true,
                emailNotifications: true
            },
            lastLogin: new Date().toISOString(),
            createdAt: new Date().toISOString()
        });
        // Add default regular user
        this.users.set('user', {
            id: 'user',
            username: 'user',
            email: 'user@example.com',
            password: bcrypt_1.default.hashSync('user', 10),
            role: 'user',
            preferences: {
                theme: 'light',
                defaultTimeRange: '24h',
                alertNotifications: true,
                emailNotifications: false
            },
            lastLogin: new Date().toISOString(),
            createdAt: new Date().toISOString()
        });
    }
    createUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.users.has(data.username)) {
                throw new Error('Username already exists');
            }
            const user = {
                id: Math.random().toString(36).substr(2, 9),
                username: data.username,
                email: data.email,
                password: yield bcrypt_1.default.hash(data.password, 10),
                role: data.role || 'user',
                preferences: {
                    theme: 'light',
                    defaultTimeRange: '24h',
                    alertNotifications: true,
                    emailNotifications: true
                },
                lastLogin: new Date().toISOString(),
                createdAt: new Date().toISOString()
            };
            this.users.set(user.username, user);
            // Return user without password
            const { password } = user, userWithoutPassword = __rest(user, ["password"]);
            return userWithoutPassword;
        });
    }
    authenticate(username, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = this.users.get(username);
            if (!user)
                return null;
            // Use bcrypt compare for all users
            const isValidPassword = yield bcrypt_1.default.compare(password, user.password);
            if (!isValidPassword)
                return null;
            user.lastLogin = new Date().toISOString();
            const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
            const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
            return { token, user: userWithoutPassword };
        });
    }
    verifyToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            if (!decoded || typeof decoded !== 'object') {
                return { valid: false, error: 'Invalid token format' };
            }
            // Check if token is expired
            const exp = decoded.exp;
            if (exp && Date.now() >= exp * 1000) {
                return { valid: false, error: 'Token expired' };
            }
            return { valid: true };
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                return { valid: false, error: 'Token expired' };
            }
            else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                return { valid: false, error: 'Invalid token' };
            }
            return { valid: false, error: 'Token verification failed' };
        }
    }
    getUserIdFromToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            return decoded.id;
        }
        catch (_a) {
            return 'unknown';
        }
    }
    getUsers() {
        return Array.from(this.users.values()).map(user => {
            const { password } = user, userWithoutPassword = __rest(user, ["password"]);
            return userWithoutPassword;
        });
    }
    updateUserPreferences(userId, preferences) {
        const user = Array.from(this.users.values()).find(u => u.id === userId);
        if (!user) {
            return null;
        }
        user.preferences = Object.assign(Object.assign({}, user.preferences), preferences);
        this.users.set(userId, user);
        const { password } = user, userWithoutPassword = __rest(user, ["password"]);
        return userWithoutPassword;
    }
}
exports.userService = new UserService();
