import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

// In-memory user store for demo (in production, use a real database)
// This simulates a database - in production, replace with Prisma, MongoDB, etc.
interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  createdAt: string;
  avatar?: string;
}

// Simple file-based storage simulation
// In production, replace this with actual database calls
const USERS_STORAGE_KEY = "docgen_users";

function getUsers(): User[] {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }
  return [];
}

function saveUsers(users: User[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }
}

export async function createUser(email: string, password: string, name: string): Promise<User | null> {
  const users = getUsers();
  
  // Check if user already exists
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return null;
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser: User = {
    id: uuidv4(),
    email: email.toLowerCase(),
    name,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
  };
  
  users.push(newUser);
  saveUsers(users);
  
  return newUser;
}

export async function validateUser(email: string, password: string): Promise<User | null> {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) return null;
  
  const isValid = await bcrypt.compare(password, user.password);
  return isValid ? user : null;
}

export async function getUserById(id: string): Promise<User | null> {
  const users = getUsers();
  return users.find(u => u.id === id) || null;
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  
  if (index === -1) return null;
  
  users[index] = { ...users[index], ...updates };
  saveUsers(users);
  
  return users[index];
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        action: { label: "Action", type: "text" }, // "login" or "signup"
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        const action = credentials.action || "login";

        if (action === "signup") {
          if (!credentials.name) {
            throw new Error("Name required for signup");
          }
          
          const existingUser = await validateUser(credentials.email, credentials.password);
          if (existingUser) {
            throw new Error("User already exists");
          }
          
          const newUser = await createUser(
            credentials.email,
            credentials.password,
            credentials.name
          );
          
          if (!newUser) {
            throw new Error("Email already registered");
          }
          
          return {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
          };
        } else {
          // Login
          const user = await validateUser(credentials.email, credentials.password);
          
          if (!user) {
            throw new Error("Invalid email or password");
          }
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/", // We'll handle sign in with a modal
  },
  secret: process.env.NEXTAUTH_SECRET || "docgen-secret-key-change-in-production",
};

