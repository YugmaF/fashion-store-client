import React, {useEffect, useState} from "react";
import AdminLayout from "./AdminLayout";
import {isAuthenticate} from "../auth";
import {getAllCategories} from "../core/apiCore";
import {getSingleCategory, updateSingleCategory} from "./ApiAdmin";
import {confirmAlert} from "react-confirm-alert";

const UpdateCategory = ({match}) => {
    const [name, setName] = useState('');
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);
    const [loader, setLoader] = useState(false);
    const [categories, setCategories] = useState([]);
    const [errorCat, setErrorCat] = useState(false);

    const init = (categoryId) => {
        getSingleCategory(categoryId).then(data => {
            if(data.error){
                setErrorCat(data.error);
                console.error(errorCat);
            } else {
                setName(data.name);
            }
        })
    };
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
        init(match.params.categoryId);
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
        setSuccess(false);
        //create category
        //use api request
        updateSingleCategory(match.params.categoryId, user._id, token, {name})
            .then(data => {
                setLoader(false);
                setName('');
                if (data.error) {
                    setError(true);
                    setSuccess(false);
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
                    setSuccess(true);
                    loadCategories();
                    confirmAlert({
                        title: 'Category updated successfully!',
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
        <AdminLayout backTo="/admin/categories" backText="Back to manage categories" title="Update category" description={`Welcome back ${user.name}, update category now`}>
            <div className="admin-card">
                <div className="admin-card-body">
                    {success && <div className="admin-alert admin-alert-success"><strong>Category is updated successfully!</strong></div>}
                    {error && <div className="admin-alert admin-alert-danger"><strong>Name</strong> should be unique!</div>}
                    <form className="admin-form" onSubmit={submit}>
                        <div className="admin-form-group">
                            <label className="admin-form-label">Category Name</label>
                            <input type="text" className="form-control" onChange={handleChange} value={name} autoFocus
                                   required/>
                        </div>
                        <button className="admin-btn admin-btn-primary" disabled={loader}>
                            {loader ? 'Loading...' : 'Update Category'}
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

export default UpdateCategory;
