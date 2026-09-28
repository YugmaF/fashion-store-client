import React, { useState } from "react";
import { MDBCol, MDBContainer, MDBRow, MDBFooter, MDBBtn, MDBInput } from "mdbreact";
import { API } from "../config";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FooterPage = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const trimmed = email.trim();

        if (!EMAIL_RE.test(trimmed)) {
            setMessage({ type: "error", text: "Please enter a valid email address." });
            return;
        }

        try {
            const response = await fetch(`${API}/newsletter`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: trimmed })
            });

            if (!response.ok) {
                setMessage({ type: "error", text: `Subscription failed (${response.status}). Please try again.` });
                return;
            }

            setMessage({ type: "success", text: "Thank you for subscribing!" });
            setEmail("");
        } catch {
            setMessage({ type: "error", text: "Network error. Please try again later." });
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
                    <MDBCol md="12">
                        <h5 className="title">Newsletter</h5>
                        <form onSubmit={handleSubmit} className="d-flex justify-content-center">
                            <MDBInput
                                type="email"
                                label="Your email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                style={{ maxWidth: "250px" }}
                            />
                            <MDBBtn type="submit" color="white" className="ml-2">Subscribe</MDBBtn>
                        </form>
                        {message && (
                            <p style={{ color: message.type === "error" ? "salmon" : "white" }}>
                                {message.text}
                            </p>
                        )}
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
