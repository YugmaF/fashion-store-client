import React, {useState} from "react";
import {Link, Redirect} from 'react-router-dom';
import ShowImage from "./ShowImage";
import {addItem, updateItem} from "./CartHelper";
import {updateUserCart} from "./apiCore";
import {isAuthenticate} from "../auth";
import {addItemtoWishlist, updateWishlistItem} from "./WishlistHelper";
import {updateUserWishlist} from "./apiCore";


const Card = ({
                  product,
                  showViewBtn = true,
                  cartUpdate = false,
                  wishlistUpdate = false
              }) => {

    const [redirect, setRedirect] = useState(false);
    const [redirectWish, setRedirectWish] = useState(false);


    const showBtn = showViewBtn => {
        return (
            showViewBtn && (
                <Link to={`/product/${product._id}`} className="mr-2">
                    <button className="btn btn-outline-primary mt-2 mb-2">View Product</button>
                </Link>
            )
        );
    };

    const addToCart = () => {
        const {token, user} = isAuthenticate();

        if (user != null) {
            updateUserCart(user._id, token, {product}).then(data => {
                if (data.error) {
                    console.log(data.error);
                }
            });
        }

        addItem(product, () => {
            setRedirect(true);
        })
    };

    const makeRedirect = redirect => {
        if (redirect) {
            return <Redirect to="/cart"/>
        }
    };

    const showAddToCartBtn = (cartUpdate, quantity) => {
        return !cartUpdate && quantity > 0 &&
            <button onClick={addToCart} className="btn btn-outline-warning mt-2 mb-2">Add to Cart</button>;
    };

    const addToWishlist = () => {
        const {token, user} = isAuthenticate();

        if (user != null) {
            updateUserWishlist(user._id, token, {product}).then(data => {
                if (data.error) {
                    console.log(data.error);
                }
            });
        }

        addItemtoWishlist(product, () => {
            setRedirectWish(true);
        })
    };

    const makeRedirectWish = redirectWish => {
        if (redirectWish) {
            return <Redirect to="/wishlist"/>
        }
    };

    const showAddToWishlistBtn = (wishlistUpdate, quantity) => {
        return !wishlistUpdate && quantity > 0 &&
            <button onClick={addToWishlist} className="btn btn-outline-warning mt-2 mb-2">Add to Wishlist</button>;
    };


    const showStock = (quantity) => {
        return quantity > 0 ? (
            <span className="badge badge-primary badge-pill">In Stock</span>
        ) : (
            <span className="badge badge-warning badge-pill">Out of Stock</span>
        );
    };

    return (
        <div className="col-auto mb-3">
            <div className="card">
                <div className="card-body">
                    {makeRedirect(redirect)}
                    {makeRedirectWish(redirectWish)}
                    <Link to={`/product/${product._id}`} className="mr-2">
                        <ShowImage item={product} url="product"/>
                    </Link>
                    <p className="lead font-weight-bold">{product.name}</p>
                    <p className="black-9">{product.currency} {Number.parseFloat(product.price).toFixed(2)}</p>
                    <p className="black-8">
                        Category: {product.category && product.category.name} </p>

                    {showStock(product.quantity)}
                    <br/>
                    {/*{showBtn(showViewBtn)}*/}
                    {showAddToCartBtn(cartUpdate, product.quantity)}
                    {showAddToWishlistBtn(wishlistUpdate, product.quantity)}
                </div>
            </div>
        </div>
    )
};

export default Card;
