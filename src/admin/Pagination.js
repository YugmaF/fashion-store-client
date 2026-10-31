import React from "react";

const Pagination = ({totalItems, itemsPerPage, paginate, currentPage}) => {
    const pageNumbers = [];

    for (let pageNumber = 1; pageNumber <= Math.ceil(totalItems / itemsPerPage); pageNumber++) {
        pageNumbers.push(pageNumber)
    }

    return (
        <nav className="ad-pagination">
            {pageNumbers.map(pageNumber => (
                <button
                    key={pageNumber}
                    className={currentPage === pageNumber ? 'active' : ''}
                    onClick={() => paginate(pageNumber)}
                    type="button"
                >
                    {pageNumber}
                </button>
            ))}
        </nav>
    );
};

export default Pagination;
