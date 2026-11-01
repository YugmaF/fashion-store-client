import React, {useState} from "react";
import '../assets/footer_assets/bootstrap/css/bootstrap.min.css';
import '../assets/footer_assets/fonts/font-awesome.min.css';
import '../assets/footer_assets/css/styles.css';
import {confirmAlert} from "react-confirm-alert";
import {newsletterSignUp} from "../auth";
import CircularProgress from "@material-ui/core/CircularProgress"; // Import css

const FtrMin = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        let value = event.target.value;
        console.log(value);
        setEmail(value);
    }

    const subscribe = (event) => {
        event.preventDefault();
        setLoading(true);
        console.log(email);
        if (email) {
            newsletterSignUp(email).then(data => {
                if (data.error) {
                    console.log(data.error);
                }else{
                    setEmail('');
                    setLoading(false);
                    confirmAlert({
                        title: 'Thank you for subscribing us!',
                        buttons: [
                            {
                                label: 'OK',
                            }
                        ]
                    });
                }
            });
        }else{
            confirmAlert({
                title: 'Email is required!',
                buttons: [
                    {
                        label: 'OK',
                    }
                ]
            });
            setLoading(false);
        }
    }

    return (
        <footer className="st-footer">
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-md-4 mb-4 text-center text-md-left">
                        <h3 className="st-footer-title">Visit & Contact</h3>
                        <p className="mb-1"><i className="fa fa-map-marker fa-fw"/>&nbsp;Royal Road - Tamarin - Mauritius</p>
                        <p className="mb-1"><i className="fa fa-phone fa-fw"/>&nbsp;+94 75 5172 666</p>
                        <p className="mb-1"><i className="fa fa-envelope fa-fw"/>&nbsp;<a href="mailto:contact@company.com">quarantinefashionstore@google.com</a></p>
                    </div>
                    <div className="col-md-4 mb-4 text-center">
                        <p className="mb-0">The Quarantine Fashion Store offers a wide range of clothes and accessories for everyone.
                            Our vision is to provide our valued customers with quality products at an affordable price.</p>
                    </div>
                    <div className="col-md-4 mb-4 text-center text-md-right">
                        <h3 className="st-footer-title">Follow us</h3>
                        <p className="mb-2">Subscribe to our newsletter</p>
                        <form className="st-newsletter">
                            <input type="text" placeholder="Your email"
                                   onChange={handleChange}
                                   value={email ? email : ''}
                                   pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,15}$"
                                   inputMode="email"/>
                            <button className="btn st-btn-primary" onClick={subscribe} type="submit">{loading ? <CircularProgress size={18} color="inherit"/> : 'Go!'}</button>
                        </form>
                        <div className="st-footer-social mt-3">
                            <a href="#" aria-label="Instagram"><i className="fa fa-instagram fa-2x"/></a>
                            <a href="#" aria-label="Twitter"><i className="fa fa-twitter fa-2x"/></a>
                            <a href="#" aria-label="Facebook"><i className="fa fa-facebook-square fa-2x"/></a>
                            <a href="#" aria-label="Snapchat"><i className="fa fa-snapchat-ghost fa-2x"/></a>
                        </div>
                    </div>
                </div>
                <div className="st-footer-bottom">
                    © 2020 Quarantine Fashion Store ~ All rights reserved
                </div>
            </div>
        </footer>
    );
}

export default FtrMin;
