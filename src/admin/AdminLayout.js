import React, {useState} from "react";
import {Link, withRouter} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faTachometerAlt, faBoxOpen, faLayerGroup, faReceipt, faUsers,
    faChartLine, faChartPie, faPlus, faBars, faTimes,
    faArrowLeft, faSignOutAlt
} from "@fortawesome/free-solid-svg-icons";
import {isAuthenticate, signout} from "../auth";
import "./adminTheme.css";

const NAV_ITEMS = [
    {
        section: "Overview",
        links: [
            {to: "/admin/dashboard", label: "Dashboard", icon: faTachometerAlt, roles: [1, 2]}
        ]
    },
    {
        section: "Catalog",
        links: [
            {to: "/admin/products", label: "Products", icon: faBoxOpen, roles: [1, 2]},
            {to: "/create/product", label: "Add Product", icon: faPlus, roles: [1, 2]},
            {to: "/admin/categories", label: "Categories", icon: faLayerGroup, roles: [1]},
            {to: "/create/category", label: "Add Category", icon: faPlus, roles: [1]}
        ]
    },
    {
        section: "Sales",
        links: [
            {to: "/admin/orders", label: "Orders", icon: faReceipt, roles: [1]},
            {to: "/admin/sales-dashboard", label: "Sales Dashboard", icon: faChartPie, roles: [1]},
            {to: "/admin/sales-forecast", label: "Sales Forecast", icon: faChartLine, roles: [1]}
        ]
    },
    {
        section: "Team",
        links: [
            {to: "/manage/user", label: "All Users", icon: faUsers, roles: [1]},
            {to: "/create/user", label: "Add User", icon: faPlus, roles: [1]}
        ]
    }
];

const initials = name => (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join("");

const AdminLayout = ({
    title = "",
    description = "",
    back = false,
    backText = "Back",
    to = "/admin/dashboard",
    actions = null,
    children,
    history
}) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const auth = isAuthenticate();
    const user = auth ? auth.user : {name: "", role: "1"};
    const role = Number.parseInt(user.role, 10);
    const currentPath = history.location.pathname;

    const closeSidebar = () => setSidebarOpen(false);

    const handleSignOut = () => {
        signout(() => history.push("/signin"));
    };

    return (
        <div className="ad-shell">
            <div
                className={`ad-sidebar-overlay ${sidebarOpen ? "is-open" : ""}`}
                onClick={closeSidebar}
            />

            <aside className={`ad-sidebar ${sidebarOpen ? "is-open" : ""}`}>
                <div className="ad-sidebar-brand">
                    <div className="ad-sidebar-logo">FS</div>
                    <div className="ad-sidebar-brand-text">
                        <h1>Fashion Store</h1>
                        <span>Admin Console</span>
                    </div>
                    <button className="ad-sidebar-close" onClick={closeSidebar} aria-label="Close menu">
                        <FontAwesomeIcon icon={faTimes}/>
                    </button>
                </div>

                <nav className="ad-nav">
                    {NAV_ITEMS.map(group => {
                        const links = group.links.filter(link => link.roles.includes(role));
                        if (links.length === 0) {
                            return null;
                        }
                        return (
                            <div className="ad-nav-section" key={group.section}>
                                <p className="ad-nav-section-label">{group.section}</p>
                                {links.map(link => (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        onClick={closeSidebar}
                                        className={`ad-nav-link ${currentPath === link.to ? "active" : ""}`}
                                    >
                                        <FontAwesomeIcon icon={link.icon}/>
                                        {link.label}
                                    </Link>
                                ))}
                            </div>
                        );
                    })}
                </nav>

                <div className="ad-sidebar-footer">
                    <div className="ad-sidebar-user">
                        <div className="ad-sidebar-avatar">{initials(user.name)}</div>
                        <div className="ad-sidebar-user-info">
                            <p>{user.name}</p>
                            <span>{role === 1 ? "Administrator" : "Store Manager"}</span>
                        </div>
                    </div>
                    <button className="ad-sidebar-signout" onClick={handleSignOut}>
                        <FontAwesomeIcon icon={faSignOutAlt}/> Sign out
                    </button>
                </div>
            </aside>

            <div className="ad-main">
                <header className="ad-topbar">
                    <div className="ad-topbar-left">
                        <button
                            className="ad-topbar-menu-btn"
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Open menu"
                        >
                            <FontAwesomeIcon icon={faBars}/>
                        </button>
                        {back && (
                            <Link className="ad-topbar-back" to={to} title={backText}>
                                <FontAwesomeIcon icon={faArrowLeft}/>
                            </Link>
                        )}
                        <div className="ad-topbar-titles">
                            <h1>{title}</h1>
                            {description && <p>{description}</p>}
                        </div>
                    </div>
                    {actions && <div className="ad-topbar-actions">{actions}</div>}
                </header>

                <main className="ad-content">{children}</main>

                <footer className="ad-page-footer">
                    Fashion Store Admin Console &middot; {new Date().getFullYear()}
                </footer>
            </div>
        </div>
    );
};

export default withRouter(AdminLayout);
