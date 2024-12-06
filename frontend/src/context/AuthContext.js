import { createContext, useState, useEffect, useCallback } from "react";
import {jwtDecode} from "jwt-decode"; // Corrected import
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import api from '../api'; 
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
          const response = await api.post('token/', { email, password });
      
          const data = response.data;
      
          if (data.access && isValidJWT(data.access)) {
            setAuthTokens(data);
            setUser(jwtDecode(data.access));
            localStorage.setItem('authTokens', JSON.stringify(data));
            navigate('/');
      
            Swal.fire({
              title: 'Login Successful',
              icon: 'success',
              toast: true,
              timer: 3000,
              position: 'bottom-right',
              timerProgressBar: true,
              showConfirmButton: false,
            });
          } else {
            throw new Error('Invalid token received.');
          }
        } catch (error) {
          Swal.fire({
            title: 'Login Failed',
            text: 'Email or password is incorrect.',
            icon: 'error',
            toast: true,
            timer: 3000,
            position: 'bottom-right',
            timerProgressBar: true,
            showConfirmButton: false,
          });
          throw new Error(error.response?.data?.detail || 'Login failed. Please try again.');
        }
      };

    // Function to register user
    const registerUser = async (email, username, password, password2, ageRange, phone, location) => {
        // Client-side validation for password mismatch
        if (password !== password2) {
            Swal.fire({
                title: "Registration Failed",
                text: "Passwords do not match. Please check and try again.",
                icon: "error",
                timer: 6000,
                position: "bottom-right",
                showConfirmButton: true,
            });
            return;
        }
    
        try {
            const response = await api.post('register/', {
                email,
                username,
                password,
                password2,
                age_range: ageRange,
                phone,
                location,
            });
    
            const data = await response.json();
    
            if (response.ok) {
                Swal.fire({
                    title: "Registration Successful, Login Now",
                    icon: "success",
                    toast: true,
                    timer: 6000,
                    position: "bottom-right",
                    timerProgressBar: true,
                    showConfirmButton: false,
                });
                navigate("/login");
            } else {
                let errorMessage = "Registration failed. Please try again.";
    
                // Handle specific server-side validation errors
                if (data.email) {
                    errorMessage = `Email: ${data.email[0]}`;
                }
                if (data.username) {
                    errorMessage += ` Username: ${data.username[0]}`;
                }
                if (data.password) {
                    if (data.password[0].toLowerCase().includes("weak")) {
                        errorMessage += ` Password: Your password is too weak.`;
                    } else {
                        errorMessage += ` Password: ${data.password[0]}`;
                    }
                }
                if (data.non_field_errors) {
                    errorMessage += ` ${data.non_field_errors[0]}`;
                }
    
                Swal.fire({
                    title: "Registration Failed",
                    text: errorMessage,
                    icon: "error",
                    timer: 6000,
                    position: "bottom-right",
                    showConfirmButton: true,
                });
    
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error("Error during registration:", error);
            Swal.fire({
                title: "Unexpected Error",
                text: "Something went wrong. Please try again later.",
                icon: "error",
                timer: 6000,
                position: "bottom-right",
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
                const response = await api.post('token/refresh/', {
                    refresh: authTokens.refresh,
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
        } else if (authTokens) {
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
