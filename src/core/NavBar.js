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

    const fontColor = () => {
        return {color: '#000000', fontSize: 15}
    };

    return (
        <div className="row" style={{background: '#fefefe'}}>
            <div className="col-lg-3 m-5">
                <Image src={MenuLogoV1} fluid/>
            </div>
            <div className="col-lg-5 text-center mt-lg-5">
                <div className="row people mt-lg-4">
                    {categories.map(category => (
                        <div key={category._id} className="col item">
                            <Link to={`/product/category/${category._id}`}>
                                <h5 style={fontColor()} className="title text-uppercase">{category.name}</h5>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
            <div className="col-lg-3 container-fluid">
                <ProductSearch/>
            </div>

        </div>
    )
};

export default NavBar;
