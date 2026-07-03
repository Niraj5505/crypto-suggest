import React, { createContext, useContext, useState, useEffect } from 'react';

const WalletContext = createContext(null);

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within WalletProvider');
    }
    return context;
};

export const WalletProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [walletAddress, setWalletAddress] = useState(null);
    const [walletType, setWalletType] = useState('Credentials');
    const [connectedAt, setConnectedAt] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // load user profile from token on startup
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('authToken');
            const savedConnection = localStorage.getItem('walletConnection');
            if (token && savedConnection) {
                try {
                    const conn = JSON.parse(savedConnection);
                    const API_URL = import.meta.env.VITE_API_URL || '/api';
                    const response = await fetch(`${API_URL}/auth/profile`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        const profile = await response.json();
                        setIsConnected(true);
                        setWalletAddress(profile.walletAddress);
                        setUser(profile);
                        setConnectedAt(conn.connectedAt || Date.now());
                    } else {
                        logout();
                    }
                } catch (e) {
                    console.error('Failed to initialize auth:', e);
                    try {
                        const conn = JSON.parse(savedConnection);
                        setIsConnected(true);
                        setWalletAddress(conn.address);
                        setConnectedAt(conn.connectedAt);
                        setUser({
                            username: conn.username,
                            email: conn.email,
                            walletAddress: conn.address
                        });
                    } catch (_) {}
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const register = async (username, email, mobile, password, referrer = null) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || '/api';
            const response = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, mobile, password, referrer })
            });
            const data = await response.json();
            if (!response.ok) {
                return { success: false, error: data.message || 'Registration failed' };
            }

            localStorage.setItem('authToken', data.token);
            const connection = {
                isConnected: true,
                address: data.user.walletAddress,
                username: data.user.username,
                email: data.user.email,
                connectedAt: Date.now()
            };
            localStorage.setItem('walletConnection', JSON.stringify(connection));

            setIsConnected(true);
            setWalletAddress(data.user.walletAddress);
            setConnectedAt(connection.connectedAt);
            setUser(data.user);

            return { success: true, user: data.user };
        } catch (e) {
            return { success: false, error: e.message };
        }
    };

    const login = async (identifier, password) => {
        try {
            const API_URL = import.meta.env.VITE_API_URL || '/api';
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password })
            });
            const data = await response.json();
            if (!response.ok) {
                return { success: false, error: data.message || 'Login failed' };
            }

            localStorage.setItem('authToken', data.token);
            const connection = {
                isConnected: true,
                address: data.user.walletAddress,
                username: data.user.username,
                email: data.user.email,
                connectedAt: Date.now()
            };
            localStorage.setItem('walletConnection', JSON.stringify(connection));

            setIsConnected(true);
            setWalletAddress(data.user.walletAddress);
            setConnectedAt(connection.connectedAt);
            setUser(data.user);

            return { success: true, user: data.user };
        } catch (e) {
            return { success: false, error: e.message };
        }
    };

    const logout = () => {
        setIsConnected(false);
        setWalletAddress(null);
        setConnectedAt(null);
        setUser(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('walletConnection');
    };

    const getTruncatedAddress = () => {
        if (user && user.username) {
            return `@${user.username}`;
        }
        if (!walletAddress) return '';
        return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
    };

    const value = {
        isConnected,
        walletAddress,
        walletType: 'Credentials',
        connectedAt,
        user,
        loading,
        register,
        login,
        logout,
        disconnectWallet: logout,
        connectWallet: login,
        getTruncatedAddress
    };

    return (
        <WalletContext.Provider value={value}>
            {children}
        </WalletContext.Provider>
    );
};
