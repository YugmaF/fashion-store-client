import React from "react";
import Ftr from "./Ftr";
import '../assets/about_us_assets/bootstrap/css/bootstrap.min.css';
import '../assets/about_us_assets/fonts/font-awesome.min.css';
import '../assets/about_us_assets/css/styles.css';
import '../assets/about_us_assets/css/Team-Boxed.css'
import yp from '../assets/about_us_assets/img/yp.jpg';
import ug from '../assets/about_us_assets/img/ug.png';
import kasun from '../assets/about_us_assets/img/kasun.jpg';
import ckw from '../assets/about_us_assets/img/ckw.jpg';

const AboutUs = () => {
  return (
    <div>
        <div className="container">
            <div className="st-page-hero about-us-hero">
                <div>
                    <h1>About Us</h1>
                    <p>The team behind Quarantine Fashion Store — building a modern shopping experience.</p>
                </div>
            </div>
        </div>
        <div className="team-boxed">
            <div className="container">
                <div className="intro">
                    <h2 className="text-center">Team - Quarantine Squad</h2>
                    <p className="text-center">Application Framework Assignment</p>
                </div>
                <div className="row people">
                    <div className="col-md-6 col-lg-3 col-sm-12 item">
                        <div className="box"><img className="rounded-circle" src={yp} alt="Yugma Fernando"/>
                            <h3 className="name">Yugma<br/> Fernando</h3>
                            <p className="title">IT17167192</p>
                            <p className="description">Group Leader</p>
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-3 col-sm-12 item">
                        <div className="box"><img className="rounded-circle" src={ug} alt="Upeksha Galappaththi"/>
                            <h3 className="name">Upeksha Galappaththi</h3>
                            <p className="title">IT17165730</p>
                            <p className="description">Group Member</p>
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-3 col-sm-12 item">
                        <div className="box"><img className="rounded-circle" src={kasun} alt="Kasun Gunasekara"/>
                            <h3 className="name">Kasun Gunasekara</h3>
                            <p className="title">IT17186698</p>
                            <p className="description">Group Member</p>
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-3 col-sm-12 item">
                        <div className="box"><img className="rounded-circle" src={ckw} alt="Chamith Weligepola"/>
                            <h3 className="name">Chamith Weligepola</h3>
                            <p className="title">IT17164368</p>
                            <p className="description">Group Member</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <Ftr/>
    </div>
  );
}

export default AboutUs;