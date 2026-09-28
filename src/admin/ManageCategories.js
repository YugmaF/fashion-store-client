import React, {useEffect, useState} from "react";
import AdminLayout from "./AdminLayout";
import {isAuthenticate} from "../auth";
import {Link} from "react-router-dom";
import { confirmAlert } from 'react-confirm-alert';
import {getAllCategories, deleteSingleCategory} from "./ApiAdmin";
import Pagination from "./Pagination";

const ManageCategories = () => {

    const [categories, setAllCategories] = useState([]);
    const {user, token} = isAuthenticate();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    //get Current item
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const getCurrentItem = categories.slice(indexOfFirst, indexOfLast);

    const  fetchCategories = () => {
        getAllCategories().then (data => {
            if(data.error){
                console.log(data.error)
            }
            else
                setAllCategories(data)
        })
    };

    const remove = categoryId =>
    {
        confirmAlert({
            title: 'Confirm Delete',
            message: 'Are you sure you want to delete this Category?',
            buttons: [
                {
                    label: 'Yes',
                    onClick: () => {
                        deleteSingleCategory(categoryId, user._id, token).then(data => {
                            if(data.error){
                                console.log(data.error)
                            } else {
                                fetchCategories();
                                confirmAlert({
                                    title: 'Category deleted successfully!',
                                    buttons: [
                                        {
                                            label: 'OK',
                                        }
                                    ]
                                });
                            }
                        })
                    }
                },
                {
                    label: 'No',
                    onClick: () => {}
                }
            ]
        });
    };
    useEffect(() => {
        fetchCategories();
    }, []);

    const paginate = (pageNumber) => {
        setCurrentPage(pageNumber);
    }

    return (
        <AdminLayout backTo="/admin/dashboard" backText="Back to dashboard" title="Manage Categories" description="Update and delete categories">
            <div className="admin-card">
                <div className="admin-table-toolbar">
                    <span className="admin-table-count">Total of {categories.length} categories</span>
                </div>
                <div className="admin-table-scroll">
                    <table id="categoryTable" className="admin-table">
                        <thead>
                        <tr>
                            <th scope="col">Category Id</th>
                            <th scope="col">Category Name</th>
                            <th scope="col">Date Created</th>
                            <th scope="col">Date Last Updated</th>
                            <th scope="col">Update</th>
                            <th scope="col">Delete</th>
                        </tr>
                        </thead>
                        <tbody>
                        {getCurrentItem.map((category) => (
                            <tr key={category._id}>
                                <th scope="row" className="admin-id">{category._id}</th>
                                <td><strong>{category.name}</strong></td>
                                <td>{category.createdAt}</td>
                                <td>{category.updatedAt}</td>
                                <td>
                                    <Link to={`/admin/category/update/${category._id}`}>
                                        <button className="admin-btn admin-btn-warning admin-btn-sm">
                                            Update
                                        </button>
                                    </Link>
                                </td>
                                <td>
                                    <button onClick={() => remove(category._id)} className="admin-btn admin-btn-danger admin-btn-sm">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    <Pagination itemsPerPage={itemsPerPage} totalItems={categories.length} currentPage={currentPage} paginate={paginate}/>
                </div>
            </div>
        </AdminLayout>
    );

};


export default ManageCategories;
