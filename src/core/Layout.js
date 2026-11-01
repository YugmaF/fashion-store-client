import React from "react";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {Link} from "react-router-dom";
import Tooltip from '@material-ui/core/Tooltip';

const Layout = ({
                    title = 'Title',
                    description = 'Description',
                    className,
                    back = false,
                    backText = '',
                    to = '',
                    children
                }) => (
    <div className="container">
        <div className="st-page-hero">
            {
                back ? <div className="d-flex align-items-center gap-3">
                    <div className="mr-3">
                        <Tooltip title={backText} placement="bottom-end">
                            <Link to={to}>
                                <span className="btn st-btn-outline"><FontAwesomeIcon icon={faArrowLeft}/></span>
                            </Link>
                        </Tooltip>
                    </div>
                    <div className="mr-3">
                        <h1>{title}</h1>
                        <p>{description}</p>
                    </div>
                </div> : <div>
                    <h1>{title}</h1>
                    <p>{description}</p>
                </div>
            }
        </div>
        <div className={className}>{children}</div>
    </div>
);

export default Layout;
