import React, {useEffect, useState} from "react";
import AdminLayout from "./AdminLayout";
import {isAuthenticate} from "../auth";
import {createCategory} from "./ApiAdmin";
import {getAllCategories} from "../core/apiCore";
import {confirmAlert} from "react-confirm-alert";
import moment from "moment";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faLayerGroup} from "@fortawesome/free-solid-svg-icons";

const AddCategory = () => {
    const [name, setName] = useState('');
    const [loader, setLoader] = useState(false);
    const [categories, setCategories] = useState([]);

    const loadCategories = () => {
        getAllCategories().then(data => {
            if (!data.error) {
                setCategories(data);
            }
        })
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const {user, token} = isAuthenticate();

    const handleChange = (event) => {
        setName(event.target.value);
    };

    const submit = (event) => {
        event.preventDefault();
        setLoader(true);
        createCategory(user._id, token, {name})
            .then(data => {
                setLoader(false);
                setName('');
                if (data.error) {
                    confirmAlert({
                        title: 'Name should be unique',
                        buttons: [{label: 'OK'}]
                    });
                } else {
                    loadCategories();
                    confirmAlert({
                        title: 'New category is created successfully!',
                        buttons: [{label: 'OK'}]
                    });
                }
            })
    };

    return (
        <AdminLayout
            back
            backText="Back to dashboard"
            to="/admin/dashboard"
            title="Add New Category"
            description={`Welcome back ${user.name}, add a new category now!`}
        >
            <div className="ad-card" style={{marginBottom: 24}}>
                <div className="ad-card-header">
                    <div>
                        <h2>Category details</h2>
                        <p>Categories help organize your product catalog</p>
                    </div>
                </div>
                <div className="ad-card-body">
                    <form onSubmit={submit}>
                        <div className="ad-form-grid">
                            <div className="ad-field ad-field-full">
                                <label>Category name</label>
                                <input
                                    type="text"
                                    className="ad-input"
                                    onChange={handleChange}
                                    value={name}
                                    autoFocus
                                    required
                                    placeholder="e.g. Accessories"
                                />
                            </div>
                        </div>
                        <div className="ad-form-actions">
                            <button className="ad-btn ad-btn-primary" disabled={loader}>
                                {loader ? 'Creating…' : 'Create category'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="ad-card">
                <div className="ad-card-header">
                    <div>
                        <h2>Existing categories</h2>
                        <p>{categories.length} categor{categories.length === 1 ? 'y' : 'ies'} in your catalog</p>
                    </div>
                </div>
                {categories.length > 0 ? (
                    <div className="ad-table-wrap">
                        <table className="ad-table">
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>Created</th>
                                <th>Last Updated</th>
                            </tr>
                            </thead>
                            <tbody>
                            {categories.map(category => (
                                <tr key={category._id}>
                                    <td>
                                        <strong>{category.name}</strong>
                                        <div className="ad-row-id">{category._id}</div>
                                    </td>
                                    <td>{moment(category.createdAt).format('MMM D, YYYY')}</td>
                                    <td>{moment(category.updatedAt).format('MMM D, YYYY')}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="ad-empty">
                        <div className="ad-empty-icon"><FontAwesomeIcon icon={faLayerGroup}/></div>
                        <h3>No categories yet</h3>
                        <p>Create your first category using the form above.</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AddCategory;
