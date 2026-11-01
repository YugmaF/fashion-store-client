import React, {useState, useEffect} from "react";
import {getProducts, getPromotionalOffers} from "./apiCore";
import Carousel from 'react-bootstrap/Carousel'
import Ftr from "./Ftr";
import ShopListCard from "./ShopListCard";
import {Link} from "react-router-dom";

//images for carousel
import image1 from '../images/image5.jpg';
import image2 from '../images/image3.jpg';
import image3 from '../images/image2.jpg';
import image4 from '../images/image4.jpg';

//Mui stuff
import CircularProgress from "@material-ui/core/CircularProgress";
import CategoryCard from "./CategoryCard";
import NavBar from "./NavBar";

const Home = () => {

    const [products, setProducts] = useState([]);
    const [offers, setOffers] = useState([]);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showView, setShowView] = useState(false);

    const loadProducts = () => {
        getProducts('quantity').then(data => {
            setLoading(false);
            if (data.error) {
                setError(data.error);
            } else {
                setProducts(data);
                setShowView(true);
            }
        })
    };

    const loadOffers = () => {
        getPromotionalOffers(4).then(data => {
            if (data && !data.error) {
                setOffers(data);
            }
        });
    };

    useEffect(() => {
        setLoading(true);
        loadProducts();
        loadOffers();
    }, []);

    const appendView = () => {
        if (showView) {
            return (
                <div>
                    <NavBar/>
                    <div className="st-hero-section mb-4">
                        <Carousel interval={6000}>
                            <Carousel.Item>
                                <img
                                    className="d-block w-100"
                                    src={image1}
                                    alt="Featured fashion collection"
                                    style={{maxHeight: "560px", objectFit: "cover"}}
                                />
                                <Carousel.Caption className="st-hero-caption">
                                    <span className="st-kicker">New Season</span>
                                    <h1>Discover Your Style</h1>
                                    <p>Explore the latest fashion collection. Quality pieces crafted for everyday confidence.</p>
                                </Carousel.Caption>
                            </Carousel.Item>
                            <Carousel.Item>
                                <img
                                    className="d-block w-100"
                                    src={image2}
                                    alt="Seasonal fashion arrivals"
                                    style={{maxHeight: "560px", objectFit: "cover"}}
                                />
                                <Carousel.Caption className="st-hero-caption">
                                    <span className="st-kicker">Trending Now</span>
                                    <h1>Seasonal Arrivals</h1>
                                    <p>Fresh looks for every occasion. Shop the pieces everyone is talking about.</p>
                                </Carousel.Caption>
                            </Carousel.Item>
                            <Carousel.Item>
                                <img
                                    className="d-block w-100"
                                    src={image3}
                                    alt="Everyday fashion essentials"
                                    style={{maxHeight: "560px", objectFit: "cover"}}
                                />
                                <Carousel.Caption className="st-hero-caption">
                                    <span className="st-kicker">Essentials</span>
                                    <h1>Everyday Favourites</h1>
                                    <p>Versatile wardrobe staples that pair effortlessly with anything.</p>
                                </Carousel.Caption>
                            </Carousel.Item>
                            <Carousel.Item>
                                <img
                                    className="d-block w-100"
                                    src={image4}
                                    alt="New fashion styles"
                                    style={{maxHeight: "560px", objectFit: "cover"}}
                                />
                                <Carousel.Caption className="st-hero-caption">
                                    <span className="st-kicker">Just In</span>
                                    <h1>New Styles Added</h1>
                                    <p>Be the first to wear the newest additions to the collection.</p>
                                </Carousel.Caption>
                            </Carousel.Item>
                        </Carousel>
                    </div>
                    <div style={{marginTop: "40px"}} className="team-grid">
                        <div className="container">
                            <div className="st-section-head">
                                <h2 className="st-section-title">SHOP BY CATEGORIES</h2>
                            </div>
                            <div className="st-categories-grid row people justify-content-center">
                                <CategoryCard/>
                            </div>
                        </div>
                    </div>

                    {offers.length > 0 && (
                        <div className="offers-home-section">
                            <div className="container">
                                <div className="offers-heading">
                                    <div>
                                        <span className="offers-kicker">LIMITED-TIME SAVINGS</span>
                                        <h2 className="st-section-title">PROMOTIONAL OFFERS</h2>
                                    </div>
                                    <Link className="btn st-btn-primary" to="/offers">View all offers</Link>
                                </div>
                                <div className="row">
                                    {offers.map(product => (
                                        <div key={product._id} className="col-md-6 col-lg-3 col-sm-6 mb-4">
                                            <ShopListCard product={product} cartUpdate={true}/>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="shopping-grid">
                        <div className="container">
                            <div className="st-section-head">
                                <h3 className="st-section-title">LATEST PRODUCTS</h3>
                                <Link className="btn st-btn-outline" to="/shop">View all</Link>
                            </div>
                            <div className="row">
                                {products.map((product, i) => (
                                    <div key={i} className="col-md-6 col-lg-4 col-xs-3 col-sm-6 mb-4">
                                        <ShopListCard product={product} cartUpdate={true}/>
                                    </div>
                                ))}
                            </div>

                        </div>
                    </div>
                    <Ftr/>
                </div>
            );
        } else {
            return (
                <div className="st-loader">
                    <CircularProgress size={80}/>
                </div>
            );
        }
    };

    return (
        <div>
            {appendView()}
        </div>
    );
};

export default Home;
