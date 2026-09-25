import React, {useEffect, useState} from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import Ftr from './Ftr';
import NavBar from './NavBar';
import ShopListCard from './ShopListCard';
import {getPromotionalOffers} from './apiCore';

const Offers = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        getPromotionalOffers()
            .then(data => {
                if (!data || data.error) {
                    setError(data ? data.error : 'Promotional offers could not be loaded');
                } else {
                    setOffers(data);
                }
                setLoading(false);
            });
    }, []);

    return (
        <div>
            <NavBar/>
            <div className="offers-hero text-center">
                <div className="container">
                    <span className="offers-kicker">LIMITED-TIME SAVINGS</span>
                    <h1>Promotional Offers</h1>
                    <p>Discover active deals across the FashionStore collection.</p>
                </div>
            </div>
            <div className="container offers-page">
                {loading && (
                    <div className="text-center py-5">
                        <CircularProgress size={70}/>
                    </div>
                )}
                {error && <div className="alert alert-danger text-center">{error}</div>}
                {!loading && !error && offers.length === 0 && (
                    <div className="alert alert-info text-center">
                        There are no active promotional offers right now.
                    </div>
                )}
                <div className="row">
                    {offers.map(product => (
                        <div key={product._id} className="col-xl-3 col-lg-4 col-md-6 mb-5">
                            <ShopListCard product={product}/>
                        </div>
                    ))}
                </div>
            </div>
            {!loading && <Ftr/>}
        </div>
    );
};

export default Offers;
