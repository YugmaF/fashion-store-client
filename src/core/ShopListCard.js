import React, {useState} from "react";
import {Link, Redirect} from 'react-router-dom';
import ShopListImage from "./ShopListImage";
import {addItem, updateItem} from "./CartHelper";
import {updateUserCart, updateUserWishlist} from "./apiCore";
import {isAuthenticate} from "../auth";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faEye, faHeart, faShoppingCart} from '@fortawesome/free-solid-svg-icons'
import '../assets/shop_card_assets/bootstrap/css/bootstrap.min.css';
import '../assets/shop_card_assets/css/Roboto.css';
import '../assets/shop_card_assets/fonts/font-awesome.min.css';
import '../assets/shop_card_assets/css/Shopping-Grid.css';
import '../assets/shop_card_assets/css/styles.css';
import {addItemtoWishlist} from "./WishlistHelper";
import ShowCartImage from "./ShowCartImage";
import {formatPrice, getDiscountedPrice, isPromotionActive} from "./pricing";

const ShopListCard = ({
                           product,
                           showViewBtn = true,
                           cartUpdate = false
                       }) => {

    const [redirect, setRedirect] = useState(false);
    const [redirectWish, setRedirectWish] = useState(false);

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

    const makeWishlistRedirect = redirectWish => {
        if (redirectWish) {
            return <Redirect to="/wishlist"/>
        }
    };

    const showRating = (rating) => {
        if (rating && rating.length > 0) {
            const votedCount = rating.length;
            let rateSum = 0;
            rating.forEach(rate => {
                rateSum += rate;
            });
            const averageRating = Math.ceil(rateSum / votedCount);
            const stars = [];
            for (let i = 1; i <= 5; i++) {
                stars.push(
                    <li key={i} className={"fa " + (i <= averageRating ? "fa-star" : "fa-star-o") + " st-star"}></li>
                );
            }
            return (
                <div className="st-product-rating">
                    <ul className="rating">{stars}</ul>
                    <span className="st-rating-count">({votedCount})</span>
                </div>
            );
        }
        return (
            <ul className="rating st-product-rating-empty">
                {[1, 2, 3, 4, 5].map(i => <li key={i} className="fa fa-star-o st-star"></li>)}
            </ul>
        );
    };

    const makeRedirect = redirect => {
        if (redirect) {
            return <Redirect to="/cart"/>
        }
    };

    const showStock = (quantity) => {
        return quantity > 0 ? (
            <span className="st-pill st-pill-success">In Stock</span>
        ) : (
            <span className="st-pill st-pill-warning">Out of Stock</span>
        );
    };

    const showCartBtn = (quantity) => {
        return quantity > 0 ? (
            <button onClick={addToCart} aria-label="Add to cart" className="st-action-btn">
                <FontAwesomeIcon icon={faShoppingCart}/>
            </button>
        ) : null;
    };

    const showWishListBtn = () => {
        return isAuthenticate() ? (
            <button onClick={addToWishlist} aria-label="Add to wishlist" className="st-action-btn">
                <FontAwesomeIcon icon={faHeart}/>
            </button>
        ) : null;
    };

    const activePromotion = isPromotionActive(product);

    return (
        <div className="product-grid7 st-product-card">
            <div className="product-image7 st-product-media">
                {makeRedirect(redirect)}
                {makeWishlistRedirect(redirectWish)}
                <Link to={`/product/${product._id}`} className="st-product-link">
                    <ShopListImage item={product} url="product"/>
                </Link>

                <div className="st-product-actions">
                    <Link to={`/product/${product._id}`} aria-label="View product" className="st-action-btn">
                        <FontAwesomeIcon icon={faEye}/>
                    </Link>
                    {showWishListBtn()}
                    {showCartBtn(product.quantity)}
                </div>

                <div className="st-product-badges">
                    {showStock(product.quantity)}
                    {activePromotion && (
                        <span className="st-pill st-pill-promo">{product.discount}% OFF</span>
                    )}
                </div>
            </div>

            <div className="product-content st-product-body">
                {activePromotion && product.promotionTitle && (
                    <span className="st-promo-title">{product.promotionTitle}</span>
                )}
                <Link to={`/product/${product._id}`} className="st-product-title">
                    {product.name && product.name.length > 24 ? product.name.slice(0, 24) + '…' : product.name}
                </Link>
                <span className="st-product-cat">
                    {product.category && product.category.name}
                </span>
                {showRating(product.rating)}
                <div className="st-product-price">
                    <span className="price">
                        {product.currency + ' ' + formatPrice(getDiscountedPrice(product))}
                    </span>
                    {activePromotion && (
                        <span className="st-product-old">
                            {product.currency + ' ' + formatPrice(product.price)}
                        </span>
                    )}
                </div>
                {activePromotion && product.promotionEnd && (
                    <span className="st-promo-expiry">
                        Ends {new Date(product.promotionEnd).toLocaleDateString()}
                    </span>
                )}
            </div>
        </div>
    )
};

export default ShopListCard;