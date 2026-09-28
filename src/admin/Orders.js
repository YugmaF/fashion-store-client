import React, {useEffect, useState} from "react";
import AdminLayout from "./AdminLayout";
import {isAuthenticate} from "../auth";
import {listOrders, getStatusValues, updateOrderStatus} from "./ApiAdmin";
import moment from 'moment';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [statusValues, setStatusValues] = useState([]);

  const {user, token} = isAuthenticate();

  const loadOrders = () => {
    listOrders(user._id, token).then(data => {
      if(data.error){
        console.log(data.error);
      }
      else {
        setOrders(data);
      }
    });
  };

  const loadStatusValues = () => {
    getStatusValues(user._id, token).then(data => {
      if(data.error){
        console.log(data.error);
      }
      else {
        setStatusValues(data);
      }
    });
  };

  useEffect(() => {
    loadOrders();
    loadStatusValues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusChange = (e, orderId) => {
    updateOrderStatus(user._id, token, orderId, e.target.value)
        .then(data => {
          if(data.error){
            console.log("Status update failed");
          }
          else {
            loadOrders();
          }
        })
  };

  return (
      <AdminLayout backTo="/admin/dashboard" backText="Back to dashboard" title="Orders"
              description={`Welcome back ${user.name}, manage all online orders here!`}>
        <div className="admin-card">
          <div className="admin-table-toolbar">
            <span className="admin-table-count">Total online orders: {orders.length}</span>
          </div>
          <div className="admin-card-body">
            {orders.length === 0 && (
                <div className="admin-empty">No online orders yet.</div>
            )}
            {orders.map((ord, ordIndex) => (
                <div className="admin-order-card" key={ordIndex}>
                  <div className="admin-order-id">Order ID: <span className="admin-id">{ord._id}</span></div>

                  <div className="admin-form-group" style={{maxWidth: 260, marginTop: 12}}>
                    <label className="admin-form-label">Status: {ord.status}</label>
                    <select className="form-control" onChange={(e) => handleStatusChange(e, ord._id)}>
                      <option>Update Status</option>
                      {statusValues.map((status, index) => (
                          <option key={index} value={status}>
                            {status}
                          </option>
                      ))}
                    </select>
                  </div>

                  <div className="admin-order-meta-row">
                    <span>Transaction ID: <strong>{ord.transaction_id}</strong></span>
                    <span>Price: <strong>${ord.amount}</strong></span>
                    <span>Ordered by: <strong>{ord.user.name}</strong></span>
                    <span>Ordered: <strong>{moment(ord.createdAt).fromNow()}</strong></span>
                    <span>Delivery address: <strong>{ord.address}</strong></span>
                  </div>

                  <div className="admin-form-label" style={{marginTop: 12}}>
                    Products in this order: {ord.products.length}
                  </div>
                  <div className="admin-order-products">
                    {ord.products.map((prod, prodIndex) => (
                        <div className="admin-order-product" key={prodIndex}>
                          <dt>Name</dt><dd>{prod.name}</dd>
                          <dt>Price</dt><dd>{prod.price}</dd>
                          <dt>Qty</dt><dd>{prod.count}</dd>
                        </div>
                    ))}
                  </div>
                </div>
            ))}
          </div>
        </div>
      </AdminLayout>
  );

};

export default Orders;
