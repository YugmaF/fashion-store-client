import React from "react";
import {API} from "../config";
import Image from 'react-bootstrap/Image'
import CircularProgress from "@material-ui/core/CircularProgress";

const ShowSingleImage = ({item, url}) => {
    if (!item || !item._id) {
        return <CircularProgress size={30}/>;
    }

    return (
        <div className="product-img">
            <Image src={`${API}/${url}/image/${item._id}`} alt={item.name} fluid />
        </div>
    );
};

export default ShowSingleImage;
