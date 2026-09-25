import React, {useEffect, useState, Fragment} from "react";
import Layout from "../core/Layout";
import {isAuthenticate} from "../auth";
import {Link} from "react-router-dom";
import "mdbreact/dist/css/mdb.css";
import {createProduct} from "./ApiAdmin";
import {MDBContainer, MDBRow, MDBCol, MDBBtn, MDBCard, MDBCardBody, MDBIcon, MDBAlert} from 'mdbreact';
import AutoCompleteCategories from "../autocomplete/AutoCompleteCategories";
import Ftr from "../core/Ftr";
import {confirmAlert} from "react-confirm-alert";

const AddProduct = () => {
    const {user, token} = isAuthenticate();
    const [loader, setLoader] = useState(false);
    const [productValues, setProductValues] = useState({
        name: '',
        description: '',
        price: '',
        categories: [],
        category: '',
        currency: 'Rs',
        quantity: '',
        takeInMethod: 'false',
        image: '',
        loading: false,
        discount: '0.00',
        promotionTitle: '',
        promotionStart: '',
        promotionEnd: '',
        error: false,
        createdProduct: false,
        showSuccess: false,
        redirectToProfile: '',
        formData: ''
    });

    const {
        name,
        description,
        price,
        categories,
        category,
        currency,
        quantity,
        takeInMethod,
        loading,
        discount,
        promotionTitle,
        promotionStart,
        promotionEnd,
        error,
        createdProduct,
        showSuccess,
        redirectToProfile,
        formData
    } = productValues;

    useEffect(() => {
        setProductValues({...productValues, formData: new FormData()})
    }, []);

    const handleOnChange = (name) => (event) => {
        const value = name === 'image' ? event.target.files[0] : event.target.value;
        const formValue = (name === 'promotionStart' || name === 'promotionEnd') && value
            ? new Date(value).toISOString()
            : value;
        formData.set(name, formValue);
        setProductValues({...productValues, [name]: value});
    };

    const onCategoryChangeHandler = (categoryId) => {
        formData.set("category", categoryId);
        setProductValues({...productValues, "category": categoryId});
    };

    const submit = (event) => {
        event.preventDefault();
        setLoader(true);
        setProductValues({...productValues, error: '', loading: true});

        if (!takeInMethod) {
            setProductValues({...productValues, takeInMethod: 'false'});
        }

        if (!currency) {
            setProductValues({...productValues, currency: 'Rs'});
        }

        if(productValues.image){
            createProduct(user._id, token, formData)
                .then(data => {
                    if (data.error) {
                        setProductValues({...productValues, error: data.error, showSuccess: false});
                        setLoader(false);
                    } else {
                        setLoader(false);
                        setProductValues({
                            ...productValues,
                            name: '',
                            description: '',
                            image: '',
                            price: '',
                            quantity: '',
                            category: '',
                            loading: false,
                            discount: '',
                            promotionTitle: '',
                            promotionStart: '',
                            promotionEnd: '',
                            currency: '',
                            error: false,
                            showSuccess: true,
                            createProduct: data.name,
                            formData: new FormData()
                        });
                        confirmAlert({
                            title: 'New product is created successfully!',
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
                title: 'Please upload an image!',
                buttons: [
                    {
                        label: 'OK',
                    }
                ]
            });
            setLoader(false);
        }

    };

    const showErrorMsg = () => {
        if (error) {
            confirmAlert({
                title: error,
                buttons: [
                    {
                        label: 'OK',
                    }
                ]
            });
        }
    };

    const newPostForm = () => (
        <div>
            <MDBContainer>
                <MDBRow>
                    <MDBCol md="12" lg="12" sm="12">
                        {showErrorMsg()}
                        <MDBCard>
                            <MDBCardBody>
                                <form onSubmit={submit}>
                                    <div className="input-group">
                                        <div className="input-group-prepend">
                                        <span className="input-group-text" id="inputGroupFileAddon01">
                                          Post Image
                                        </span>
                                        </div>
                                        <div className="custom-file">
                                            <input
                                                type="file"
                                                onChange={handleOnChange('image')}
                                                className="custom-file-input"
                                                name="image"
                                                accept="image/*"
                                            />
                                            <label className="custom-file-label" htmlFor="inputGroupFile01">
                                                Browse an image
                                            </label>
                                        </div>
                                    </div>
                                    <br/>
                                    <label
                                        htmlFor="defaultFormCardNameEx"
                                        className="grey-text font-weight-light"
                                    >
                                        Product Name
                                    </label>
                                    <input
                                        type="text"
                                        onChange={handleOnChange('name')}
                                        className="form-control"
                                        value={name}
                                    />
                                    <br/>
                                    <label
                                        htmlFor="defaultFormCardNameEx"
                                        className="grey-text font-weight-light"
                                    >
                                        Product Description
                                    </label>
                                    <textarea
                                        type="text"
                                        onChange={handleOnChange('description')}
                                        className="form-control"
                                        value={description}
                                    />
                                    <br/>
                                    <label
                                        htmlFor="defaultFormCardNameEx"
                                        className="grey-text font-weight-light"
                                    >
                                        Select Category
                                    </label>
                                    <AutoCompleteCategories onSelect={onCategoryChangeHandler}/>
                                    <br/>
                                    <label
                                        htmlFor="defaultFormCardNameEx"
                                        className="grey-text font-weight-light"
                                    >
                                        Price
                                    </label>
                                    <input
                                        type="number"
                                        onChange={handleOnChange('price')}
                                        className="form-control"
                                        value={price}
                                    />
                                    <br/>
                                    <label
                                        htmlFor="defaultFormCardNameEx"
                                        className="grey-text font-weight-light"
                                    >
                                        Discount
                                    </label>
                                    <input
                                        type="number"
                                        onChange={handleOnChange('discount')}
                                        className="form-control"
                                        value={discount}
                                        min="0"
                                        max="100"
                                    />
                                    <br/>
                                    <label
                                        htmlFor="promotionTitle"
                                        className="grey-text font-weight-light"
                                    >
                                        Promotion Title
                                    </label>
                                    <input
                                        id="promotionTitle"
                                        type="text"
                                        onChange={handleOnChange('promotionTitle')}
                                        className="form-control"
                                        value={promotionTitle}
                                        placeholder="e.g. Weekend Special"
                                    />
                                    <br/>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <label
                                                htmlFor="promotionStart"
                                                className="grey-text font-weight-light"
                                            >
                                                Promotion Starts
                                            </label>
                                            <input
                                                id="promotionStart"
                                                type="datetime-local"
                                                onChange={handleOnChange('promotionStart')}
                                                className="form-control"
                                                value={promotionStart}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label
                                                htmlFor="promotionEnd"
                                                className="grey-text font-weight-light"
                                            >
                                                Promotion Ends
                                            </label>
                                            <input
                                                id="promotionEnd"
                                                type="datetime-local"
                                                onChange={handleOnChange('promotionEnd')}
                                                className="form-control"
                                                value={promotionEnd}
                                            />
                                        </div>
                                    </div>
                                    <small className="form-text text-muted mb-3">
                                        Leave dates empty to keep a discount active until it is removed.
                                    </small>
                                    <label
                                        htmlFor="defaultFormCardNameEx"
                                        className="grey-text font-weight-light"
                                    >
                                        Quantity
                                    </label>
                                    <input
                                        type="number"
                                        onChange={handleOnChange('quantity')}
                                        className="form-control"
                                        value={quantity}
                                    />
                                    <br/>
                                    <label
                                        htmlFor="defaultFormCardNameEx"
                                        className="grey-text font-weight-light"
                                    >
                                        Currency
                                    </label>
                                    <select
                                        onChange={handleOnChange('currency')}
                                        className="form-control"
                                    >
                                        <option value="select">Select currency</option>
                                        <option value="Rs">Rs</option>
                                        <option value="$">$</option>
                                    </select>
                                    <br/>
                                    <label
                                        htmlFor="defaultFormCardNameEx"
                                        className="grey-text font-weight-light"
                                    >
                                        Take in method
                                    </label>
                                    <select
                                        onChange={handleOnChange('takeInMethod')}
                                        className="form-control"
                                    >
                                        <option value="select">Select a method</option>
                                        <option value="false">No</option>
                                        <option value="true">Yes</option>
                                    </select>
                                    <div className="text-center py-4 mt-3">
                                        <MDBBtn className="btn btn-blue" type="submit"
                                            disabled={loader}>{loader ? 'Loading...' : 'Add Product'}
                                        </MDBBtn>
                                    </div>
                                </form>
                            </MDBCardBody>
                        </MDBCard>
                    </MDBCol>
                </MDBRow>
            </MDBContainer>
        </div>

    );

    return (
     <div>
        <Layout back={true} backText="Back to dashboard" to="/admin/dashboard" title="Add new product" description={`Welcome back ${user.name}, Add a new product now!`}
                className="container-fluid">
            {newPostForm()}
            <hr/>

        </Layout>
        <Ftr/>
     </div>
    );
};

export default AddProduct;
