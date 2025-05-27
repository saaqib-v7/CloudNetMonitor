import { User, UserPreferences } from '../types';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface UserWithPassword extends User {
  password: string;
}

class UserService {
  private users: Map<string, UserWithPassword> = new Map();

  constructor() {
    // Add default admin user
    this.users.set('admin', {
      id: 'admin',
      username: 'admin',
      email: 'admin@example.com',
      password: bcrypt.hashSync('admin', 10), // Hash admin password like other users
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
      password: bcrypt.hashSync('user', 10),
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

  async createUser(data: { username: string; password: string; email: string; role?: 'admin' | 'user' }): Promise<User> {
    if (this.users.has(data.username)) {
      throw new Error('Username already exists');
    }

    const user: UserWithPassword = {
      id: Math.random().toString(36).substr(2, 9),
      username: data.username,
      email: data.email,
      password: await bcrypt.hash(data.password, 10),
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
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async authenticate(username: string, password: string): Promise<{ token: string; user: User } | null> {
    const user = this.users.get(username);
    if (!user) return null;

    // Use bcrypt compare for all users
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) return null;

    user.lastLogin = new Date().toISOString();
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  }

  verifyToken(token: string): { valid: boolean; error?: string } {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (!decoded || typeof decoded !== 'object') {
        return { valid: false, error: 'Invalid token format' };
      }
      
      // Check if token is expired
      const exp = (decoded as any).exp;
      if (exp && Date.now() >= exp * 1000) {
        return { valid: false, error: 'Token expired' };
      }

      return { valid: true };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return { valid: false, error: 'Token expired' };
      } else if (error instanceof jwt.JsonWebTokenError) {
        return { valid: false, error: 'Invalid token' };
      }
      return { valid: false, error: 'Token verification failed' };
    }
  }

  getUserIdFromToken(token: string): string {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      return decoded.id;
    } catch {
      return 'unknown';
    }
  }

  getUsers(): User[] {
    return Array.from(this.users.values()).map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): User | null {
    const user = Array.from(this.users.values()).find(u => u.id === userId);

    if (!user) {
      return null;
    }

    user.preferences = {
      ...user.preferences,
      ...preferences
    };

    this.users.set(userId, user);

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export const userService = new UserService(); 