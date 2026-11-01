import React, {useState} from "react";
import ShowWishlistImage from "./ShowWishlistImage";
import {removeItem} from "./WishlistHelper";
import {removeWishlistItem, updateUserCart} from "./apiCore";
import {isAuthenticate} from "../auth";
import {Link, Redirect} from "react-router-dom";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faShoppingCart, faTrash} from '@fortawesome/free-solid-svg-icons'
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
                className="st-btn st-btn-danger">
                <FontAwesomeIcon icon={faTrash}/> Remove
            </button>);
    };

    const showCartBtn = (quantity) => {
        return quantity > 0 ? (
            <button onClick={addToCart} className="st-btn st-btn-primary">
                <FontAwesomeIcon icon={faShoppingCart}/> Add to Cart
            </button>
        ) : (
            <button className="st-btn st-btn-primary" disabled>
                <FontAwesomeIcon icon={faShoppingCart}/> Add to Cart
            </button>
        );
    };

    const showStock = (quantity) => {
        return quantity > 0 ? (
            <span className="st-pill st-pill-success">In Stock</span>
        ) : (
            <span className="st-pill st-pill-warning">Out of Stock</span>
        );
    };

    const showRemaining = (quantity) => {
        return quantity > 0 ? (
            <span className="st-cart-cat">{quantity} left</span>
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
        <div className="st-cart-row st-wishlist-row">
            {makeCartRedirect(redirect)}

            <Link to={`/product/${product._id}`} className="st-cart-media">
                <ShowWishlistImage item={product} url="product"/>
            </Link>

            <div className="st-cart-info">
                <Link to={`/product/${product._id}`} className="st-cart-name">
                    {product.name.length > 34 ? product.name.slice(0, 34) + '…' : product.name}
                </Link>
                <p className="st-cart-desc">
                    {product.description && product.description.length > 70
                        ? product.description.slice(0, 70) + '…'
                        : product.description}
                </p>
                <span className="st-cart-cat">
                    {product.category ? product.category.name : 'Other'}
                </span>
            </div>

            <div className="st-cart-price-col">
                <span className="st-cart-total">
                    {product.currency} {formatPrice(getDiscountedPrice(product))}
                </span>
                {isPromotionActive(product) && (
                    <span className="st-product-old">
                        {product.currency} {formatPrice(product.price)}
                    </span>
                )}
            </div>

            <div className="st-cart-actions">
                {showStock(product.quantity)}
                {showRemaining(product.quantity)}
                {showCartBtn(product.quantity)}
                {showRemoveBtn(removeProductWishlist)}
            </div>
        </div>
    )
};

export default WishlistItems;