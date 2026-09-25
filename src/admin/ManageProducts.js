import React, {useEffect, useState, Fragment} from "react";
import Layout from "../core/Layout";
import {isAuthenticate} from "../auth";
import {Link} from "react-router-dom";
import "mdbreact/dist/css/mdb.css";
import { confirmAlert } from 'react-confirm-alert';
import {createCategory} from "./ApiAdmin";
import {MDBContainer, MDBAlert} from 'mdbreact';
import {MDBDataTable} from 'mdbreact';
import {getAllCategories} from "../core/apiCore";
import {MDBBtn} from "mdbreact";
import Card from "../core/Card";
import FooterPage from "../core/Footer";
import CircularProgress from "@material-ui/core/CircularProgress";
import {getAllProducts, deleteSingleProduct} from "./ApiAdmin";
import Ftr from "../core/Ftr";
import Pagination from "./Pagination";
import {getPromotionStatus} from "../core/pricing";


const ManageProducts = () => {

    const [products, setAllProducts] = useState([]);

    const {user, token} = isAuthenticate();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
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
                <ul className="rating">
                    {startArray}
                </ul>
            );
        } else {
            return (
                <ul className="rating">
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
                        deleteSingleProduct(productId, user._id, token). then(data => {
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
            return <span className="badge badge-secondary">No offer</span>;
        }

        const badge = status === 'active' ? 'success' : status === 'scheduled' ? 'info' : 'light';
        return (
            <div>
                <span className={`badge badge-${badge}`}>{status}</span>
                <div><strong>{product.discount}%</strong> {product.promotionTitle}</div>
            </div>
        );
    };

return (
    <div>
    <Layout back={true} backText="Back to dashboard" to="/admin/dashboard" title="Manage Products" description="Update and delete Products">
        <div className="row ml-4 mr-4 mb-5">
            <div className="col-12 table-responsive">
                <h2 className="text-center"> Total of {products.length} Products </h2>
                <hr/>
                <table className="table table-hover text-center" >
                    <thead className="thead-dark">
                        <tr>
                            <th scope="col">Product Id</th>
                            <th scope="col">Product Name</th>
                            <th scope="col">Category</th>
                            <th scope="col">Quantity</th>
                            <th scope="col">Price</th>
                            <th scope="col">Promotion</th>
                            <th scope="col">Shippable</th>
                            <th scope="col">Product Rating</th>
                            <th scope="col">Update</th>
                            {(parseInt(user.role) === 1) && (
                            <th scope="col">Delete</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                    {getCurrentItem.map((product, item) => (
                        <tr key={product._id}>
                            <th scope="row">{product._id}</th>
                            <td><strong>{product.name}</strong></td>
                            <td><strong>{product.category.name}</strong></td>
                            <td style={{textAlign:"right"}}><strong>{product.quantity}</strong></td>
                            <td style={{textAlign:"right"}}>
                                <strong>
                                    {product.currency === 'Rs' ? 'Rs. '
                                        + parseFloat(product.price).toFixed(2)
                                        : '$ ' + parseFloat(product.price).toFixed(2)}
                                </strong>
                            </td>
                            <td>{showPromotion(product)}</td>
                            <td><strong>{product.takeInMethod ? 'Shippable' : 'Not Shippable'}</strong></td>
                            <td style={{textAlign:"left"}}><strong>{showRating(product.rating)}</strong></td>
                            <td>
                                <Link to={`/admin/product/update/${product._id}`}>
                                    <button className="btn btn-sm btn-warning"  >
                                        Update Product
                                    </button>
                                </Link>
                            </td>
                            {(parseInt(user.role) === 1) && (
                                <td>
                                    <button onClick={() => remove(product._id)} className="btn btn-sm btn-danger">
                                        Delete Product
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                    </tbody>
                </table>
                <br/>
                <Pagination itemsPerPage={itemsPerPage} totalItems={products.length} currentPage={currentPage} paginate={paginate}/>
                {/*<ul className="list-group">*/}
                {/*    {products.map((product, item) => (*/}
                {/*        <li*/}
                {/*            key={item}*/}
                {/*            className="list-group-item d-flex justify-content-between align-items-center">*/}
                {/*            <div className="container">*/}
                {/*                <div className="row">*/}
                {/*                    <div className="col-sm">*/}
                {/*                        <strong>{product.name}</strong>*/}
                {/*                    </div>*/}
                {/*                    <div className="col-sm">*/}
                {/*                        <Link to={`/admin/product/update/${product._id}`}>*/}
                {/*                            <button className="badge badge-warning badge-pill "  >*/}
                {/*                                Update Product*/}
                {/*                            </button>*/}
                {/*                        </Link>*/}
                {/*                    </div>*/}
                {/*                    <div className="col-sm">*/}
                {/*                        <button onClick={() => remove(product._id)} className="badge badge-danger badge-pill">*/}
                {/*                            Delete Product*/}
                {/*                        </button>*/}
                {/*                    </div>*/}
                {/*                </div>*/}
                {/*            </div>*/}

                {/*        </li>*/}

                {/*    ))}*/}
                {/*</ul>*/}
            </div>
        </div>
    </Layout>
    <Ftr/>
    </div>
);
};

export default ManageProducts;
