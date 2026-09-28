import React from "react";
import { Link } from "react-router-dom";
import { isAuthenticate } from "../auth";
import AdminLayout, { initials } from "../admin/AdminLayout";
import {
    faTags,
    faBoxOpen,
    faUserPlus,
    faUsersCog,
    faClipboardList
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const QUICK_LINKS = [
    { to: "/create/category", label: "Create Category", icon: faTags, roles: [1] },
    { to: "/create/product", label: "Create Product", icon: faBoxOpen, roles: [1, 2] },
    { to: "/create/user", label: "Create User", icon: faUserPlus, roles: [1] },
    { to: "/admin/categories", label: "Manage Categories", icon: faTags, roles: [1] },
    { to: "/admin/products", label: "Manage Products", icon: faBoxOpen, roles: [1, 2] },
    { to: "/manage/user", label: "Manage Users", icon: faUsersCog, roles: [1] },
    { to: "/admin/orders", label: "View Orders", icon: faClipboardList, roles: [1] }
];

const AdminDashboard = () => {
    const { user: { name, email, role } } = isAuthenticate();
    const roleId = Number.parseInt(role);
    const roleLabel = roleId === 1 ? "Admin" : "Store Manager";
    const links = QUICK_LINKS.filter(link => link.roles.includes(roleId));

    return (
        <AdminLayout title="Dashboard" description={`Welcome back, ${name}!`}>
            <div className="admin-card">
                <div className="admin-card-header">
                    <div className="admin-profile">
                        <div className="admin-profile-avatar">{initials(name)}</div>
                        <div>
                            <div className="admin-profile-name">{name}</div>
                            <div className="admin-profile-meta">{email}</div>
                        </div>
                    </div>
                    <span className="admin-role-pill">{roleLabel}</span>
                </div>
                <div className="admin-quicklinks">
                    {links.map(link => (
                        <Link key={link.to} className="admin-quicklink" to={link.to}>
                            <span className="admin-quicklink-icon">
                                <FontAwesomeIcon icon={link.icon} />
                            </span>
                            <span className="admin-quicklink-label">{link.label}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
