import React, {useState} from "react";
import ShowCartImage from "./ShowCartImage";
import {updateItem, removeItem} from "./CartHelper";
import {removeCartItem} from "./apiCore";
import {isAuthenticate} from "../auth";
import Checkbox from '@material-ui/core/Checkbox';
import {Link} from "react-router-dom";
import {formatPrice, getDiscountedPrice, isPromotionActive} from "./pricing";

const CartItems = ({
                       product,
                       cartUpdate = false,
                       removeProductCart = false,
                       setRun,
                       run = undefined
                   }) => {

    const [count, setCount] = useState(product.count);  //buying amount
    const [isChecked, setIsChecked] = useState(product.isChecked);  //whether item is selected for buying

    //function to check an item
    const selectItem = productId => event => {
        setRun(!run);   //inform parent
        setIsChecked(!isChecked);   //set checked or unchecked
        updateItem(productId, count, !isChecked);   //update item in local storage
    };

    //method to remove item from cart
    const removeFromCart = () => {
        const {token, user} = isAuthenticate();

        if (user != null) {
            //method to remove item from db
            removeCartItem(user._id, token, product).then(data => {
                if (data.error) {
                    console.log(data.error);
                }
            });
        }
        //remove item from local storage
        removeItem(product._id);
    };

    //remove button
    const showRemoveBtn = removeProductCart => {
        return (removeProductCart &&
            <button
                onClick={() => {
                    removeFromCart();   //call remove method
                    setRun(!run);   //inform parent that local storage has changed
                }}
                className="st-btn st-btn-danger">
                Remove
            </button>);
    };

    //show stock details
    const showStock = (quantity) => {
        return quantity > 0 ? (
            <span className="st-pill st-pill-success">In Stock</span>
        ) : (
            <span className="st-pill st-pill-warning">Out of Stock</span>
        );
    };

    //function to update item qty in local storage
    const handleCountChange = productId => event => {
        setRun(!run);   //inform parent
        setCount(event.target.value < 1 ? 1 : event.target.value);  //set count
        if (event.target.value >= 1) {
            //update local storage if item qty more than 1
            updateItem(productId, event.target.value, isChecked)
        }
    };

    //method to show item qty changer
    const showCartUpdate = cartUpdate => {
        return cartUpdate && (
            <div className="st-qty">
                <label className="st-qty-label" htmlFor={`qty-${product._id}`}>Qty</label>
                <input id={`qty-${product._id}`} type="number" min="1" className="st-qty-input"
                       value={count} onChange={handleCountChange(product._id)}/>
            </div>
        );
    };

    return (
        <div className="st-cart-row">
            <div className="st-cart-check">
                <Checkbox
                    checked={isChecked}
                    onChange={selectItem(product._id)}
                    name={`checked-${product._id}`}
                    style={{color: "#ff9408"}}
                />
            </div>

            <Link to={`/product/${product._id}`} className="st-cart-media">
                <ShowCartImage item={product} url="product"/>
            </Link>

            <div className="st-cart-info">
                <Link to={`/product/${product._id}`} className="st-cart-name">
                    {product.name.length > 30 ? product.name.slice(0, 30) + '…' : product.name}
                </Link>
                <span className="st-cart-cat">
                    {product.category && product.category.name ? product.category.name : 'Other'}
                </span>
                <p className="st-cart-desc">
                    {product.description && product.description.length > 60
                        ? product.description.slice(0, 60) + '…'
                        : product.description}
                </p>
            </div>

            <div className="st-cart-qty">
                {showCartUpdate(cartUpdate)}
            </div>

            <div className="st-cart-price-col">
                <span className="st-cart-total">
                    {product.currency} {formatPrice(getDiscountedPrice(product) * count)}
                </span>
                <span className="st-cart-unit">
                    {product.currency} {formatPrice(getDiscountedPrice(product))} / item
                </span>
                {isPromotionActive(product) && (
                    <span className="st-cart-promo">
                        {product.discount}% promotional offer applied
                    </span>
                )}
            </div>

            <div className="st-cart-actions">
                {showStock(product.quantity)}
                {showRemoveBtn(removeProductCart)}
            </div>
        </div>
    )
};

export default CartItems;