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
        showSuccess: false
    });

    const {name, email, password, role, error, showSuccess} = userDetails;

    useEffect(() => {}, []);

    const handleOnChange = (field) => (event) => {
        setUserDetails({...userDetails, [field]: event.target.value});
    };

    const valueChangeHandler = (event) => {
        setUserDetails({...userDetails, role: Number.parseInt(event.target.value)});
    };

    const onSubmit = (event) => {
        event.preventDefault();
        setLoader(true);
        addAdminUser(user._id, token, {name, email, password, role})
            .then(data => {
                if (data.error) {
                    setUserDetails({...userDetails, error: data.error, showSuccess: false});
                    setLoader(false);
                } else {
                    setUserDetails({...userDetails, name: '', email: '', password: '', role: 1, error: false, showSuccess: true});
                    setLoader(false);
                }
            })
    };

    return (
        <AdminLayout
            back
            backText="Back to dashboard"
            to="/admin/dashboard"
            title="Add New User"
            description={`Welcome back ${user.name}, add a new team member now!`}
        >
            <div className="ad-card">
                <div className="ad-card-header">
                    <div>
                        <h2>User details</h2>
                        <p>Grant catalog or full administrator access</p>
                    </div>
                </div>
                <div className="ad-card-body">
                    {error && <div className="ad-alert ad-alert-danger"><strong>{error}</strong></div>}
                    {showSuccess && <div className="ad-alert ad-alert-success"><strong>New user created successfully!</strong></div>}

                    <form onSubmit={onSubmit}>
                        <div className="ad-form-grid">
                            <div className="ad-field">
                                <label>Full name</label>
                                <input type="text" value={name} onChange={handleOnChange('name')} className="ad-input" autoFocus required/>
                            </div>
                            <div className="ad-field">
                                <label>Email address</label>
                                <input type="email" value={email} onChange={handleOnChange('email')} className="ad-input" required/>
                            </div>
                            <div className="ad-field">
                                <label>Temporary password</label>
                                <input type="password" value={password} onChange={handleOnChange('password')} className="ad-input" required/>
                            </div>
                            <div className="ad-field">
                                <label>Role</label>
                                <select onChange={valueChangeHandler} className="ad-select" value={role}>
                                    {roles.map((r, index) => (
                                        <option value={r.roleId} key={index}>{r.roleName}</option>
                                    ))}
                                </select>
                                <span className="ad-hint">Admins have full access. Store Managers can manage products only.</span>
                            </div>
                        </div>
                        <div className="ad-form-actions">
                            <button className="ad-btn ad-btn-primary" disabled={loader}>
                                {loader ? 'Creating…' : 'Create user'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AddAdminUser;
