import { apiBaseUrl } from "../../utils/constants";

export const GET_USER_LOGIN_DATA = 'GET_USER_LOGIN_DATA';
export const USER_LOGGING_IN = 'USER_LOGGING_IN';
export const UPDATE_USER_AUTH = 'UPDATE_USER_AUTH';
export const SET_NEW_USER_DATA = 'SET_NEW_USER_DATA';
export const CREATE_NEW_USER = 'CREATE_NEW_USER';
export const SET_FORGOT_PASSWORD_DATA = 'SET_FORGOT_PASSWORD_DATA';
export const SET_USER_DATA = 'SET_USER_DATA';
export const SET_SHIPPING_CITIES = 'SET_SHIPPING_CITIES';
export const SET_SHIPPING_PVZ = 'SET_SHIPPING_PVZ';


export const loginFunc = (userLoginData) => {

    const data = {
        'identifier': userLoginData.login,
        'password': userLoginData.password,
    }

    return function(dispatch) {
        fetch (`${apiBaseUrl}/api/auth/local`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': '',


            },

            body: JSON.stringify(data),
        })
        .then(res => res.json())
        .then((res) => {
            //console.log(res);
            localStorage.setItem('authToken', res.jwt);
            dispatch({
                type: USER_LOGGING_IN,
                token: res.jwt,
                id: res.user.id,
                email: res.user.email,
                username: res.user.username,
            });
            
        });
    }
}


export const updateAuth = (token) => {

    return function(dispatch) {
        fetch (`${apiBaseUrl}/api/users/me`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,


            }
        })
        .then(res => res.json())
        .then((res) => {
            //console.log(res);
            if (!res.error) {
                dispatch({
                    type: UPDATE_USER_AUTH,
                    id: res.id,
                    username: res.username,
                    email: res.email,
                    token: token
                })
            }
        })
    }
}


export const createNewUser = (registerFormData) => {


    const data = {
        'username': registerFormData.name,
        'email': registerFormData.email,
        'password': registerFormData.password
    }



    return function(dispatch) {

        fetch (`${apiBaseUrl}/api/auth/local/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': '',
                'Host': 'pnhdstudioapi.ru',
            },
            body: JSON.stringify(data),
        })
        .then(res => res.json())
        .then((res) => {
            localStorage.setItem('authToken', res.jwt);
            dispatch({
                type: CREATE_NEW_USER,
                token: res.jwt,
                username: res.user.username,
                id: res.user.id,
                email: res.user.email,
            })
        })
    }
}





export const forgotPasswordRequest = (forgotPasswordData) => {

    //console.log(forgotPasswordData);

    return function(dispatch) {

        fetch (`${apiBaseUrl}/api/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': '',
                'Host': 'pnhdstudioapi.ru',
            },
            body: JSON.stringify({'email': forgotPasswordData})
        })
        .then(res => res.json())
        .then(res => console.log(res))
    }
} 