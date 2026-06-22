import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserProfile, loginUser as loginApi, registerUser as registerApi, updateUserProfile, verifyOtp as verifyOtpApi, resendOtp as resendOtpApi } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    const profile = await getUserProfile();
                    setUser(profile);
                } catch (error) {
                    console.error('Failed to load user profile on startup:', error);
                    // Clear invalid token
                    logout();
                }
            }
            setLoading(false);
        };
        loadUser();
    }, [token]);

    const login = async (email, password) => {
        try {
            const data = await loginApi(email, password);
            localStorage.setItem('authToken', data.token);
            setToken(data.token);
            setUser(data.user);
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const register = async (name, email, password) => {
        try {
            await registerApi(name, email, password);
            return { success: true };
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
    };

    const updateProfile = async (profileData) => {
        try {
            const updatedUser = await updateUserProfile(profileData);
            setUser(updatedUser);
            return updatedUser;
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    };

    const value = {
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        updateProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
