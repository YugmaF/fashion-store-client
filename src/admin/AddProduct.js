import React, {useEffect, useState} from "react";
import AdminLayout from "./AdminLayout";
import {isAuthenticate} from "../auth";
import {createProduct} from "./ApiAdmin";
import AutoCompleteCategories from "../autocomplete/AutoCompleteCategories";
import {confirmAlert} from "react-confirm-alert";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCloudUploadAlt} from "@fortawesome/free-solid-svg-icons";

const AddProduct = () => {
    const {user, token} = isAuthenticate();
    const [loader, setLoader] = useState(false);
    const [imageName, setImageName] = useState('');
    const [productValues, setProductValues] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        currency: 'Rs',
        quantity: '',
        takeInMethod: 'false',
        image: '',
        discount: '0.00',
        promotionTitle: '',
        promotionStart: '',
        promotionEnd: '',
        error: false,
        showSuccess: false,
        formData: ''
    });

    const {
        name, description, price, category, currency, quantity, takeInMethod,
        discount, promotionTitle, promotionStart, promotionEnd, error, showSuccess, formData
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
        if (name === 'image' && value) {
            setImageName(value.name);
        }
        setProductValues({...productValues, [name]: value});
    };

    const onCategoryChangeHandler = (categoryId) => {
        formData.set("category", categoryId);
        setProductValues({...productValues, category: categoryId});
    };

    const submit = (event) => {
        event.preventDefault();
        setLoader(true);
        setProductValues({...productValues, error: '', loading: true});

        if (!productValues.image) {
            confirmAlert({title: 'Please upload an image!', buttons: [{label: 'OK'}]});
            setLoader(false);
            return;
        }

        createProduct(user._id, token, formData)
            .then(data => {
                if (data.error) {
                    setProductValues({...productValues, error: data.error, showSuccess: false});
                    setLoader(false);
                } else {
                    setLoader(false);
                    setImageName('');
                    setProductValues({
                        ...productValues,
                        name: '', description: '', image: '', price: '', quantity: '',
                        category: '', discount: '0.00', promotionTitle: '', promotionStart: '',
                        promotionEnd: '', currency: 'Rs', error: false, showSuccess: true,
                        formData: new FormData()
                    });
                    confirmAlert({title: 'New product is created successfully!', buttons: [{label: 'OK'}]});
                }
            });
    };

    return (
        <AdminLayout
            back
            backText="Back to dashboard"
            to="/admin/dashboard"
            title="Add New Product"
            description={`Welcome back ${user.name}, add a new product now!`}
        >
            <div className="ad-card">
                <div className="ad-card-header">
                    <div>
                        <h2>Product details</h2>
                        <p>Fill in the details below to list a new product</p>
                    </div>
                </div>
                <div className="ad-card-body">
                    {error && <div className="ad-alert ad-alert-danger"><strong>{error}</strong></div>}
                    {showSuccess && <div className="ad-alert ad-alert-success"><strong>Product created successfully!</strong></div>}

                    <form onSubmit={submit}>
                        <p className="ad-form-section-title">Media</p>
                        <label className="ad-file-drop">
                            <input type="file" onChange={handleOnChange('image')} name="image" accept="image/*"/>
                            <div className="ad-file-drop-icon"><FontAwesomeIcon icon={faCloudUploadAlt}/></div>
                            <div className="ad-file-drop-text">
                                <strong>{imageName || 'Click to upload a product photo'}</strong>
                                <span>PNG or JPG, ideally square</span>
                            </div>
                        </label>

                        <p className="ad-form-section-title">Basic information</p>
                        <div className="ad-form-grid">
                            <div className="ad-field">
                                <label>Product name</label>
                                <input type="text" onChange={handleOnChange('name')} className="ad-input" value={name} required/>
                            </div>
                            <div className="ad-field">
                                <label>Category</label>
                                <AutoCompleteCategories onSelect={onCategoryChangeHandler}/>
                            </div>
                            <div className="ad-field ad-field-full">
                                <label>Description</label>
                                <textarea onChange={handleOnChange('description')} className="ad-textarea" value={description}/>
                            </div>
                        </div>

                        <p className="ad-form-section-title">Pricing &amp; promotion</p>
                        <div className="ad-form-grid">
                            <div className="ad-field">
                                <label>Price</label>
                                <input type="number" onChange={handleOnChange('price')} className="ad-input" value={price} required/>
                            </div>
                            <div className="ad-field">
                                <label>Currency</label>
                                <select onChange={handleOnChange('currency')} className="ad-select" value={currency}>
                                    <option value="Rs">Rs</option>
                                    <option value="$">$</option>
                                </select>
                            </div>
                            <div className="ad-field">
                                <label>Discount (%)</label>
                                <input type="number" onChange={handleOnChange('discount')} className="ad-input" value={discount} min="0" max="100"/>
                            </div>
                            <div className="ad-field">
                                <label>Promotion title</label>
                                <input type="text" onChange={handleOnChange('promotionTitle')} className="ad-input" value={promotionTitle} placeholder="e.g. Weekend Special"/>
                            </div>
                            <div className="ad-field">
                                <label>Promotion starts</label>
                                <input type="datetime-local" onChange={handleOnChange('promotionStart')} className="ad-input" value={promotionStart}/>
                            </div>
                            <div className="ad-field">
                                <label>Promotion ends</label>
                                <input type="datetime-local" onChange={handleOnChange('promotionEnd')} className="ad-input" value={promotionEnd}/>
                                <span className="ad-hint">Leave dates empty to keep a discount active until removed.</span>
                            </div>
                        </div>

                        <p className="ad-form-section-title">Inventory &amp; shipping</p>
                        <div className="ad-form-grid">
                            <div className="ad-field">
                                <label>Quantity</label>
                                <input type="number" onChange={handleOnChange('quantity')} className="ad-input" value={quantity} required/>
                            </div>
                            <div className="ad-field">
                                <label>Shippable</label>
                                <select onChange={handleOnChange('takeInMethod')} className="ad-select" value={takeInMethod}>
                                    <option value="false">No</option>
                                    <option value="true">Yes</option>
                                </select>
                            </div>
                        </div>

                        <div className="ad-form-actions">
                            <button className="ad-btn ad-btn-primary" type="submit" disabled={loader}>
                                {loader ? 'Adding…' : 'Add product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AddProduct;
