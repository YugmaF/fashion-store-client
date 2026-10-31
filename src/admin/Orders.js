import React, {useEffect, useState} from "react";
import AdminLayout from "./AdminLayout";
import {isAuthenticate} from "../auth";
import {listOrders, getStatusValues, updateOrderStatus} from "./ApiAdmin";
import moment from 'moment';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faReceipt, faUser, faMapMarkerAlt, faCreditCard} from "@fortawesome/free-solid-svg-icons";

const STATUS_PILL = {
    Delivered: 'ad-pill-success',
    Processing: 'ad-pill-warning',
    Shipped: 'ad-pill-purple',
    Received: 'ad-pill-info',
    Cancelled: 'ad-pill-danger',
};

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [statusValues, setStatusValues] = useState([]);

    const {user, token} = isAuthenticate();

    const loadOrders = () => {
        listOrders(user._id, token).then(data => {
            if (data.error) {
                console.log(data.error);
            } else {
                setOrders(data);
            }
        });
    };

    const loadStatusValues = () => {
        getStatusValues(user._id, token).then(data => {
            if (data.error) {
                console.log(data.error);
            } else {
                setStatusValues(data);
            }
        });
    };

    useEffect(() => {
        loadOrders();
        loadStatusValues();
    }, []);

    const handleStatusChange = (e, orderId) => {
        updateOrderStatus(user._id, token, orderId, e.target.value)
            .then(data => {
                if (data.error) {
                    console.log("Status update failed");
                } else {
                    loadOrders();
                }
            })
    };

    return (
        <AdminLayout
            back
            backText="Back to dashboard"
            to="/admin/dashboard"
            title="Orders"
            description={`${orders.length} online order${orders.length === 1 ? '' : 's'} to manage`}
        >
            {orders.length === 0 ? (
                <div className="ad-card">
                    <div className="ad-empty">
                        <div className="ad-empty-icon"><FontAwesomeIcon icon={faReceipt}/></div>
                        <h3>No online orders yet</h3>
                        <p>New orders placed on the storefront will show up here.</p>
                    </div>
                </div>
            ) : (
                orders.map(ord => (
                    <div className="ad-order-card" key={ord._id}>
                        <div className="ad-order-head">
                            <div className="ad-order-head-id">
                                Order <strong>{ord._id}</strong>
                            </div>
                            <span className={`ad-pill ${STATUS_PILL[ord.status] || 'ad-pill-neutral'}`}>{ord.status}</span>
                        </div>
                        <div className="ad-order-body">
                            <div className="ad-order-meta-grid">
                                <div className="ad-order-meta-item">
                                    <span><FontAwesomeIcon icon={faUser}/> Ordered by</span>
                                    <strong>{ord.user.name}</strong>
                                </div>
                                <div className="ad-order-meta-item">
                                    <span>Ordered on</span>
                                    <strong>{moment(ord.createdAt).fromNow()}</strong>
                                </div>
                                <div className="ad-order-meta-item">
                                    <span><FontAwesomeIcon icon={faCreditCard}/> Transaction ID</span>
                                    <strong>{ord.transaction_id}</strong>
                                </div>
                                <div className="ad-order-meta-item">
                                    <span>Amount</span>
                                    <strong>${ord.amount}</strong>
                                </div>
                                <div className="ad-order-meta-item" style={{gridColumn: '1 / -1'}}>
                                    <span><FontAwesomeIcon icon={faMapMarkerAlt}/> Delivery address</span>
                                    <strong>{ord.address}</strong>
                                </div>
                            </div>

                            <div className="ad-order-status-row">
                                <label className="ad-field" style={{flex: 1, maxWidth: 280}}>
                                    <span style={{fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ad-text-muted)', fontWeight: 700}}>
                                        Update status
                                    </span>
                                    <select className="ad-select" defaultValue="" onChange={(e) => handleStatusChange(e, ord._id)}>
                                        <option value="" disabled>Choose a status…</option>
                                        {statusValues.map((status, index) => (
                                            <option key={index} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            <p className="ad-order-products-title">
                                {ord.products.length} product{ord.products.length === 1 ? '' : 's'} in this order
                            </p>
                            {ord.products.map((prod, prodIndex) => (
                                <div className="ad-order-product-row" key={prodIndex}>
                                    <div><span>Product</span><strong>{prod.name}</strong></div>
                                    <div><span>Price</span><strong>${prod.price}</strong></div>
                                    <div><span>Qty</span><strong>{prod.count}</strong></div>
                                    <div><span>Product ID</span><strong className="ad-row-id">{prod._id}</strong></div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </AdminLayout>
    );
};

export default Orders;
