import React, {useEffect, useState, useMemo} from "react";
import AdminLayout from "./AdminLayout";
import {isAuthenticate} from "../auth";
import {Link} from "react-router-dom";
import {confirmAlert} from 'react-confirm-alert';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPen, faTrash, faSearch, faLayerGroup, faPlus} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
import {getAllCategories, deleteSingleCategory} from "./ApiAdmin";
import Pagination from "./Pagination";

const ManageCategories = () => {
    const [categories, setAllCategories] = useState([]);
    const [query, setQuery] = useState('');
    const {user, token} = isAuthenticate();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const fetchCategories = () => {
        getAllCategories().then(data => {
            if (data.error) {
                console.log(data.error)
            } else {
                setAllCategories(data)
            }
        })
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const filteredCategories = useMemo(() => {
        if (!query.trim()) return categories;
        const term = query.trim().toLowerCase();
        return categories.filter(category => category.name.toLowerCase().includes(term));
    }, [categories, query]);

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const getCurrentItem = filteredCategories.slice(indexOfFirst, indexOfLast);

    const remove = categoryId => {
        confirmAlert({
            title: 'Confirm Delete',
            message: 'Are you sure you want to delete this Category?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {
                        deleteSingleCategory(categoryId, user._id, token).then(data => {
                            if (data.error) {
                                console.log(data.error)
                            } else {
                                fetchCategories();
                                confirmAlert({
                                    title: 'Category deleted successfully!',
                                    buttons: [{label: 'OK'}]
                                });
                            }
                        })
                    }
                },
                {label: 'No', onClick: () => {}}
            ]
        });
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <AdminLayout
            back
            backText="Back to dashboard"
            to="/admin/dashboard"
            title="Manage Categories"
            description="Organize your catalog into categories"
            actions={(
                <Link to="/create/category" className="ad-btn ad-btn-primary">
                    <FontAwesomeIcon icon={faPlus}/> Add category
                </Link>
            )}
        >
            <div className="ad-card">
                <div className="ad-toolbar">
                    <div className="ad-search">
                        <FontAwesomeIcon icon={faSearch}/>
                        <input
                            type="text"
                            placeholder="Search categories…"
                            value={query}
                            onChange={e => {
                                setQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                    <div className="ad-toolbar-meta">
                        <strong>{filteredCategories.length}</strong> of {categories.length} categories
                    </div>
                </div>

                {getCurrentItem.length > 0 ? (
                    <div className="ad-table-wrap">
                        <table className="ad-table">
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>Created</th>
                                <th>Last Updated</th>
                                <th></th>
                            </tr>
                            </thead>
                            <tbody>
                            {getCurrentItem.map(category => (
                                <tr key={category._id}>
                                    <td>
                                        <strong>{category.name}</strong>
                                        <div className="ad-row-id">{category._id}</div>
                                    </td>
                                    <td>{moment(category.createdAt).format('MMM D, YYYY')}</td>
                                    <td>{moment(category.updatedAt).format('MMM D, YYYY')}</td>
                                    <td>
                                        <div className="ad-table-actions">
                                            <Link to={`/admin/category/update/${category._id}`} className="ad-btn ad-btn-sm ad-btn-outline" title="Update category">
                                                <FontAwesomeIcon icon={faPen}/>
                                            </Link>
                                            <button onClick={() => remove(category._id)} className="ad-btn ad-btn-sm ad-btn-danger" title="Delete category">
                                                <FontAwesomeIcon icon={faTrash}/>
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
                        <div className="ad-empty-icon"><FontAwesomeIcon icon={faLayerGroup}/></div>
                        <h3>No categories found</h3>
                        <p>Try a different search term, or add your first category.</p>
                    </div>
                )}

                {filteredCategories.length > itemsPerPage && (
                    <Pagination itemsPerPage={itemsPerPage} totalItems={filteredCategories.length} currentPage={currentPage} paginate={paginate}/>
                )}
            </div>
        </AdminLayout>
    );
};

export default ManageCategories;
