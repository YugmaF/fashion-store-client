import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faBoxOpen, faLayerGroup, faReceipt, faUsers,
    faPlus, faChartPie, faChartLine, faArrowRight
} from "@fortawesome/free-solid-svg-icons";
import AdminLayout from "../admin/AdminLayout";
import {isAuthenticate} from "../auth";
import {getAllProducts, getAllCategories, getAllUsers, listOrders} from "../admin/ApiAdmin";

const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
};

const AdminDashboard = () => {
    const {user, token} = isAuthenticate();
    const role = Number.parseInt(user.role, 10);
    const isAdmin = role === 1;

    const [counts, setCounts] = useState({
        products: null,
        categories: null,
        orders: null,
        users: null
    });

    useEffect(() => {
        getAllProducts().then(data => {
            if (!data || data.error) return;
            setCounts(prev => ({...prev, products: data.length}));
        });

        getAllCategories().then(data => {
            if (!data || data.error) return;
            setCounts(prev => ({...prev, categories: data.length}));
        });

        if (isAdmin) {
            listOrders(user._id, token).then(data => {
                if (!data || data.error) return;
                setCounts(prev => ({...prev, orders: data.length}));
            });

            getAllUsers().then(data => {
                if (!data || data.error) return;
                setCounts(prev => ({...prev, users: data.length}));
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fmt = value => (value === null ? "—" : value);

    const stats = [
        {label: "Products", value: fmt(counts.products), icon: faBoxOpen, colors: ["#e73c7e", "#ff6b6b"], to: "/admin/products"},
        {label: "Categories", value: fmt(counts.categories), icon: faLayerGroup, colors: ["#23a6d5", "#23d5ab"], to: "/admin/categories", adminOnly: true},
        {label: "Online Orders", value: fmt(counts.orders), icon: faReceipt, colors: ["#f59e0b", "#ee7752"], to: "/admin/orders", adminOnly: true},
        {label: "Team Members", value: fmt(counts.users), icon: faUsers, colors: ["#a855f7", "#e73c7e"], to: "/manage/user", adminOnly: true}
    ].filter(stat => !stat.adminOnly || isAdmin);

    const quickLinks = [
        {to: "/create/product", label: "Add a product", desc: "List a new item in the catalog", icon: faPlus, show: true},
        {to: "/create/category", label: "Add a category", desc: "Organize the catalog with a new category", icon: faLayerGroup, show: isAdmin},
        {to: "/create/user", label: "Invite a team member", desc: "Create an admin or store manager account", icon: faUsers, show: isAdmin},
        {to: "/admin/orders", label: "Review orders", desc: "Track and update online order status", icon: faReceipt, show: isAdmin},
        {to: "/admin/sales-dashboard", label: "Sales dashboard", desc: "KPIs, revenue trends and top products", icon: faChartPie, show: isAdmin},
        {to: "/admin/sales-forecast", label: "Sales forecast", desc: "Projected revenue for next quarter", icon: faChartLine, show: isAdmin}
    ].filter(link => link.show);

    return (
        <AdminLayout title="Dashboard" description={`${greeting()}, ${user.name.split(" ")[0]}!`}>
            <div className="ad-hero">
                <div>
                    <h2>Welcome back, {user.name}</h2>
                    <p>{isAdmin ? "Administrator" : "Store Manager"} &middot; {user.email}</p>
                </div>
                <Link to="/admin/products" className="ad-btn ad-btn-primary">
                    Manage products <FontAwesomeIcon icon={faArrowRight}/>
                </Link>
            </div>

            <p className="ad-section-title">Overview</p>
            <div className="ad-stats-grid">
                {stats.map(stat => (
                    <Link to={stat.to} key={stat.label} className="ad-stat-card" style={{textDecoration: "none"}}>
                        <div className="ad-stat-icon" style={{background: `linear-gradient(135deg, ${stat.colors[0]}, ${stat.colors[1]})`}}>
                            <FontAwesomeIcon icon={stat.icon}/>
                        </div>
                        <div>
                            <p className="ad-stat-label">{stat.label}</p>
                            <p className="ad-stat-value">{stat.value}</p>
                        </div>
                    </Link>
                ))}
            </div>

            <p className="ad-section-title">Quick actions</p>
            <div className="ad-stats-grid">
                {quickLinks.map(link => (
                    <Link to={link.to} key={link.to} className="ad-card" style={{textDecoration: "none", padding: "20px 22px", display: "flex", gap: "16px", alignItems: "center"}}>
                        <div className="ad-stat-icon" style={{background: "var(--ad-gradient-brand)"}}>
                            <FontAwesomeIcon icon={link.icon}/>
                        </div>
                        <div>
                            <p className="ad-stat-label" style={{color: "var(--ad-text)", fontSize: "0.85rem", textTransform: "none", letterSpacing: 0}}>
                                {link.label}
                            </p>
                            <p style={{margin: 0, fontSize: "0.78rem", color: "var(--ad-text-muted)"}}>{link.desc}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
