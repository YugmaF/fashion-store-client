import React, {useEffect, useState} from "react";
import Image from "react-bootstrap/Image";
import MenuLogoV1 from "../assets/Logos/Logo_Email-v1.png";
import {Link} from "react-router-dom";
import ProductSearch from "./ProductSearch";
import {getAllCategories} from "./apiCore";
import '../assets/navbar_hover/style.css';


const NavBar = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        getAllCategories().then(data => {
            if (Array.isArray(data)) {
                setCategories(data);
            }
        });
    }, []);

    return (
        <div className="st-header-logo-row row">
            <div className="col-lg-3 col-md-12 text-center text-md-left py-2">
                <Image src={MenuLogoV1} fluid style={{maxHeight: 44}}/>
            </div>
            <div className="col-lg-6 text-center my-2">
                <div className="row people justify-content-center">
                    {categories.map(category => (
                        <div key={category._id} className="col-auto item px-2">
                            <Link to={`/product/category/${category._id}`}>
                                <span className="st-cat-pill">{category.name}</span>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
            <div className="col-lg-3 col-md-12">
                <ProductSearch/>
            </div>

        </div>
    )
};

export default NavBar;
