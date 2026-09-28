import React, {useEffect, useState} from "react";
import AdminLayout from "./AdminLayout";
import {isAuthenticate} from "../auth";
import {Link} from "react-router-dom";
import { confirmAlert } from 'react-confirm-alert';
import {getAllProducts, deleteSingleProduct} from "./ApiAdmin";
import Pagination from "./Pagination";
import {getPromotionStatus} from "../core/pricing";


const ManageProducts = () => {

    const [products, setAllProducts] = useState([]);

    const {user, token} = isAuthenticate();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    //get Current item
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const getCurrentItem = products.slice(indexOfFirst, indexOfLast);

    const  fetchProducts = () => {
        getAllProducts().then (data => {
            if(data.error){
                console.log(data.error)
             }
            else
                setAllProducts(data)
        })
    };

    const showRating = (rating) => {
        if (rating.length > 0) {
            const votedCount = rating.length;
            let rateSum = 0;
            rating.forEach(rate => {
                rateSum += rate;
            });
            const averageRating = Math.ceil(rateSum / votedCount);
            let startArray = [];
            for (let i = 0; i < averageRating; i++)
                startArray.push(<li key={i} className="fa fa-star fa-lg"></li>);
            for (let i = averageRating; i < 5; i++)
                startArray.push(<li key={i} className="fa fa-star-o fa-lg"></li>);
            return (
                <ul className="admin-rating">
                    {startArray}
                </ul>
            );
        } else {
            return (
                <ul className="admin-rating">
                    <li key={1} className="fa fa-star fa-lg"></li>
                    <li key={2} className="fa fa-star-o fa-lg"></li>
                    <li key={3} className="fa fa-star-o fa-lg"></li>
                    <li key={4} className="fa fa-star-o fa-lg"></li>
                    <li key={5} className="fa fa-star-o fa-lg"></li>
                </ul>
            );
        }
    };

    const remove = productId =>
    {
        confirmAlert({
            title: 'Confirm Delete',
            message: 'Are you sure you want to delete this product?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {
                        deleteSingleProduct(productId, user._id, token).then(data => {
                            if(data.error){
                                console.log(data.error)
                            } else {
                                fetchProducts();
                                confirmAlert({
                                    title: 'Product deleted successfully!',
                                    buttons: [
                                        {
                                            label: 'OK',
                                        }
                                    ]
                                });
                            }
                        })
                    }
                },
                {
                    label: 'No',
                    onClick: () => {}
                }
            ]
        });
    };
    useEffect(() => {
        fetchProducts();
    }, []);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    }

    const showPromotion = product => {
        const status = getPromotionStatus(product);

        if (status === 'none') {
            return <span className="admin-badge admin-badge-neutral">No offer</span>;
        }

        const badgeClass = status === 'active' ? 'admin-badge-success'
            : status === 'scheduled' ? 'admin-badge-info' : 'admin-badge-neutral';
        return (
            <div>
                <span className={`admin-badge ${badgeClass}`}>{status}</span>
                <div><strong>{product.discount}%</strong> {product.promotionTitle}</div>
            </div>
        );
    };

return (
    <AdminLayout backTo="/admin/dashboard" backText="Back to dashboard" title="Manage Products" description="Update and delete products">
        <div className="admin-card">
            <div className="admin-table-toolbar">
                <span className="admin-table-count">Total of {products.length} products</span>
            </div>
            <div className="admin-table-scroll">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th scope="col">Product Id</th>
                            <th scope="col">Product Name</th>
                            <th scope="col">Category</th>
                            <th scope="col">Quantity</th>
                            <th scope="col">Price</th>
                            <th scope="col">Promotion</th>
                            <th scope="col">Shippable</th>
                            <th scope="col">Rating</th>
                            <th scope="col">Update</th>
                            {(Number.parseInt(user.role) === 1) && (
                            <th scope="col">Delete</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                    {getCurrentItem.map((product) => (
                        <tr key={product._id}>
                            <th scope="row" className="admin-id">{product._id}</th>
                            <td><strong>{product.name}</strong></td>
                            <td>{product.category.name}</td>
                            <td>{product.quantity}</td>
                            <td>
                                {product.currency === 'Rs' ? 'Rs. '
                                    + Number.parseFloat(product.price).toFixed(2)
                                    : '$ ' + Number.parseFloat(product.price).toFixed(2)}
                            </td>
                            <td>{showPromotion(product)}</td>
                            <td>{product.takeInMethod ? 'Shippable' : 'Not Shippable'}</td>
                            <td>{showRating(product.rating)}</td>
                            <td>
                                <Link to={`/admin/product/update/${product._id}`}>
                                    <button className="admin-btn admin-btn-warning admin-btn-sm">
                                        Update
                                    </button>
                                </Link>
                            </td>
                            {(Number.parseInt(user.role) === 1) && (
                                <td>
                                    <button onClick={() => remove(product._id)} className="admin-btn admin-btn-danger admin-btn-sm">
                                        Delete
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                    </tbody>
                </table>
                <Pagination itemsPerPage={itemsPerPage} totalItems={products.length} currentPage={currentPage} paginate={paginate}/>
            </div>
        </div>
    </AdminLayout>
);
};

export default ManageProducts;
