import React, {Component} from "react";
import {Route, Redirect} from "react-router-dom";
import { isAuthenticate } from "./index";

const AdminRoute = ({component: Component, ...rest}) => (
    <Route {...rest} render={props => isAuthenticate() && (Number.parseInt(isAuthenticate().user.role) === 1 || Number.parseInt(isAuthenticate().user.role) === 2) ? (
        <Component {...props} />
    ) : (
        <Redirect to={{pathname: '/signin', state: {from: props.location}}} />
    )}/>
);

export default AdminRoute;
