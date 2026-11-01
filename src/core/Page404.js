import React from "react";
import {Link} from "react-router-dom";

const Page404 = () => {
    return (
        <div className="st-notfound">
            <div className="st-notfound-panel">
                <h1 className="st-notfound-code">404</h1>
                <h2>Oops! Page not found</h2>
                <p>We are sorry, but the page you requested was not found.</p>
                <Link to="/" className="st-btn st-btn-primary">Back to Home</Link>
            </div>
        </div>
    );
}

export default Page404;