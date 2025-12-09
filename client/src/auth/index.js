import React, { createContext, useEffect, useState } from "react";
import { useHistory } from 'react-router-dom';
import storeRequestSender from '../store/requests';

const AuthContext = createContext();

export const AuthActionType = {
    GET_LOGGED_IN: "GET_LOGGED_IN",
    LOGIN_USER: "LOGIN_USER",
    LOGOUT_USER: "LOGOUT_USER",
    REGISTER_USER: "REGISTER_USER",
    SET_ERROR: "SET_ERROR",
    SET_GUEST: "SET_GUEST"
}

function AuthContextProvider(props) {
    const [auth, setAuth] = useState({
        user: null,
        loggedIn: false,
        isGuest: false,
        error: null
    });
    const history = useHistory();

    useEffect(() => {
        auth.getLoggedIn();
    }, []);

    const authReducer = (action) => {
        const { type, payload } = action;
        switch (type) {
            case AuthActionType.GET_LOGGED_IN: {
                return setAuth({
                    user: payload.user,
                    loggedIn: payload.loggedIn,
                    isGuest: false,
                    error: null
                });
            }
            case AuthActionType.LOGIN_USER: {
                return setAuth({
                    user: payload.user,
                    loggedIn: true,
                    isGuest: false,
                    error: null
                })
            }
            case AuthActionType.LOGOUT_USER: {
                return setAuth({
                    user: null,
                    loggedIn: false,
                    isGuest: false,
                    error: null
                })
            }
            case AuthActionType.REGISTER_USER: {
                return setAuth({
                    user: payload.user,
                    loggedIn: true,
                    isGuest: false,
                    error: null
                })
            }
            case AuthActionType.SET_ERROR: {
                return setAuth({
                    ...auth,
                    error: payload.error
                })
            }
            case AuthActionType.SET_GUEST: {
                return setAuth({
                    user: null,
                    loggedIn: false,
                    isGuest: true,
                    error: null
                })
            }
            default:
                return auth;
        }
    }

    auth.getLoggedIn = async function () {
        try {
            const response = await storeRequestSender.getLoggedIn();
            if (response.status === 200) {
                authReducer({
                    type: AuthActionType.GET_LOGGED_IN,
                    payload: {
                        loggedIn: response.data.loggedIn,
                        user: response.data.user
                    }
                });
            }
        } catch (err) {
            console.log("Not logged in");
        }
    }

    auth.registerUser = async function(firstName, lastName, userName, email, password, passwordVerify) {
        try {
            const response = await storeRequestSender.register(firstName, lastName, userName, email, password, passwordVerify);
            if (response.status === 200) {
                authReducer({
                    type: AuthActionType.REGISTER_USER,
                    payload: {
                        user: response.data.user
                    }
                })
                history.push("/");
            }
        } catch (err) {
            authReducer({
                type: AuthActionType.SET_ERROR,
                payload: {
                    error: err.response?.data?.errorMessage || "Registration failed"
                }
            });
        }
    }

    auth.loginUser = async function(email, password) {
        try {
            const response = await storeRequestSender.login(email, password);
            if (response.status === 200) {
                authReducer({
                    type: AuthActionType.LOGIN_USER,
                    payload: {
                        user: response.data.user
                    }
                })
                history.push("/");
            }
        } catch (err) {
            authReducer({
                type: AuthActionType.SET_ERROR,
                payload: {
                    error: err.response?.data?.errorMessage || "Login failed"
                }
            });
        }
    }

    auth.logoutUser = async function() {
        try {
            await storeRequestSender.logout();
            authReducer({
                type: AuthActionType.LOGOUT_USER,
                payload: null
            })
            history.push("/");
        } catch (err) {
            console.log("Logout error:", err);
        }
    }

    auth.continueAsGuest = function() {
        authReducer({
            type: AuthActionType.SET_GUEST,
            payload: null
        });
        history.push("/");
    }

    auth.clearError = function() {
        authReducer({
            type: AuthActionType.SET_ERROR,
            payload: { error: null }
        });
    }

    return (
        <AuthContext.Provider value={{ auth }}>
            {props.children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
export { AuthContextProvider };
