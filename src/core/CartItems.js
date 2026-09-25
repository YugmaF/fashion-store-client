import React, {useState} from "react";
import ShowCartImage from "./ShowCartImage";
import {updateItem, removeItem} from "./CartHelper";
import {removeCartItem} from "./apiCore";
import {isAuthenticate} from "../auth";
import FormControlLabel from '@material-ui/core/FormControlLabel';
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
                className="btn btn-sm btn-outline-orange">
                Remove
            </button>);
    };

    //show stock details
    const showStock = (quantity) => {
        return quantity > 0 ? (
            <span className="badge badge-primary badge-pill">In Stock</span>
        ) : (
            <span className="badge badge-warning badge-pill">Out of Stock</span>
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
        return cartUpdate &&
            <div className="input-group">
                <div className="input-group-prepend">
                    <span className="input-group-text">Qty</span>
                </div>
                <input type="number" className="form-control" value={count} onChange={handleCountChange(product._id)}/>
            </div>
    };

    return (
        <div className="mb-3">
            <div className="card">
                <div className="card-body">
                    <div className="row">
                        <div className="col-lg-3 col-sm-12">
                            <div className="row">

                                <FormControlLabel className="col-lg-1 col-1"
                                                  control={
                                                      <Checkbox
                                                          checked={isChecked}
                                                          onChange={selectItem(product._id)}
                                                          name="checkedB"
                                                          style={{
                                                              color: "#ff9408",
                                                          }}
                                                      />
                                                  }
                                />

                                <div className="col-lg-9 col-10 text-center mt-2">
                                    <Link to={`/product/${product._id}`}>
                                        <ShowCartImage item={product} url="product"/>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-9 col-sm-12 text-center text-lg-left">
                            <div className="col-lg-12 row">
                                <div className="col-lg-6 mt-3">
                                    <Link className="lead mt-2 font-weight-bold text-dark"
                                          to={`/product/${product._id}`}>{product.name.length > 24 ? product.name.slice(0, 24) + '..' : product.name}</Link>
                                </div>
                            </div>
                            <div className="col-lg-12 col-12 row">
                                <div className="col-lg-5 col-12">
                                    <div className="row">
                                        <div className="col-lg-12 col-12">
                                            <p className="mt-4 text-black-50"
                                               style={{marginBottom: '0px'}}>{product.description.length > 50 ? product.description.slice(0, 50) + '..' : product.description}</p>
                                        </div>
                                        <div className="col-lg-12 col-12 mt-1">
                                            <p className="text-black-50">Category: {product.category.name !== undefined ? product.category.name : 'Other'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-3 col-4 mt-1">
                                    {showCartUpdate(cartUpdate)}
                                </div>
                                <div className="col-lg-4 col-8 text-right">
                                    <div className="row">
                                        <div className="col-lg-12">
                                            <p className="lead font-weight-normal"
                                               style={{fontSize: 22}}>{product.currency} {formatPrice(getDiscountedPrice(product) * count)}</p>
                                        </div>
                                        <div className="col-lg-12">
                                            <p className="lead font-weight-normal text-black-50"
                                               style={{fontSize: 15}}>item: {product.currency} {formatPrice(getDiscountedPrice(product))}</p>
                                            {isPromotionActive(product) && (
                                                <p className="text-danger" style={{fontSize: 13}}>
                                                    {product.discount}% promotional offer applied
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <br/>
                            <div className="col-lg-12 col-12 row">
                                <div className="col-lg-6 col-6">
                                    {showStock(product.quantity)}
                                </div>
                                <div className="col-lg-6 col-6 text-right">
                                    {showRemoveBtn(removeProductCart)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
};

export default CartItems;
