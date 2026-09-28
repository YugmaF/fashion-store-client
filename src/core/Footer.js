import React, { useState } from "react";
import { MDBCol, MDBContainer, MDBRow, MDBFooter, MDBInput, MDBBtn } from "mdbreact";
import { API } from "../config";

const FooterPage = () => {
    const [email, setEmail] = useState("");

    const subscribe = () => {
        fetch(`${API}/newsletter`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });
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
                        <MDBInput
                            type="email"
                            label="Your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <MDBBtn color="primary" onClick={subscribe}>Subscribe</MDBBtn>
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
