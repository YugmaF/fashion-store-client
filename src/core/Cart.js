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
            <div>
                {/*get item length*/}
                <h3>Your cart have {`${items.length}`} items</h3>
                <hr/>
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
                <div>
                    <h3>You don't have any items in your cart</h3>
                    <h5>Have an account? Sign in to see your items.</h5>

                    <div className="row mt-3">
                        <div className="col-sm-6 mb-2">
                            <Link to="/shop" className="btn st-btn-primary d-block">Start Shopping</Link>
                        </div>
                        <div className="col-sm-6 mb-2">
                            <Link to="/signin" className="btn st-btn-outline d-block">Sign in</Link>
                        </div>
                    </div>
                </div>
            ) : (
                <div>
                    <h3>You don't have any items in your cart. Let's get shopping!</h3>

                    <div className="col-sm-12 mt-3">
                        <Link to="/shop" className="btn st-btn-primary d-block">Start Shopping</Link>
                    </div>
                </div>
            )
        )
    };

    const showSummary = (items) => (
        <div className="card">
            <div className="card-body">
                <div>
                    <h3 className="mb-4">Your Cart Summary</h3>
                    <hr/>
                    <Checkout products={items}/>
                </div>
            </div>
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
