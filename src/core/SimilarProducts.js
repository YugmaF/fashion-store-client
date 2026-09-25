import React, {useState, useEffect} from "react";
import '../assets/similar_products_assets/bootstrap/css/bootstrap.min.css';
import '../assets/similar_products_assets/fonts/font-awesome.min.css';
import '../assets/similar_products_assets/css/Bootstrap-Cards-v2.css';
import '../assets/similar_products_assets/css/styles.css';
import {getRelatedProducts} from "./apiCore";
import {API} from "../config";
import Image from 'react-bootstrap/Image'
import {formatPrice, getDiscountedPrice, isPromotionActive} from "./pricing";

const SimilarProducts = (props) => {
    const [similarProducts, setSimilarProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        getRelatedProducts(props.productId)
            .then(data => {
                if(data.error){
                    setError(true);
                }else{
                    setSimilarProducts(data);
                }
            })
    }, [])

    const showRating = (rating) => {
        if (rating.length > 0) {
            const votedCount = rating.length;
            let rateSum = 0;
            rating.forEach(rate => {
                rateSum += rate;
            });
            const averageRating = Math.ceil(rateSum / votedCount);
            let startArray = [];
            for (let i = 0; i < averageRating; i++)
                startArray.push(<li key={i} className="list-inline-item m-0"><i className="fa fa-star text-success"></i></li>);
            for (let i = averageRating; i < 5; i++)
                startArray.push(<li key={i} className="list-inline-item m-0"><i className="fa fa-star-o text-success"></i></li>);

            return (
                <ul className="list-inline small">
                    {startArray}
                </ul>
            );
        } else {
            return (
                <ul className="list-inline small">
                    <li key={1} className="list-inline-item m-0"><i className="fa fa-star-o text-success"></i></li>
                    <li key={2} className="list-inline-item m-0"><i className="fa fa-star-o text-success"></i></li>
                    <li key={3} className="list-inline-item m-0"><i className="fa fa-star-o text-success"></i></li>
                    <li key={4} className="list-inline-item m-0"><i className="fa fa-star-o text-success"></i></li>
                    <li key={5} className="list-inline-item m-0"><i className="fa fa-star-o text-success"></i></li>
                </ul>
            );
        }
    };

    const populateSimilarProducts = () => {
        let renderData = [];
        similarProducts.forEach(similarProduct => {
            renderData.push(<div key={similarProduct._id} className="col-lg-3 col-md-6 mb-4 mb-lg-0">
                <div className="card rounded shadow-sm border-0">
                    <div className="card-body p-4">
                        <a href={`/product/${similarProduct._id}`}>
                            <Image
                                src={`${API}/product/image/${similarProduct._id}`}
                                alt=""
                                className="img-fluid d-block mx-auto mb-3"
                            />

                        </a>
                        <h5>
                            <a href={`/product/${similarProduct._id}`} className="text-dark">{similarProduct.name}</a>
                        </h5>
                        <div
                            className="price">{similarProduct.currency + ' ' + formatPrice(getDiscountedPrice(similarProduct))}
                            <span className="ml-2"
                                style={{"color": "red", textDecoration: 'line-through'}}>{isPromotionActive(similarProduct) ? similarProduct.currency + ' ' + formatPrice(similarProduct.price) : ''}</span>
                        </div>
                        <p className="small text-muted font-italic">{similarProduct.description}</p>
                        {showRating(similarProduct.rating)}
                    </div>
                </div>
            </div>);
        });

        return renderData.length > 0 ? renderData : null;
    };

    return (
        <div>
            <h4 class="font-weight-bold mt-2 mb-5">Similar products</h4>
            {!populateSimilarProducts() ? <div className="alert alert-info alert-dismissible fade show" role="alert">
                <strong>No related products!</strong>
            </div> : ''}
            <div class="row pb-5 mb-4">
                {populateSimilarProducts()}
            </div>
        </div>
    );
};

export default SimilarProducts;
