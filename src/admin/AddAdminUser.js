import React, {useEffect, useState} from "react";
import AdminLayout from "./AdminLayout";
import {isAuthenticate} from "../auth";
import {addAdminUser} from "./ApiAdmin";

const AddAdminUser = () => {
    const {user, token} = isAuthenticate();
    const [loader, setLoader] = useState(false);
    const [roles] = useState([
        {roleName: "Admin", roleId: "1"}, {roleName: "Store Manager", roleId: "2"}
    ]);
    const [userDetails, setUserDetails] = useState({
        name: '',
        email: '',
        password: '',
        role: 1,
        error: false,
        createdUser: false,
        showSuccess: false,
        formData: ''
    });

    const {
        name,
        email,
        password,
        error,
        showSuccess,
        formData
    } = userDetails;

    useEffect(() => {
        setUserDetails({...userDetails, formData: new FormData()})
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleOnChange = (name) => (event) => {
        const value = event.target.value;
        formData.set(name, value);
        setUserDetails({...userDetails, [name]: value});
    };

    const valueChangeHandler = (event) => {
        formData.set("role", Number.parseInt(event.target.value));
        setUserDetails({...userDetails, "role": Number.parseInt(event.target.value)});
    };

    const onSubmit = (event) => {
        event.preventDefault();
        setLoader(true);
        setUserDetails({...userDetails});
        addAdminUser(user._id, token,{name, email, password, role: userDetails.role})
            .then(data => {
                if (data.error) {
                    setUserDetails({...userDetails, error: data.error, showSuccess: false});
                    setLoader(false);

                } else {
                    setUserDetails({...userDetails, name: '', email: '', password: '', role: '1', error: false, showSuccess: true, createUser: data.name});
                    setLoader(false);
                }
            })
    };

    return (
        <AdminLayout backTo="/admin/dashboard" backText="Back to dashboard" title="Add new user" description={`Welcome back ${user.name}, add a new user now!`}>
            <div className="admin-card">
                <div className="admin-card-body">
                    {error && <div className="admin-alert admin-alert-danger"><strong>{error}</strong></div>}
                    {showSuccess && <div className="admin-alert admin-alert-success"><strong>New user is created successfully!</strong></div>}
                    <form className="admin-form">
                        <div className="admin-form-group">
                            <label className="admin-form-label">Name</label>
                            <input type="text" value={name} onChange={handleOnChange('name')} className="form-control" autoFocus required/>
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-form-label">Email</label>
                            <input type="email" value={email} onChange={handleOnChange('email')} className="form-control" required/>
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-form-label">Password</label>
                            <input type="password" value={password} onChange={handleOnChange('password')} className="form-control"
                                   required/>
                        </div>
                        <div className="admin-form-group">
                            <label className="admin-form-label">Role</label>
                            <select onChange={(e) => valueChangeHandler(e)} className="form-control">
                                {roles.map((role, index) => (
                                    <option value={role.roleId} key={index}>{role.roleName}</option>
                                ))}
                            </select>
                        </div>

                        <button className="admin-btn admin-btn-primary" onClick={onSubmit} disabled={loader}>
                            {loader ? 'Loading...' : 'Create User'}
                        </button>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AddAdminUser;
