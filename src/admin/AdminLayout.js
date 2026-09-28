import React from "react";
import { Link, withRouter } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faTachometerAlt,
    faTags,
    faBoxOpen,
    faUserPlus,
    faUsersCog,
    faClipboardList,
    faArrowLeft
} from "@fortawesome/free-solid-svg-icons";
import { isAuthenticate } from "../auth";
import "./AdminStyles.css";

const ADMIN_ROLE = 1;

const NAV_ITEMS = [
    { to: "/admin/dashboard", label: "Dashboard", icon: faTachometerAlt, roles: [1, 2] },
    { to: "/create/category", label: "Create Category", icon: faTags, roles: [1] },
    { to: "/create/product", label: "Create Product", icon: faBoxOpen, roles: [1, 2] },
    { to: "/create/user", label: "Create User", icon: faUserPlus, roles: [1] },
    { to: "/admin/categories", label: "Manage Categories", icon: faTags, roles: [1] },
    { to: "/admin/products", label: "Manage Products", icon: faBoxOpen, roles: [1, 2] },
    { to: "/manage/user", label: "Manage Users", icon: faUsersCog, roles: [1] },
    { to: "/admin/orders", label: "View Orders", icon: faClipboardList, roles: [1] }
];

const initials = (name = "") =>
    name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0].toUpperCase())
        .join("") || "A";

const AdminLayout = ({
    title,
    description,
    backTo,
    backText,
    history,
    children
}) => {
    const auth = isAuthenticate();
    const role = auth && auth.user ? Number.parseInt(auth.user.role) : null;
    const items = NAV_ITEMS.filter(item => role && item.roles.includes(role));
    const currentPath = history ? history.location.pathname : "";

    return (
        <div className="admin-shell">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-brand">
                    <FontAwesomeIcon icon={faTachometerAlt} />
                    {role === ADMIN_ROLE ? "Admin Panel" : "Store Manager Panel"}
                </div>
                <nav className="admin-sidebar-nav">
                    {items.map(item => (
                        <Link
                            key={item.to}
                            to={item.to}
                            className={`admin-nav-link${currentPath === item.to ? " is-active" : ""}`}
                        >
                            <FontAwesomeIcon icon={item.icon} className="admin-nav-icon" />
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </aside>
            <div className="admin-content">
                <header className="admin-header">
                    {backTo && (
                        <Link className="admin-back-link" to={backTo} title={backText}>
                            <FontAwesomeIcon icon={faArrowLeft} />
                        </Link>
                    )}
                    <div>
                        <h1 className="admin-title">{title}</h1>
                        {description && <p className="admin-description">{description}</p>}
                    </div>
                </header>
                <main className="admin-main">{children}</main>
            </div>
        </div>
    );
};

export default withRouter(AdminLayout);
export { initials };
