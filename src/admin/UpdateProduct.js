import React, {useEffect, useState} from "react";
import AdminLayout from "./AdminLayout";
import {isAuthenticate} from "../auth";
import {getSingleProduct, updateSingleProduct} from "./ApiAdmin";
import AutoCompleteCategories from "../autocomplete/AutoCompleteCategories";
import {confirmAlert} from "react-confirm-alert";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCloudUploadAlt} from "@fortawesome/free-solid-svg-icons";
import {API} from "../config";

const formatDateTimeLocal = value => {
    if (!value) {
        return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 16);
};

const UpdateProduct = ({match}) => {
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

    const init = (productId) => {
        getSingleProduct(productId).then(data => {
            if (data.error) {
                setProductValues({...productValues, error: data.error, showSuccess: false});
            } else {
                setProductValues({
                    ...productValues,
                    name: data.name,
                    image: data.image,
                    description: data.description,
                    price: data.price,
                    category: data.category._id,
                    quantity: data.quantity,
                    discount: data.discount,
                    promotionTitle: data.promotionTitle || '',
                    promotionStart: formatDateTimeLocal(data.promotionStart),
                    promotionEnd: formatDateTimeLocal(data.promotionEnd),
                    currency: data.currency,
                    takeInMethod: data.takeInMethod,
                    error: false,
                    formData: new FormData()
                });
            }
        })
    };

    useEffect(() => {
        setProductValues({...productValues, formData: new FormData()});
        init(match.params.productId);
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

        updateSingleProduct(match.params.productId, user._id, token, formData)
            .then(data => {
                if (data.error) {
                    setProductValues({...productValues, error: data.error, showSuccess: false});
                    setLoader(false);
                } else {
                    setLoader(false);
                    setProductValues({...productValues, error: false, showSuccess: true});
                    confirmAlert({title: 'Product updated successfully!', buttons: [{label: 'OK'}]});
                }
            })
    };

    return (
        <AdminLayout
            back
            backText="Back to Manage Products"
            to="/admin/products"
            title="Update Product"
            description={`Welcome back ${user.name}, update this product now!`}
        >
            <div className="ad-card">
                <div className="ad-card-header">
                    <div>
                        <h2>Product details</h2>
                        <p>Update information for this catalog item</p>
                    </div>
                </div>
                <div className="ad-card-body">
                    {error && <div className="ad-alert ad-alert-danger"><strong>{error}</strong></div>}
                    {showSuccess && <div className="ad-alert ad-alert-success"><strong>Product updated successfully!</strong></div>}

                    <form onSubmit={submit}>
                        <p className="ad-form-section-title">Media</p>
                        <div style={{display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap'}}>
                            {typeof productValues.image === 'string' && productValues.image && (
                                <img
                                    src={`${API}/product/image/${match.params.productId}`}
                                    alt={name}
                                    className="ad-table-thumb"
                                    style={{width: 64, height: 64}}
                                />
                            )}
                            <label className="ad-file-drop" style={{flex: 1, minWidth: 220}}>
                                <input type="file" onChange={handleOnChange('image')} name="image" accept="image/*"/>
                                <div className="ad-file-drop-icon"><FontAwesomeIcon icon={faCloudUploadAlt}/></div>
                                <div className="ad-file-drop-text">
                                    <strong>{imageName || 'Replace product photo'}</strong>
                                    <span>PNG or JPG, ideally square</span>
                                </div>
                            </label>
                        </div>

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
                                {loader ? 'Updating…' : 'Update product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
};

export default UpdateProduct;
