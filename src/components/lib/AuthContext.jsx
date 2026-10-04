import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [isLoadingAuth, setIsLoadingAuth] = useState(false);
    const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
    const [authError, setAuthError] = useState(null);
    const [authChecked, setAuthChecked] = useState(true);
    const [appPublicSettings, setAppPublicSettings] = useState(null);

    const logout = (shouldRedirect = true) => {
        setUser(null);
        setIsAuthenticated(false);

        if (shouldRedirect) {
            // 必要に応じてログアウト後のリダイレクト処理を記述
            window.location.href = '/login';
        }
    };

    const navigateToLogin = () => {
        window.location.href = `${import.meta.env.BASE_URL}login`.replace(/\/{2,}/g, '/');
    };

    const checkUserAuth = async () => {
        setAuthChecked(true);
        setIsLoadingAuth(false);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            isLoadingAuth,
            isLoadingPublicSettings,
            authError,
            appPublicSettings,
            authChecked,
            logout,
            navigateToLogin,
            checkUserAuth,
            setUser,
            setIsAuthenticated
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};