"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import { storage } from "@/lib/storage";
import type { User } from "@/types";

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Check for logged in user in localStorage
        const storedUser = localStorage.getItem("tfm_auth_user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse auth user", e);
                localStorage.removeItem("tfm_auth_user");
            }
        }
    }, []);

    const login = async (username: string, password: string): Promise<boolean> => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const users = storage.getUsers();
        const foundUser = users.find(
            (u) => u.username === username && u.password === password
        );

        if (foundUser) {
            const { password: _, ...userWithoutPassword } = foundUser;
            setUser(userWithoutPassword as User);
            localStorage.setItem("tfm_auth_user", JSON.stringify(userWithoutPassword));
            return true;
        }

        return false;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("tfm_auth_user");
        router.push("/login");
    };

    return (
        <AuthContext.Provider
      value= {{
        user,
            login,
            logout,
            isAuthenticated: !!user,
      }
}
    >
    { children }
    </AuthContext.Provider>
  );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
