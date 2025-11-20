
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthUser {
    name: string;
    email: string;
}

interface AuthContextType {
    currentUser: AuthUser | null;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (name: string, email: string, password: string) => Promise<void>;
    signOut: () => void;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'habitForgeUsers';
const SESSION_STORAGE_KEY = 'habitForgeSession';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
        try {
            const session = sessionStorage.getItem(SESSION_STORAGE_KEY);
            return session ? JSON.parse(session) : null;
        } catch {
            return null;
        }
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (currentUser) {
            sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(currentUser));
        } else {
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
        }
    }, [currentUser]);

    const getUsers = () => {
        try {
            const users = localStorage.getItem(USERS_STORAGE_KEY);
            return users ? JSON.parse(users) : [];
        } catch {
            return [];
        }
    };

    const saveUsers = (users: any[]) => {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    };

    const signIn = async (email: string, password: string) => {
        setError(null);
        const users = getUsers();
        const user = users.find(u => u.email === email);

        if (user && user.password === password) {
            setCurrentUser({ name: user.name, email: user.email });
        } else {
            setError("Invalid email or password.");
            throw new Error("Invalid email or password.");
        }
    };

    const signUp = async (name: string, email: string, password: string) => {
        setError(null);
        const users = getUsers();
        if (users.some(u => u.email === email)) {
            setError("An account with this email already exists.");
            throw new Error("Email already exists.");
        }

        const newUser = { name, email, password };
        users.push(newUser);
        saveUsers(users);
        setCurrentUser({ name, email });
    };

    const signOut = () => {
        setCurrentUser(null);
    };

    const value = { currentUser, signIn, signUp, signOut, error };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
