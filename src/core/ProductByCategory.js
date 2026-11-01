import React, {useState, useEffect} from "react";
import ShopListCard from "./ShopListCard";
import Ftr from "./Ftr";
import Layout from "./Layout";
import {getProductsByCategory, getSingleCategory} from "./apiCore";
import Carousel from "react-bootstrap/Carousel";
import image1 from "../images/image5.jpg";
import image2 from "../images/image2.jpg";
import image3 from "../images/image4.jpg";
import CategoryCard from "./CategoryCard";
import CircularProgress from "@material-ui/core/CircularProgress";

const ProductByCategory = ({match}) => {
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState('');
    const [error, setError] = useState(false);
    const [errorCategory, setErrorCategory] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showView, setShowView] = useState(false);

    const loadProducts = (categoryId) => {
        getProductsByCategory(categoryId).then(data => {
            console.log("comming inside!");
            setLoading(false);
            if (data.error) {
                setError(data.error);
                setShowView(true);
            } else {
                setProducts(data);
                setShowView(true);
            }
        })
    };

    const getCategory = (categoryId) => {
        getSingleCategory(categoryId).then(data => {
            if (data.error) {
                setErrorCategory(data.error);
            } else {
                setCategory(data);
            }
        })
    };

    useEffect(() => {
        setLoading(true);
        loadProducts(match.params.categoryId);
        getCategory(match.params.categoryId);
    }, []);

    const appendView = () => {
        if (showView) {
            return (
                <div>
                    <div className="shopping-grid">
                        <div className="container">
                            <div className="row">
                                {products.map((product, i) => (
                                    <div key={i} className="col-md-6 col-lg-3 col-xs-3 col-sm-6 mb-3">
                                        <ShopListCard product={product} cartUpdate={true}/>
                                    </div>
                                ))}
                                {products.length === 0 ? <div className="col-12 mt-5 mb-5 text-center
                                    text-capitalize alert alert-info alert-dismissible fade show" role="alert">
                                    <strong>No products related to this category!</strong>
                                </div> : ''}
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
        <Layout title="Shop by category" description={typeof category.name !== 'undefined' ? `Products related to ${category.name}` : 'Products related to'} className="container-fluid">
            {appendView()}
        </Layout>
    );
};

export default ProductByCategory;
