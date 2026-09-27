import React, {useEffect, useState} from "react";
import '../assets/category_card_assets/bootstrap/css/bootstrap.min.css';
import '../assets/category_card_assets/fonts/font-awesome.min.css';
import '../assets/category_card_assets/css/styles.css';
import '../assets/category_card_assets/css/Team-Grid.css';
import womenImage from '../assets/category_card_assets/img/category-women.jpg';
import menImage from '../assets/category_card_assets/img/category-men.jpg';
import shoesImage from '../assets/category_card_assets/img/category-shoes.jpg';
import accessoriesImage from '../assets/category_card_assets/img/category-accessories.jpg';
import kidsImage from '../assets/category_card_assets/img/category-kids.jpg';
import {Link} from "react-router-dom";
import {getAllCategories} from "./apiCore";

const categoryImages = {
    Women: womenImage,
    Men: menImage,
    Shoes: shoesImage,
    Accessories: accessoriesImage,
    Kids: kidsImage
};

const CategoryCard = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        getAllCategories().then(data => {
            if (Array.isArray(data)) {
                setCategories(data);
            }
        });
    }, []);

    return (
        <div className="row people justify-content-center">
            {categories.map(category => (
                <div key={category._id} className="col-md-4 col-lg item">
                    <Link to={`/product/category/${category._id}`}>
                        <div
                            className="box"
                            style={{backgroundImage: `url(${categoryImages[category.name] || accessoriesImage})`}}
                        >
                            <div className="cover">
                                <p className="title">{category.name}</p>
                            </div>
                        </div>
                    </Link>
                </div>
            ))}
        </div>
    );
};

export default CategoryCard;
