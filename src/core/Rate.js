import React, {useEffect, useState} from "react";
import Rater from 'react-rater'
import 'react-rater/lib/react-rater.css'
import {isAuthenticate} from "../auth";
import {addRating} from "./apiCore";
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css';
import CircularProgress from "@material-ui/core/CircularProgress"; // Import css

const RateComponent = (props) => {
    const [ratings, setRatings] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [raterKey, setRaterKey] = useState(0);

    const getAverageRating = (rating) => {
        if (Array.isArray(rating) && rating.length > 0) {
            const votedCount = rating.length;
            let rateSum = 0;
            rating.forEach(rate => {
                rateSum += rate;
            });
            return Math.ceil(rateSum / votedCount);
        }
        return 0;
    };

    useEffect(() => {
        setRatings(Array.isArray(props.product.rating) ? props.product.rating : []);
    }, [props.product.rating]);

    const onRateClicked = (rate) => {
        const authentication = isAuthenticate();

        if (!authentication || !authentication.user) {
            setRaterKey(currentKey => currentKey + 1);
            confirmAlertMessage('Sign In Required', 'Please sign in before rating a product.');
            return;
        }

        if (!props.product._id) {
            return;
        }

        setSubmitting(true);
        addRating(
            authentication.user._id,
            authentication.token,
            props.product._id,
            rate.rating
        ).then(data => {
            if (!data || data.error) {
                setRaterKey(currentKey => currentKey + 1);
                confirmAlertMessage('Rating Not Submitted', data && data.error
                    ? data.error
                    : 'Please try again.');
                return;
            }

            setRatings(Array.isArray(data.rating) ? data.rating : [...ratings, rate.rating]);
            confirmAlertMessage('Thank You!', 'Successfully submitted your rating.');
        }).finally(() => setSubmitting(false));
    };

    const confirmAlertMessage = (title, message) => {
        confirmAlert({
            title,
            message,
            buttons: [
                {
                    label: 'Close',
                }
            ]
        });
    };

    return(
        <div>
            <Rater
                key={raterKey}
                total={5}
                interactive={!submitting && Boolean(props.product._id)}
                rating={getAverageRating(ratings)}
                onRate={onRateClicked}
            />
            {submitting ? <CircularProgress className="ml-4" size={30}/> : ''}
        </div>
    );
};

export default RateComponent;
