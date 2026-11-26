'use client'
import React from "react";
import { Provider } from "react-redux";
import { store } from "./store";
import CartPersist from "./cart-persist";

const ReduxProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <Provider store={store}>
            <CartPersist />
            {children}
        </Provider>
    )
}

export default ReduxProvider
