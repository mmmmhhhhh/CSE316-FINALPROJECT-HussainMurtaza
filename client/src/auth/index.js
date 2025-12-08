import React, { createContext, useEffect, useState } from "react";
import { useHistory } from 'react-router-dom'
import authRequestSender from './requests'

const AuthContext = createContext();
console.log("create AuthContext: " + AuthContext);

export const AuthActionType = {
    GET_LOGGED_IN: "GET_LOGGED_IN",
    LOGIN_USER: "LOGIN_USER",
    LOGOUT_USER: "LOGOUT_USER",
    REGISTER_USER: "REGISTER_USER",
    LOGIN_GUEST: "LOGIN_GUEST"
}

function AuthContextProvider(props) {
    const [auth, setAuth] = useState({
        user: null,
        loggedIn: false,
        isGuest: false,
        errorMessage: null
    });
    const history = useHistory();
    
    const setError = (message) => {
        setAuth((prev) => ({
            ...prev,
            errorMessage: message
        }));
    };

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
                    errorMessage: null
                });
            }
            case AuthActionType.LOGIN_USER: {
                return setAuth({
                    user: payload.user,
                    loggedIn: payload.loggedIn,
                    isGuest: false,
                    errorMessage: payload.errorMessage
                })
            }
            case AuthActionType.LOGOUT_USER: {
                return setAuth({
                    user: null,
                    loggedIn: false,
                    isGuest: false,
                    errorMessage: null
                })
            }
            case AuthActionType.REGISTER_USER: {
                return setAuth({
                    user: payload.user,
                    loggedIn: payload.loggedIn,
                    isGuest: false,
                    errorMessage: payload.errorMessage
                })
            }
            case AuthActionType.LOGIN_GUEST: {
                return setAuth({
                    user: null,
                    loggedIn: false,
                    isGuest: true,
                    errorMessage: null
                })
            }
            default:
                return auth;
        }
    }

    auth.getLoggedIn = async function () {
        try {
            const response = await authRequestSender.getLoggedIn();
            authReducer({
                type: AuthActionType.GET_LOGGED_IN,
                payload: {
                    loggedIn: response.loggedIn,
                    user: response.user
                }
            });
        } catch (error) {
            authReducer({
                type: AuthActionType.GET_LOGGED_IN,
                payload: {
                    loggedIn: false,
                    user: null
                }
            });
        }
    }

    auth.registerUser = async function (firstName, lastName, email, password, passwordVerify) {
        console.log("REGISTERING USER");
        try {
            const response = await authRequestSender.registerUser(firstName, lastName, email, password, passwordVerify);
            console.log("Registered Successfully");
            authReducer({
                type: AuthActionType.REGISTER_USER,
                payload: {
                    user: response.user,
                    loggedIn: true,
                    errorMessage: null
                }
            })
            history.push("/login");
            console.log("NOW WE LOGIN");
            auth.loginUser(email, password);
            console.log("LOGGED IN");
        } catch (error) {
            authReducer({
                type: AuthActionType.REGISTER_USER,
                payload: {
                    user: auth.user,
                    loggedIn: false,
                    errorMessage: error.message || "Registration failed"
                }
            })
        }
    }

    auth.loginUser = async function (email, password) {
        try {
            const response = await authRequestSender.loginUser(email, password);
            authReducer({
                type: AuthActionType.LOGIN_USER,
                payload: {
                    user: response.user,
                    loggedIn: true,
                    errorMessage: null
                }
            })
            history.push("/");
        } catch (error) {
            authReducer({
                type: AuthActionType.LOGIN_USER,
                payload: {
                    user: auth.user,
                    loggedIn: false,
                    errorMessage: error.message || "Login failed"
                }
            })
        }
    }

    auth.loginAsGuest = function () {
        authReducer({
            type: AuthActionType.LOGIN_GUEST,
            payload: null
        })
        history.push("/");
    }

    auth.logoutUser = async function () {
        try {
            await authRequestSender.logoutUser();
            authReducer({
                type: AuthActionType.LOGOUT_USER,
                payload: null
            })
            history.push("/");
        } catch (error) {
            console.error("Logout error:", error);
            // Even if logout fails on server, clear local state
            authReducer({
                type: AuthActionType.LOGOUT_USER,
                payload: null
            })
            history.push("/");
        }
    }

    auth.getUserInitials = function () {
        let initials = "";
        if (auth.user) {
            initials += auth.user.firstName.charAt(0);
            initials += auth.user.lastName.charAt(0);
        }
        return initials;
    }

    return (
        <AuthContext.Provider value={{
            auth,
            setError
        }}>
            {props.children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
export { AuthContextProvider };
