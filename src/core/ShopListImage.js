import React from "react";
import {API} from "../config";
import Image from "react-bootstrap/Image";

//function to show item image on cart
const ShopListImage = ({item, url}) => {
    if (!item || !item._id) {
        return null;
    }

    return (
        <div className="product-img">
            <Image src={`${API}/${url}/image/${item._id}`} alt={item.name} fluid/>
        </div>
    );
};

export default ShopListImage;