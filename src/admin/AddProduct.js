import React, {useEffect, useState} from "react";
import AdminLayout from "./AdminLayout";
import {isAuthenticate} from "../auth";
import {createProduct} from "./ApiAdmin";
import AutoCompleteCategories from "../autocomplete/AutoCompleteCategories";
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
        currency,
        quantity,
        discount,
        promotionTitle,
        promotionStart,
        promotionEnd,
        error,
        formData
    } = productValues;

    useEffect(() => {
        setProductValues({...productValues, formData: new FormData()})
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    return (
        <AdminLayout backTo="/admin/dashboard" backText="Back to dashboard" title="Add new product" description={`Welcome back ${user.name}, add a new product now!`}>
            <div className="admin-card">
                <div className="admin-card-body">
                    {error && <div className="admin-alert admin-alert-danger"><strong>{error}</strong></div>}
                    <form className="admin-form" onSubmit={submit}>
                        <div className="admin-form-group">
                            <label className="admin-form-label">Post Image</label>
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

                        <div className="admin-form-group">
                            <label className="admin-form-label">Product Name</label>
                            <input
                                type="text"
                                onChange={handleOnChange('name')}
                                className="form-control"
                                value={name}
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Product Description</label>
                            <textarea
                                onChange={handleOnChange('description')}
                                className="form-control"
                                value={description}
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Select Category</label>
                            <AutoCompleteCategories onSelect={onCategoryChangeHandler}/>
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Price</label>
                            <input
                                type="number"
                                onChange={handleOnChange('price')}
                                className="form-control"
                                value={price}
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Discount</label>
                            <input
                                type="number"
                                onChange={handleOnChange('discount')}
                                className="form-control"
                                value={discount}
                                min="0"
                                max="100"
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Promotion Title</label>
                            <input
                                type="text"
                                onChange={handleOnChange('promotionTitle')}
                                className="form-control"
                                value={promotionTitle}
                                placeholder="e.g. Weekend Special"
                            />
                        </div>

                        <div className="admin-form-row">
                            <div className="admin-form-group">
                                <label className="admin-form-label">Promotion Starts</label>
                                <input
                                    type="datetime-local"
                                    onChange={handleOnChange('promotionStart')}
                                    className="form-control"
                                    value={promotionStart}
                                />
                            </div>
                            <div className="admin-form-group">
                                <label className="admin-form-label">Promotion Ends</label>
                                <input
                                    type="datetime-local"
                                    onChange={handleOnChange('promotionEnd')}
                                    className="form-control"
                                    value={promotionEnd}
                                />
                            </div>
                        </div>
                        <span className="admin-form-hint">Leave dates empty to keep a discount active until it is removed.</span>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Quantity</label>
                            <input
                                type="number"
                                onChange={handleOnChange('quantity')}
                                className="form-control"
                                value={quantity}
                            />
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Currency</label>
                            <select
                                onChange={handleOnChange('currency')}
                                className="form-control"
                                value={currency}
                            >
                                <option value="select">Select currency</option>
                                <option value="Rs">Rs</option>
                                <option value="$">$</option>
                            </select>
                        </div>

                        <div className="admin-form-group">
                            <label className="admin-form-label">Take in method</label>
                            <select
                                onChange={handleOnChange('takeInMethod')}
                                className="form-control"
                            >
                                <option value="select">Select a method</option>
                                <option value="false">No</option>
                                <option value="true">Yes</option>
                            </select>
                        </div>

                        <button className="admin-btn admin-btn-primary" type="submit" disabled={loader}>
                            {loader ? 'Loading...' : 'Add Product'}
                        </button>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AddProduct;
