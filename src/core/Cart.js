import React, {useState, useEffect} from "react";
import Layout from "./Layout";
import CartItems from "./CartItems";
import {showCart, removeItem} from "./CartHelper";
import {Link} from 'react-router-dom';
import Checkout from "./Checkout";
import {isAuthenticate} from "../auth";
import FtrMin from "./FtrMin";

const Cart = () => {
    const [items, setItems] = useState([]); //cart items
    const [run, setRun] = useState(false);  //inform parent that local storage have changed

    useEffect(() => {
        setItems(showCart());   //get cart items
    }, [run]);  //get cart items when only run state changed

    const showItems = items => {
        return (
            <div className="st-cart-list">
                <div className="st-cart-heading">
                    <h3>Your cart has {`${items.length}`} items</h3>
                    <span className="st-cart-sub">Select items to check out and adjust quantities.</span>
                </div>
                {/*loop through cart items to show items*/}
                {items.map((product, i) => (
                    <CartItems
                        key={i}
                        product={product}
                        cartUpdate={true}
                        removeProductCart={true}
                        setRun={setRun}
                        run={run}
                    />))}
            </div>
        )
    };

    const showNoItemsSign = () => {
        return (
            !isAuthenticate() ? (
                <div className="st-empty-state">
                    <h3>You don't have any items in your cart</h3>
                    <p>Have an account? Sign in to see your items.</p>

                    <div className="st-empty-actions">
                        <Link to="/shop" className="st-btn st-btn-primary">Start Shopping</Link>
                        <Link to="/signin" className="st-btn st-btn-outline">Sign in</Link>
                    </div>
                </div>
            ) : (
                <div className="st-empty-state">
                    <h3>You don't have any items in your cart. Let's get shopping!</h3>
                    <div className="st-empty-actions">
                        <Link to="/shop" className="st-btn st-btn-primary">Start Shopping</Link>
                    </div>
                </div>
            )
        )
    };

    const showSummary = (items) => (
        <div className="st-cart-summary">
            <div className="st-cart-summary-head">
                <h3>Your Cart Summary</h3>
            </div>
            <Checkout products={items}/>
        </div>
    );

    return (
        <div>
            <Layout title="Shopping Cart" description="Manage Cart Items" className="container-fluid">

                <div className="container my-auto">
                    <div className="row justify-content-center align-items-center text-center">
                        {items.length > 0 ? '' : showNoItemsSign()}
                    </div>
                </div>


                <div className="row ml-lg-4">
                    <div className="col-lg-7 col-sm-12">
                        {items.length > 0 ? showItems(items) : ''}
                    </div>

                    <div className="col-lg-4 col-sm-12 ml-auto mr-auto my-5">
                        {items.length > 0 ? showSummary(items) : ''}
                    </div>
                </div>
            </Layout>
            <FtrMin/>
        </div>
    );
};

export default Cart;
