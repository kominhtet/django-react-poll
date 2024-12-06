import { createContext, useState, useEffect, useCallback } from "react";
import {jwtDecode} from "jwt-decode"; // Corrected import
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';

const AuthContext = createContext();
export default AuthContext;

const isValidJWT = (token) => {
    try {
        const decoded = jwtDecode(token);
        return decoded.exp * 1000 > Date.now();
    } catch {
        return false;
    }
};

export const AuthProvider = ({ children }) => {
    const [authTokens, setAuthTokens] = useState(() => {
        const tokens = localStorage.getItem("authTokens");
        return tokens ? JSON.parse(tokens) : null;
    });
    const [user, setUser] = useState(() => authTokens && isValidJWT(authTokens.access) ? jwtDecode(authTokens.access) : null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const saveTokens = (tokens) => {
        setAuthTokens(tokens);
        localStorage.setItem("authTokens", JSON.stringify(tokens));
    };

    const loginUser = async (email, password) => {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/token/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (response.ok && data.access && isValidJWT(data.access)) {
                saveTokens(data);
                setUser(jwtDecode(data.access));
                navigate("/");

                Swal.fire({
                    title: "Login Successful",
                    icon: "success",
                    toast: true,
                    timer: 3000,
                    position: 'bottom-right',
                    timerProgressBar: true,
                    showConfirmButton: false,
                });
            } else {
                throw new Error("Invalid login credentials.");
            }
        } catch (error) {
            Swal.fire({
                title: "Login Failed",
                text: error.message,
                icon: "error",
                position: 'bottom-right',
                showConfirmButton: true,
            });
        }
    };

    const registerUser = async (email, username, password, password2) => {
        try {
            const response = await fetch("http://127.0.0.1:8000/api/register/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, username, password, password2 })
            });
            const data = await response.json();

            if (response.ok) {
                navigate("/login");
                Swal.fire({
                    title: "Registration Successful, Login Now",
                    icon: "success",
                    toast: true,
                    timer: 6000,
                    position: 'bottom-right',
                    timerProgressBar: true,
                    showConfirmButton: false,
                });
            } else {
                throw new Error(data.detail || "Registration failed.");
            }
        } catch (error) {
            Swal.fire({
                title: "Registration Failed",
                text: error.message,
                icon: "error",
                position: 'bottom-right',
                showConfirmButton: true,
            });
        }
    };

    const logoutUser = useCallback(() => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem("authTokens");
        Swal.fire({
            title: "Logout Successful",
            icon: "success",
            toast: true,
            timer: 3000,
            position: 'bottom-right',
            timerProgressBar: true,
            showConfirmButton: false,
        });
        navigate("/login");
    }, [navigate]);

    const refreshToken = useCallback(async () => {
        if (authTokens && authTokens.refresh) {
            try {
                const response = await fetch("http://127.0.0.1:8000/api/token/refresh/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refresh: authTokens.refresh })
                });
                const data = await response.json();

                if (response.ok) {
                    saveTokens({ ...authTokens, access: data.access });
                    setUser(jwtDecode(data.access));
                } else {
                    logoutUser();
                }
            } catch {
                logoutUser();
            }
        }
    }, [authTokens, logoutUser]);

    useEffect(() => {
        if (authTokens && isValidJWT(authTokens.access)) {
            setUser(jwtDecode(authTokens.access));
        } else {
            logoutUser();
        }
        setLoading(false);

        const interval = setInterval(() => {
            refreshToken();
        }, 15 * 60 * 1000);

        return () => clearInterval(interval);
    }, [authTokens, logoutUser, refreshToken]);

    const contextData = {
        user,
        authTokens,
        loginUser,
        registerUser,
        logoutUser,
        loading
    };

    return (
        <AuthContext.Provider value={contextData}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
