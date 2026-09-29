import React, { useState } from "react";
import { MDBCol, MDBContainer, MDBRow, MDBFooter } from "mdbreact";
import { API } from "../config";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FooterPage = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(false);
    const [subscribing, setSubscribing] = useState(false);

    const handleSubscribe = async (e) => {
        e.preventDefault();
        setMessage(null);

        if (!EMAIL_REGEX.test(email.trim())) {
            setError(true);
            setMessage("Please enter a valid email address.");
            return;
        }

        setSubscribing(true);
        try {
            const response = await fetch(`${API}/newsletter`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({ email: email.trim() }),
            });

            if (!response.ok) {
                setError(true);
                setMessage(
                    `Subscription failed (status ${response.status}). Please try again later.`
                );
                return;
            }

            setError(false);
            setMessage("Thank you for subscribing!");
            setEmail("");
        } catch (err) {
            setError(true);
            setMessage("Network error. Please check your connection and try again.");
        } finally {
            setSubscribing(false);
        }
    };

    return (
        <MDBFooter color="blue" className="font-small pt-4 mt-4">
            <MDBContainer fluid className="text-center text-md-center">
                <MDBRow>
                    <MDBCol md="12">
                        <h5 className="title">Footer Content</h5>
                        <p>
                            Here you can use rows and columns here to organize your footer
                            content.
                        </p>
                    </MDBCol>
                </MDBRow>
                <MDBRow>
                    <MDBCol md="12">
                        <h5 className="title">Newsletter</h5>
                        <form
                            onSubmit={handleSubscribe}
                            style={{ maxWidth: "480px", margin: "0 auto" }}
                            noValidate
                        >
                            <div className="d-flex justify-content-center">
                                <input
                                    type="email"
                                    className="form-control mr-2"
                                    placeholder="Your email address"
                                    aria-label="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={subscribing}
                                >
                                    {subscribing ? "Subscribing..." : "Subscribe"}
                                </button>
                            </div>
                            {message && (
                                <p
                                    role="status"
                                    style={{
                                        marginTop: "8px",
                                        marginBottom: 0,
                                        color: error ? "#ffdddd" : "#ffffff",
                                        fontWeight: error ? "normal" : "bold",
                                    }}
                                >
                                    {message}
                                </p>
                            )}
                        </form>
                    </MDBCol>
                </MDBRow>
            </MDBContainer>
            <div className="footer-copyright text-center py-3">
                <MDBContainer fluid>
                    &copy; {new Date().getFullYear()} Copyright: <a href="https://www.fashionstoreafproject.com"> Fashionstoreafproject.com </a>
                </MDBContainer>
            </div>
        </MDBFooter>
    );
}

export default FooterPage;
