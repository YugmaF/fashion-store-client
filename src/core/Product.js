import React, {useState, useEffect} from "react";
import Layout from "./Layout";
import {getProduct, updateUserCart, updateUserWishlist} from "./apiCore";
import ShowSingleImage from "./ShowSingleImage";
import {isAuthenticate} from "../auth";
import {addItem} from "./CartHelper";
import {Redirect} from "react-router-dom";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {faMoneyBill} from '@fortawesome/free-solid-svg-icons'
import {faCcVisa, faCcMastercard, faCcAmex, faCcPaypal} from '@fortawesome/free-brands-svg-icons';
import CircularProgress from "@material-ui/core/CircularProgress";
import {addItemtoWishlist} from "./WishlistHelper";
import RateComponent from "./Rate";
import CommentComponent from "./CommentComponent";
import Ftr from "./Ftr";
import SimilarProducts from "./SimilarProducts";
import {formatPrice, getDiscountedPrice, isPromotionActive} from "./pricing";

const Product = props => {

    const [product, setProduct] = useState({});
    const [comments, setComments] = useState(null);
    const [loadingComments, setLoadingComments] = useState(true);
    const [error, setError] = useState(false);
    const [redirect, setRedirect] = useState(false);
    const [loading, setLoading] = useState(true);
    const [redirectWish, setRedirectWish] = useState(false);

    //function to get product details
    const singleProduct = productId => {
        //get details from db
        getProduct(productId).then(data => {
            if (data.error) {
                setError(data.error);
            } else {
                setLoading(false);  //disable loader
                setProduct(data);   //set products
                setComments(data.comments);
                comments ? setLoadingComments(false) : setLoadingComments(false);
            }
        })
    };

    useEffect(() => {
        const productId = props.match.params.productId; //get product id from param
        singleProduct(productId);   //get product details
    }, []);

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
        })
    };

    //redirect to cart after adding item to the cart
    const makeCartRedirect = redirect => {
        if (redirect) {
            return <Redirect to="/cart"/>
        }
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


    //check whether product have stocks
    const showStock = (quantity) => {
        return quantity > 0 ? ( //if quantity more than 0
            <span className="st-pill st-pill-success">In Stock</span>
        ) : (
            <span className="st-pill st-pill-warning">Out of Stock</span>
        );
    };

    //show add to cart btn
    const showAddToCartBtn = (quantity) => {
        return quantity > 0 &&  //show only product have stock
            <button onClick={addToCart} className="st-btn st-btn-primary st-btn-lg">Add to Cart</button>;
    };

    //show wish list btn
    const showWishListBtn = () => {
        return isAuthenticate() ? (
            <button onClick={addToWishlist}
                    className="st-btn st-btn-outline st-btn-lg">Wishlist
            </button>
        ) : ''
    };

    const activePromotion = isPromotionActive(product);

    const cardType = (icon, label) => (
        <div className="st-prod-meta">
            <span className="st-prod-meta-icon"><FontAwesomeIcon icon={icon}/></span>
            <span>{label}</span>
        </div>
    );

    return <div>
                <Layout title={product.name || 'Product'} description={product.description} className="container-fluid" back
                        backText="Continue shopping" to="/shop">
                    {makeCartRedirect(redirect)}
                    {makeWishlistRedirect(redirectWish)}
                    <div className="container">
                        <div className="st-product-detail">
                            <div className="st-detail-media">
                                <ShowSingleImage item={product} url="product"/>
                            </div>

                            <div className="st-detail-body">
                                <span className="st-detail-cat">
                                    {product.category && product.category.name}
                                </span>
                                <h1 className="st-detail-title">{product.name}</h1>

                                {activePromotion && (
                                    <div className="st-detail-promo">
                                        <span className="st-pill st-pill-promo">{product.discount}% OFF</span>
                                        <span className="st-promo-title">{product.promotionTitle || 'Promotional offer'}</span>
                                        {product.promotionEnd && (
                                            <span className="st-promo-expiry">
                                                Ends {new Date(product.promotionEnd).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                )}

                                <div className="st-detail-price">
                                    <span className="price">
                                        {product.currency} {formatPrice(getDiscountedPrice(product))}
                                    </span>
                                    {activePromotion && (
                                        <span className="st-product-old">
                                            {product.currency} {formatPrice(product.price)}
                                        </span>
                                    )}
                                </div>

                                <div className="st-detail-meta-row">
                                    {cardType(faMoneyBill, 'Secure payments')}
                                    {cardType(faCcVisa, 'Visa · Mastercard · Amex · PayPal')}
                                </div>

                                <div className="st-detail-section">
                                    <h2>Description</h2>
                                    <p>{product.description}</p>
                                </div>

                                <div className="st-detail-section">
                                    <h2>Rate Now</h2>
                                    <RateComponent product={product}/>
                                </div>

                                <div className="st-detail-availability">
                                    <span className="st-detail-av-label">Availability</span>
                                    {showStock(product.quantity)}
                                </div>

                                <div className="st-detail-cta">
                                    {showAddToCartBtn(product.quantity)}
                                    {showWishListBtn()}
                                </div>
                            </div>
                        </div>

                        <div className="row mt-5 mb-5 container-fluid">
                            <div className="col-lg-12">
                                {
                                    !loadingComments ? <CommentComponent comments={comments} product={product}/> : ''
                                }
                            </div>
                        </div>

                    </div>
                </Layout>
                <div className="st-similar">
                    <div className="container">
                        <div className="st-section-head">
                            <h3 className="st-section-title">Similar Products</h3>
                        </div>
                        <SimilarProducts productId={props.match.params.productId}/>
                    </div>
                </div>

                <Ftr/>
            </div>


};

export default Product;
