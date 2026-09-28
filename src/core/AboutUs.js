import React from "react";
import {Link} from "react-router-dom";
import Ftr from "./Ftr";
import "./AboutUs.css";
import "../assets/about_us_assets/fonts/font-awesome.min.css";

const storeDetails = [
    {
        icon: "fa-map-marker",
        label: "Visit our flagship store",
        content: "42 Galle Road, Colombo 03, Sri Lanka"
    },
    {
        icon: "fa-phone",
        label: "Call us",
        content: "+94 11 234 5678",
        href: "tel:+94112345678"
    },
    {
        icon: "fa-envelope",
        label: "Email us",
        content: "hello@fashionstore.lk",
        href: "mailto:hello@fashionstore.lk"
    }
];

const AboutUs = () => (
    <div className="about-page">
        <section className="about-hero">
            <div className="container">
                <div className="about-hero-content">
                    <span className="about-eyebrow">ABOUT FASHIONSTORE</span>
                    <h1>Everyday style, thoughtfully selected.</h1>
                    <p>
                        We bring together wearable fashion, honest prices, and friendly service
                        to make finding your next favourite outfit simple.
                    </p>
                    <div className="about-hero-actions">
                        <Link className="btn about-primary-action" to="/shop">Shop the collection</Link>
                        <Link className="btn about-secondary-action" to="/offers">View current offers</Link>
                    </div>
                </div>
            </div>
        </section>

        <main>
            <section className="about-story-section">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6">
                            <span className="about-section-label">OUR STORY</span>
                            <h2>Fashion that fits real life</h2>
                            <p>
                                FashionStore started with a simple idea: shopping for quality,
                                versatile clothing should feel enjoyable and uncomplicated. Our
                                collections cover women, men, kids, shoes, and accessories, with
                                pieces selected for comfort, value, and everyday wear.
                            </p>
                            <p>
                                Whether you shop online or visit our Colombo store, our team is
                                here to help you discover styles that feel like you.
                            </p>
                        </div>
                        <div className="col-lg-5 offset-lg-1">
                            <div className="about-highlight-card">
                                <span className="about-highlight-number">5</span>
                                <strong>curated departments</strong>
                                <p>Everything for the family, all in one place.</p>
                                <div className="about-category-list">
                                    <span>Women</span>
                                    <span>Men</span>
                                    <span>Kids</span>
                                    <span>Shoes</span>
                                    <span>Accessories</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="about-values-section">
                <div className="container">
                    <div className="about-section-heading">
                        <span className="about-section-label">WHY SHOP WITH US</span>
                        <h2>A better fashion-store experience</h2>
                    </div>
                    <div className="row">
                        <div className="col-md-4">
                            <article className="about-value-card">
                                <div className="about-value-icon" aria-hidden="true">
                                    <i className="fa fa-check"></i>
                                </div>
                                <h3>Curated quality</h3>
                                <p>Practical, well-made styles chosen to look good beyond one season.</p>
                            </article>
                        </div>
                        <div className="col-md-4">
                            <article className="about-value-card">
                                <div className="about-value-icon" aria-hidden="true">
                                    <i className="fa fa-tags"></i>
                                </div>
                                <h3>Fair value</h3>
                                <p>Clear pricing and regular offers make refreshing your wardrobe easier.</p>
                            </article>
                        </div>
                        <div className="col-md-4">
                            <article className="about-value-card">
                                <div className="about-value-icon" aria-hidden="true">
                                    <i className="fa fa-heart"></i>
                                </div>
                                <h3>Personal service</h3>
                                <p>Helpful support online and in store, from first browse to final fit.</p>
                            </article>
                        </div>
                    </div>
                </div>
            </section>

            <section className="about-location-section">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-5">
                            <span className="about-section-label">VISIT US</span>
                            <h2>Our Colombo flagship store</h2>
                            <p className="about-location-intro">
                                Explore the latest arrivals in person, get help with sizing, or
                                collect inspiration for your next look.
                            </p>

                            <div className="about-contact-list">
                                {storeDetails.map(detail => (
                                    <div className="about-contact-item" key={detail.label}>
                                        <div className="about-contact-icon" aria-hidden="true">
                                            <i className={`fa ${detail.icon}`}></i>
                                        </div>
                                        <div>
                                            <strong>{detail.label}</strong>
                                            {detail.href ? (
                                                <a href={detail.href}>{detail.content}</a>
                                            ) : (
                                                <span>{detail.content}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="about-hours">
                                <div className="about-contact-icon" aria-hidden="true">
                                    <i className="fa fa-clock-o"></i>
                                </div>
                                <div>
                                    <strong>Opening hours</strong>
                                    <dl>
                                        <div><dt>Monday - Saturday</dt><dd>10:00 AM - 8:00 PM</dd></div>
                                        <div><dt>Sunday</dt><dd>10:00 AM - 6:00 PM</dd></div>
                                    </dl>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-7">
                            <div className="about-map-card">
                                <iframe
                                    title="FashionStore location in Colombo"
                                    src="https://www.openstreetmap.org/export/embed.html?bbox=79.8485%2C6.9040%2C79.8645%2C6.9200&amp;layer=mapnik&amp;marker=6.9120%2C79.8565"
                                    loading="lazy"
                                ></iframe>
                                <div className="about-map-footer">
                                    <div>
                                        <strong>FashionStore Colombo</strong>
                                        <span>42 Galle Road, Colombo 03</span>
                                    </div>
                                    <a
                                        href="https://www.openstreetmap.org/?mlat=6.9120&amp;mlon=79.8565#map=16/6.9120/79.8565"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Open map <i className="fa fa-external-link" aria-hidden="true"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>

        <Ftr/>
    </div>
);

export default AboutUs;
