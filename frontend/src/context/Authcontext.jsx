import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Import without curly braces
import axios from '../config/axiosConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [bhakt, setBhakt] = useState(null); // Start with null to handle undefined case
    const [loading, setLoading] = useState(true);

    // Function to get cookie by name
    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
        return null;
    };

    // Function to verify token
    const verifyToken = async () => {
        const token = getCookie('uid');
        if (token) {
            try {
                const response = await axios.post('/api/verifyToken', { token });
                if (response.data.success) {
                    const decodedToken = jwtDecode(token);
                    setBhakt(decodedToken);
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                    setBhakt(null); // Clear bhakt if verification fails
                }
            } catch (error) {
                console.error('Verification failed:', error);
                setIsAuthenticated(false);
                setBhakt(null); // Clear bhakt in case of error
            }
        } else {
            setIsAuthenticated(false);
            setBhakt(null); // Clear bhakt if no token is present
        }
        setLoading(false);
    };

    useEffect(() => {
        verifyToken();
    }, []); // No dependencies needed, runs only once

    return (
        <AuthContext.Provider value={{ isAuthenticated, bhakt, loading, verifyToken}}>
            {children}
        </AuthContext.Provider>
    );
};