import React, {useState} from "react";
import ShowWishlistImage from "./ShowWishlistImage";
import {removeItem} from "./WishlistHelper";
import {removeWishlistItem, updateUserCart} from "./apiCore";
import {isAuthenticate} from "../auth";
import {Link, Redirect} from "react-router-dom";
import Divider from '@material-ui/core/Divider';
import {addItem} from "./CartHelper";
import {formatPrice, getDiscountedPrice, isPromotionActive} from "./pricing";

const WishlistItems = ({
                           product,
                           removeProductWishlist = false,
                           setRun = f => f,
                           run = undefined
                       }) => {

    const [redirect, setRedirect] = useState(false);

    const removeFromWishlist = () => {
        const {token, user} = isAuthenticate();

        if (user != null) {
            removeWishlistItem(user._id, token, product).then(data => {
                if (data.error) {
                    console.log(data.error);
                }
            });
        }

        removeItem(product._id);
    };

    const showRemoveBtn = removeProductWishlist => {
        return (removeProductWishlist &&
            <button
                onClick={() => {
                    removeFromWishlist();
                    setRun(!run);
                }}
                className="btn btn-warning w-100">
                Remove
            </button>);
    };

    const showCartBtn = (quantity) => {
        return quantity > 0 ? (
            <button onClick={addToCart}
                className="btn btn-primary w-100">
                Add to Cart
            </button>) : (
            <button className="btn btn-primary w-100" disabled>
                Add to Cart
            </button>
        );
    };

    const showStock = (quantity) => {
        return quantity > 0 ? (
            <span className="badge badge-primary badge-pill">In Stock</span>
        ) : (
            <span className="badge badge-warning badge-pill">Out of Stock</span>
        );
    };

    const showRemaining = (quantity) => {
        return quantity > 0 ? (
            <h6 className="mt-1 text-center">{quantity} Left</h6>
        ) : (
            ''
        );
    };

    //function to add item to cart list
    const addToCart = () => {
        const {token, user} = isAuthenticate();

        if (user != null) {
            //add cart item to db
            updateUserCart(user._id, token, {product}).then(data => {
                if (data.error) {
                    console.log(data.error);
                }
            });
        }
        //add cart item to local storage
        addItem(product, () => {
            setRedirect(true);
            removeFromWishlist();
            setRun(!run);
        })
    };

    //redirect to cart after adding item to the cart
    const makeCartRedirect = redirect => {
        if (redirect) {
            return <Redirect to="/cart"/>
        }
    };

    return (
        <div className="mb-3">
            {makeCartRedirect(redirect)}
            <div className="card">
                <div className="card-body">
                    <div className="row">
                        <div className="col-lg-2 col-md-3 col-sm-12">
                            <Link to={`/product/${product._id}`}>
                                <ShowWishlistImage item={product} url="product"/>
                            </Link>
                        </div>

                        <div className="col-lg-7 col-md-9 col-sm-12 pr-1">
                            <div className="col-lg-12 col-md-12 row mt-3">
                                <Link className="lead font-weight-bold text-dark"
                                      to={`/product/${product._id}`}>{product.name.length > 50 ? product.name.slice(0, 50) + '..' : product.name}</Link>
                            </div>
                            <div className="col-lg-12 col-md-12 row text-uppercase">
                                <h6 className="text-black-50">{product.description.length > 116 ? product.description.slice(0, 116) + '..' : product.description}</h6>
                            </div>

                            <div className="col-lg-12 col-md-6 col-12 text-center">
                                <div className="row">
                                    <div className="col-lg-auto mt-3">
                                        <h6 className="text-black-50 text-lg-left">ITEM PRICE:</h6>
                                        <p className="lead font-weight-normal text-lg-right"
                                           style={{
                                               fontSize: 18,
                                               marginBottom: 0
                                           }}>{product.currency} {formatPrice(getDiscountedPrice(product))}</p>

                                        {isPromotionActive(product) && <p className="lead font-weight-normal text-black-50 text-lg-right"
                                           style={{
                                               fontSize: 15,
                                               textDecoration: 'line-through'
                                           }}>{product.currency} {formatPrice(product.price)}</p>}
                                    </div>
                                    <Divider orientation="vertical" flexItem/>
                                    <div className="col-lg-auto mt-3 text-lg-left">
                                        <h6 className="text-black-50">STOCK:</h6>
                                        {showStock(product.quantity)}
                                        {showRemaining(product.quantity)}
                                    </div>
                                    <Divider orientation="vertical" flexItem/>
                                    <div className="col-lg-4 mt-3 text-lg-left">
                                        <h6 className="text-black-50">CATEGORY:</h6>
                                        <p>{product.category ? product.category.name : 'Other'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-3">
                            <div className="col-lg-12 col-12 mt-4">
                                {showCartBtn(product.quantity)}
                            </div>
                            <div className="col-lg-12 col-12 mt-2">
                                {showRemoveBtn(removeProductWishlist)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default WishlistItems;
