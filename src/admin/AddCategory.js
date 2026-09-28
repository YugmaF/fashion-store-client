import React, {useEffect, useState} from "react";
import AdminLayout from "./AdminLayout";
import {isAuthenticate} from "../auth";
import {createCategory} from "./ApiAdmin";
import {getAllCategories} from "../core/apiCore";
import {confirmAlert} from "react-confirm-alert";

const AddCategory = () => {
    const [name, setName] = useState('');
    const [error, setError] = useState(false);
    const [loader, setLoader] = useState(false);
    const [categories, setCategories] = useState([]);
    const [errorCat, setErrorCat] = useState(false);

    const loadCategories = () => {
        getAllCategories().then(data => {
            if (data.error) {
                setErrorCat(data.error);
                console.error(errorCat);
            } else {
                setCategories(data);
            }
        })
    };

    useEffect(() => {
        loadCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    //get user and info from local storage
    const {user, token} = isAuthenticate();

    const handleChange = (event) => {
        let value = event.target.value;
        setError(false);
        setName(value);
    };

    const submit = (event) => {
        event.preventDefault();
        setLoader(true);
        setError(false);
        //create category
        //use api request
        createCategory(user._id, token, {name})
            .then(data => {
                setLoader(false);
                setName('');
                if (data.error) {
                    setError(true);
                    confirmAlert({
                        title: 'Name should be unique',
                        buttons: [
                            {
                                label: 'OK',
                            }
                        ]
                    });
                } else {
                    setError(false);
                    loadCategories();
                    confirmAlert({
                        title: 'New category is created successfully!',
                        buttons: [
                            {
                                label: 'OK',
                            }
                        ]
                    });
                }
            })

    };

    return (
        <AdminLayout backTo="/admin/dashboard" backText="Back to dashboard" title="Add new category" description={`Welcome back ${user.name}, add a new category now!`}>
            <div className="admin-card">
                <div className="admin-card-body">
                    {error && <div className="admin-alert admin-alert-danger"><strong>Name should be unique!</strong></div>}
                    <form className="admin-form" onSubmit={submit}>
                        <div className="admin-form-group">
                            <label className="admin-form-label">Category Name</label>
                            <input type="text" className="form-control" onChange={handleChange} value={name} autoFocus
                                   required/>
                        </div>
                        <button className="admin-btn admin-btn-primary" disabled={loader}>
                            {loader ? 'Loading...' : 'Create Category'}
                        </button>
                    </form>
                </div>
            </div>

            {categories.length > 0 && (
                <div className="admin-card">
                    <div className="admin-table-toolbar">
                        <span className="admin-table-count">Total of {categories.length} categories</span>
                    </div>
                    <div className="admin-table-scroll">
                        <table className="admin-table">
                            <thead>
                            <tr>
                                <th scope="col">ID</th>
                                <th scope="col">Name</th>
                                <th scope="col">Created At</th>
                                <th scope="col">Updated At</th>
                            </tr>
                            </thead>
                            <tbody>
                            {categories.map(category => (
                                <tr key={category._id}>
                                    <th scope="row" className="admin-id">{category._id}</th>
                                    <td><strong>{category.name}</strong></td>
                                    <td>{category.createdAt}</td>
                                    <td>{category.updatedAt}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AddCategory;
