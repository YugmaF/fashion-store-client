import React, {useEffect, useState, useMemo} from "react";
import AdminLayout from "./AdminLayout";
import {isAuthenticate} from "../auth";
import {updateUserState, getAllUsers, resetPassword} from "./ApiAdmin";
import {confirmAlert} from "react-confirm-alert";
import {Link} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faKey, faSearch, faUsers, faPlus, faToggleOn, faToggleOff} from "@fortawesome/free-solid-svg-icons";
import Pagination from "./Pagination";

const initials = name => (name || "?")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join("");

const ManageAdminUser = () => {
    const [users, setAllUsers] = useState([]);
    const [query, setQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const {user, token} = isAuthenticate();

    const fetchUsers = () => {
        getAllUsers().then(data => {
            if (data.error) {
                console.log(data.error)
            } else {
                setAllUsers(data)
            }
        })
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = useMemo(() => {
        if (!query.trim()) return users;
        const term = query.trim().toLowerCase();
        return users.filter(u => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
    }, [users, query]);

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const getCurrentItem = filteredUsers.slice(indexOfFirst, indexOfLast);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const onClickResetPassword = userId => {
        resetPassword(userId, token, user._id).then(data => {
            if (data.error) {
                console.log("error");
            } else {
                confirmAlert({
                    title: 'Password has reset. Email sent successfully!',
                    buttons: [{label: 'OK'}]
                });
            }
        })
    };

    const changeState = data => {
        updateUserState(user._id, data, token).then(data => {
            if (data.error) {
                console.log(data.error)
            } else {
                fetchUsers()
            }
        })
    };

    const roleLabel = role => Number.parseInt(role, 10) === 1 ? 'Administrator' : 'Store Manager';

    return (
        <AdminLayout
            back
            backText="Back to dashboard"
            to="/admin/dashboard"
            title="Manage Users"
            description="Review access and manage your admin team"
            actions={(
                <Link to="/create/user" className="ad-btn ad-btn-primary">
                    <FontAwesomeIcon icon={faPlus}/> Add user
                </Link>
            )}
        >
            <div className="ad-card">
                <div className="ad-toolbar">
                    <div className="ad-search">
                        <FontAwesomeIcon icon={faSearch}/>
                        <input
                            type="text"
                            placeholder="Search by name or email…"
                            value={query}
                            onChange={e => {
                                setQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                    <div className="ad-toolbar-meta">
                        <strong>{filteredUsers.length}</strong> of {users.length} users
                    </div>
                </div>

                {getCurrentItem.length > 0 ? (
                    <div className="ad-table-wrap">
                        <table className="ad-table">
                            <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {getCurrentItem.map(u => (
                                <tr key={u._id}>
                                    <td>
                                        <div className="ad-table-media">
                                            <div className="ad-sidebar-avatar" style={{background: 'var(--ad-gradient-brand)', color: '#fff'}}>
                                                {initials(u.name)}
                                            </div>
                                            <div>
                                                <strong>{u.name}</strong>
                                                <div style={{fontSize: '0.78rem', color: 'var(--ad-text-muted)'}}>{u.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="ad-pill ad-pill-purple">{roleLabel(u.role)}</span></td>
                                    <td>
                                        {u.state === '1'
                                            ? <span className="ad-pill ad-pill-success">Active</span>
                                            : <span className="ad-pill ad-pill-warning">Inactive</span>}
                                    </td>
                                    <td>
                                        <div className="ad-table-actions">
                                            {u.state !== '1' ? (
                                                <button onClick={() => changeState({_id: u._id, state: '1'})} className="ad-btn ad-btn-sm ad-btn-success" title="Set active">
                                                    <FontAwesomeIcon icon={faToggleOn}/> Activate
                                                </button>
                                            ) : (
                                                <button onClick={() => changeState({_id: u._id, state: '0'})} className="ad-btn ad-btn-sm ad-btn-danger" title="Set inactive">
                                                    <FontAwesomeIcon icon={faToggleOff}/> Deactivate
                                                </button>
                                            )}
                                            <button onClick={() => onClickResetPassword(u._id)} className="ad-btn ad-btn-sm ad-btn-outline" title="Reset password">
                                                <FontAwesomeIcon icon={faKey}/> Reset
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="ad-empty">
                        <div className="ad-empty-icon"><FontAwesomeIcon icon={faUsers}/></div>
                        <h3>No users found</h3>
                        <p>Try a different search term, or invite a new team member.</p>
                    </div>
                )}

                {filteredUsers.length > itemsPerPage && (
                    <Pagination itemsPerPage={itemsPerPage} totalItems={filteredUsers.length} currentPage={currentPage} paginate={paginate}/>
                )}
            </div>
        </AdminLayout>
    );
};

export default ManageAdminUser;
