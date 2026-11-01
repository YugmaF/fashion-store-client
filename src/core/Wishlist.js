import React, {useState, useEffect} from "react";
import Layout from "./Layout";
import WishlistItems from "./WishlistItems";
import {showWishlist, removeWishlistItem} from "./WishlistHelper";
import {Link} from 'react-router-dom';
import Checkout from "./Checkout";
import {isAuthenticate} from "../auth";
import CartItems from "./CartItems";
import FtrMin from "./FtrMin";

const Wishlist = () => {
    const [wishlistitems, setWishlitItems] = useState([]);
    const [run, setRun] = useState(false);

    useEffect(() => {
        setWishlitItems(showWishlist());
    }, [run]);

    const showItems = wishlistitems => {
        return (
            <div className="st-cart-list">
                <div className="st-cart-heading">
                    <h3>Your Wishlist has {`${wishlistitems.length}`} items</h3>
                    <span className="st-cart-sub">Move items to your cart or keep them saved for later.</span>
                </div>
                {wishlistitems.map((product, i) => (
                    <WishlistItems
                        key={i}
                        product={product}
                        wishlistUpdate={true}
                        removeProductWishlist={true}
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
                    <h3>Have an account? Sign in to see your items.</h3>

                    <div className="st-empty-actions">
                        <Link to="/shop" className="st-btn st-btn-primary">Start Shopping</Link>
                        <Link to="/signin" className="st-btn st-btn-outline">Sign in</Link>
                    </div>
                </div>
            ) : (
                wishlistitems.length > 0 ? (
                    showItems(wishlistitems)
                ) : (
                    <div className="st-empty-state">
                        <h3>You don't have any items in your Wishlist. Let's get shopping!</h3>
                        <div className="st-empty-actions">
                            <Link to="/shop" className="st-btn st-btn-primary">Start Shopping</Link>
                        </div>
                    </div>
                )
            )
        )
    };


    return (
        <div>
            <Layout title="Wishlist" description="Manage Wishlist Items" className="container-fluid">
                <div className="row">
                    <div className="col-lg-2 ml-lg-5">

                    </div>
                    <div className="col-lg-7 ml-lg-5">
                        {showNoItemsSign()}
                    </div>
                </div>
            </Layout>
            <br/>
            <FtrMin/>
        </div>
    );
};

export default Wishlist;
