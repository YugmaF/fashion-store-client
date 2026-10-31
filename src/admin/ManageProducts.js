import React, {useEffect, useState, useMemo} from "react";
import AdminLayout from "./AdminLayout";
import {isAuthenticate} from "../auth";
import {Link} from "react-router-dom";
import {confirmAlert} from 'react-confirm-alert';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPen, faTrash, faSearch, faBoxOpen, faPlus, faStar} from "@fortawesome/free-solid-svg-icons";
import {getAllProducts, deleteSingleProduct} from "./ApiAdmin";
import Pagination from "./Pagination";
import {getPromotionStatus} from "../core/pricing";

const ManageProducts = () => {
    const [products, setAllProducts] = useState([]);
    const [query, setQuery] = useState('');
    const {user, token} = isAuthenticate();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const fetchProducts = () => {
        getAllProducts().then(data => {
            if (data.error) {
                console.log(data.error)
            } else {
                setAllProducts(data)
            }
        })
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const filteredProducts = useMemo(() => {
        if (!query.trim()) return products;
        const term = query.trim().toLowerCase();
        return products.filter(product =>
            product.name.toLowerCase().includes(term) ||
            (product.category && product.category.name.toLowerCase().includes(term))
        );
    }, [products, query]);

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const getCurrentItem = filteredProducts.slice(indexOfFirst, indexOfLast);

    const showRating = (rating) => {
        const votedCount = rating.length;
        const averageRating = votedCount > 0
            ? Math.ceil(rating.reduce((sum, rate) => sum + rate, 0) / votedCount)
            : 0;
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(
                <FontAwesomeIcon key={i} icon={faStar} className={i < averageRating ? "" : "is-empty"}/>
            );
        }
        return <ul className="ad-rating">{stars}</ul>;
    };

    const remove = productId => {
        confirmAlert({
            title: 'Confirm Delete',
            message: 'Are you sure you want to delete this product?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {
                        deleteSingleProduct(productId, user._id, token).then(data => {
                            if (data.error) {
                                console.log(data.error)
                            } else {
                                fetchProducts();
                                confirmAlert({
                                    title: 'Product deleted successfully!',
                                    buttons: [{label: 'OK'}]
                                });
                            }
                        })
                    }
                },
                {label: 'No', onClick: () => {}}
            ]
        });
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const showPromotion = product => {
        const status = getPromotionStatus(product);
        if (status === 'none') {
            return <span className="ad-pill ad-pill-neutral">No offer</span>;
        }
        const pillClass = status === 'active' ? 'ad-pill-success' : status === 'scheduled' ? 'ad-pill-info' : 'ad-pill-neutral';
        return (
            <div>
                <span className={`ad-pill ${pillClass}`}>{status}</span>
                <div style={{fontSize: '0.78rem', marginTop: 4}}><strong>{product.discount}%</strong> {product.promotionTitle}</div>
            </div>
        );
    };

    return (
        <AdminLayout
            back
            backText="Back to dashboard"
            to="/admin/dashboard"
            title="Manage Products"
            description="Browse, update and remove products from your catalog"
            actions={(
                <Link to="/create/product" className="ad-btn ad-btn-primary">
                    <FontAwesomeIcon icon={faPlus}/> Add product
                </Link>
            )}
        >
            <div className="ad-card">
                <div className="ad-toolbar">
                    <div className="ad-search">
                        <FontAwesomeIcon icon={faSearch}/>
                        <input
                            type="text"
                            placeholder="Search by name or category…"
                            value={query}
                            onChange={e => {
                                setQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                    <div className="ad-toolbar-meta">
                        <strong>{filteredProducts.length}</strong> of {products.length} products
                    </div>
                </div>

                {getCurrentItem.length > 0 ? (
                    <div className="ad-table-wrap">
                        <table className="ad-table">
                            <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th>Promotion</th>
                                <th>Shippable</th>
                                <th>Rating</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {getCurrentItem.map(product => (
                                <tr key={product._id}>
                                    <td>
                                        <strong>{product.name}</strong>
                                        <div className="ad-row-id">{product._id}</div>
                                    </td>
                                    <td><span className="ad-pill ad-pill-neutral">{product.category.name}</span></td>
                                    <td>{product.quantity}</td>
                                    <td>
                                        <strong>
                                            {product.currency === 'Rs' ? 'Rs. ' : '$ '}
                                            {Number.parseFloat(product.price).toFixed(2)}
                                        </strong>
                                    </td>
                                    <td>{showPromotion(product)}</td>
                                    <td>
                                        <span className={`ad-pill ${product.takeInMethod ? 'ad-pill-success' : 'ad-pill-neutral'}`}>
                                            {product.takeInMethod ? 'Shippable' : 'Not shippable'}
                                        </span>
                                    </td>
                                    <td>{showRating(product.rating)}</td>
                                    <td>
                                        <div className="ad-table-actions">
                                            <Link to={`/admin/product/update/${product._id}`} className="ad-btn ad-btn-sm ad-btn-outline" title="Update product">
                                                <FontAwesomeIcon icon={faPen}/>
                                            </Link>
                                            {Number.parseInt(user.role) === 1 && (
                                                <button onClick={() => remove(product._id)} className="ad-btn ad-btn-sm ad-btn-danger" title="Delete product">
                                                    <FontAwesomeIcon icon={faTrash}/>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="ad-empty">
                        <div className="ad-empty-icon"><FontAwesomeIcon icon={faBoxOpen}/></div>
                        <h3>No products found</h3>
                        <p>Try a different search term, or add your first product.</p>
                    </div>
                )}

                {filteredProducts.length > itemsPerPage && (
                    <Pagination itemsPerPage={itemsPerPage} totalItems={filteredProducts.length} currentPage={currentPage} paginate={paginate}/>
                )}
            </div>
        </AdminLayout>
    );
};

export default ManageProducts;
