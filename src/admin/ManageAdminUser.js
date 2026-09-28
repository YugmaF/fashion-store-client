import React, {useEffect, useState} from "react";
import AdminLayout from "./AdminLayout";
import {isAuthenticate} from "../auth";
import {updateUserState, getAllUsers, resetPassword} from "./ApiAdmin";
import {confirmAlert} from "react-confirm-alert";
import Pagination from "./Pagination";

const ManageAdminUser = () => {
    const [users, setAllUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    //get Current item
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const getCurrentItem = users.slice(indexOfFirst, indexOfLast);

    const {user, token} = isAuthenticate();

    const fetchUsers = () => {
        getAllUsers().then(data => {
            if (data.error) {
                console.log(data.error)
            } else
                setAllUsers(data)
        })
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    }

    const onClickResetPassword = userId => {
        resetPassword(userId, token, user._id)
            .then(data => {
                if (data.error) {
                    console.log("error");
                } else {
                    confirmAlert({
                        title: 'Password has reset. Email sent successfully!',
                        buttons: [
                            {
                                label: 'OK',
                            }
                        ]
                    });
                }
            })
    };

    const changeState = data => {
        updateUserState(user._id, data, token). then(data => {
            if(data.error){
                console.log(data.error)
            } else {
                fetchUsers()
            }
        })
    };

    return (
        <AdminLayout backTo="/admin/dashboard" backText="Back to dashboard" title="Manage Users" description={`Welcome back ${user.name}, manage users now!`}>
            <div className="admin-card">
                <div className="admin-table-toolbar">
                    <span className="admin-table-count">Total of {users.length} users</span>
                </div>
                <div className="admin-table-scroll">
                    <table className="admin-table">
                        <thead>
                        <tr>
                            <th scope="col">User Id</th>
                            <th scope="col">User Name</th>
                            <th scope="col">Email</th>
                            <th scope="col">Status</th>
                            <th scope="col">Change</th>
                            <th scope="col">Password</th>
                        </tr>
                        </thead>
                        <tbody>
                        {getCurrentItem.map((u) => (
                            <tr key={u._id}>
                                <th scope="row" className="admin-id">{u._id}</th>
                                <td><strong>{u.name}</strong></td>
                                <td>{u.email}</td>
                                <td>
                                    {u.state === '1'
                                        ? <span className="admin-badge admin-badge-success">Active</span>
                                        : <span className="admin-badge admin-badge-warning">Inactive</span>}
                                </td>
                                <td>
                                    {u.state !== '1' ?
                                        <button onClick={() => {changeState({_id: u._id, state: '1'})}} className="admin-btn admin-btn-success admin-btn-sm">
                                            Set Active
                                        </button> :
                                        <button onClick={() => {changeState({_id: u._id, state: '0'})}} className="admin-btn admin-btn-danger admin-btn-sm">
                                            Set Inactive
                                        </button>}
                                </td>
                                <td>
                                    <button onClick={() => {onClickResetPassword(u._id)}} className="admin-btn admin-btn-dark admin-btn-sm">
                                        Reset Password
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    <Pagination itemsPerPage={itemsPerPage} totalItems={users.length} currentPage={currentPage} paginate={paginate}/>
                </div>
            </div>
        </AdminLayout>
    );
};

export default ManageAdminUser;
