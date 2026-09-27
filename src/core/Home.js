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
                    <div className="mb-5">
                        <Carousel interval={6000}>
                            <Carousel.Item>
                                <img
                                    className="d-block w-100"
                                    src={image1}
                                    alt="Featured fashion collection"
                                />
                            </Carousel.Item>
                            <Carousel.Item>
                                <img
                                    className="d-block w-100"
                                    src={image2}
                                    alt="Seasonal fashion arrivals"
                                />
                            </Carousel.Item>
                            <Carousel.Item>
                                <img
                                    className="d-block w-100"
                                    src={image3}
                                    alt="Everyday fashion essentials"
                                />
                            </Carousel.Item>
                            <Carousel.Item>
                                <img
                                    className="d-block w-100"
                                    src={image4}
                                    alt="New fashion styles"
                                />
                            </Carousel.Item>
                        </Carousel>
                    </div>
                    <div style={{marginTop: "100px"}} className="team-grid">
                        <div className="container">
                            <h2 className="font-weight-bold" align="center">SHOP BY CATEGORIES</h2>
                            <CategoryCard/>
                        </div>
                    </div>

                    {offers.length > 0 && (
                        <div className="offers-home-section">
                            <div className="container">
                                <div className="offers-heading">
                                    <div>
                                        <span className="offers-kicker">LIMITED-TIME SAVINGS</span>
                                        <h2 className="font-weight-bold">PROMOTIONAL OFFERS</h2>
                                    </div>
                                    <Link className="btn btn-outline-dark" to="/offers">View all offers</Link>
                                </div>
                                <div className="row">
                                    {offers.map(product => (
                                        <div key={product._id} className="col-md-6 col-lg-3 col-sm-6 mb-3">
                                            <ShopListCard product={product} cartUpdate={true}/>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="shopping-grid">
                        <div className="container">
                            <h3 className="font-weight-bold" align="center">LATEST PRODUCTS</h3>
                            <div className="row">
                                {products.map((product, i) => (
                                    <div key={i} className="col-md-6 col-lg-3 col-xs-3 col-sm-6 mb-3">
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
                <div className="container-fluid text-center mt-5">
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
