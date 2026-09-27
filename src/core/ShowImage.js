import React, {useState, useEffect} from "react";
import {getImage} from "./apiCore";
import CircularProgress from "@material-ui/core/CircularProgress";

const ShowImage = ({item}) => {

    const [image, setImage] = useState('');
    const [loading, setLoading] = useState(true);
    const itemId = item && item._id;

    const loadImage = (id) => {
        getImage(id).then(data => {
            if (data) {
                setImage(data.url);
            }
            setLoading(false);
        });
    };

    useEffect(() => {
        setLoading(true);
        setImage('');

        if (itemId) {
            loadImage(itemId);
        }
    }, [itemId]);

    if (loading || !item || !item._id) {
        return (
            <div style={{height: "182px", width: "360px", marginTop: "40%", marginLeft: "45%"}}>
                <CircularProgress size={30}/>
            </div>
        );
    } else {
        return (
            <div className="product-img img-thumbnail text-center">
                <img
                    src={image}
                    alt={item.name}
                    className="mb-3 col-auto"
                    style={{height: "300px", width: "300px"}}
                />
            </div>
        )
    }

};

export default ShowImage;
