import React, {useState, useEffect} from "react";
import Layout from "./Layout";
import Ftr from "./Ftr";
import CircularProgress from "@material-ui/core/CircularProgress";
import {getAllCategories, getProductByFilters} from "./apiCore";
import FilterCheckbox from "./FilterCheckbox";
import ShopListCard from "./ShopListCard";
import NavBar from "./NavBar";

const ShopPage = () => {

    const [pageFilters, setPageFilters] = useState({
        filters: {category : [], price : []}
    });

    const [limitTo, setLimitTo] = useState(6);
    const [skip, setSkip] = useState(0);
    const [loadedSize, setLoadedSize] = useState(0);

    const [filteredProducts, setFilteredProducts] = useState([]);
    const [errorProducts, setErrorProducts] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(false);
    const [showViewProducts, setShowViewProducts] = useState(false);

    const [categories, setCategories] = useState([]);
    const [errorCategories, setErrorCategories] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [showViewCategories, setShowViewCategories] = useState(false);

    const loadFilteredProducts = (filters) => {
        getProductByFilters(skip, limitTo, filters).then(data => {
            setLoadingProducts(false);
            if (data.error) {
                setErrorProducts(data.error);
            } else {
                setFilteredProducts(data.data);
                setShowViewProducts(true);
                setLoadedSize(data.size);
                setSkip(0);
            }
        });
    };

    const loadMore = () => {
      let toSkip = skip + limitTo;
        getProductByFilters(toSkip, limitTo, pageFilters.filters).then(data => {
            setLoadingProducts(false);
            if (data.error) {
                setErrorProducts(data.error);
            } else {
                setFilteredProducts([...filteredProducts, ...data.data]);
                setShowViewProducts(true);
                setLoadedSize(data.size);
                setSkip(toSkip);
            }
        });
    };

    const loadMoreButton = () => {
        return (
            loadedSize > 0 && loadedSize >= limitTo && (
                <button onClick={loadMore} className="btn st-btn-primary mb-5">Load More</button>
            )
        );
    };

    const loadCategories = () => {
        getAllCategories().then(data => {
            setLoadingCategories(false);
            if (data.error) {
                setErrorCategories(data.error);
            } else {
                setCategories(data);
                setShowViewCategories(true);
            }
        })
    };

    useEffect(() => {
        setLoadingCategories(true);
        setLoadingProducts(true);
        loadFilteredProducts([]);
        loadCategories();
    }, []);

    const handleFilters = (filters, filterBy) => {
        const allFilters = {...pageFilters};
        allFilters.filters[filterBy] = filters;
        loadFilteredProducts(pageFilters.filters);
        setPageFilters(allFilters);
    };

    const appendView = () => {
        return (
            <div className="mt-2">
                <div className="row">
                    <div
                        className="col-sm-12 col-md-12 col-lg-2 col-xl-2 mb-5">

                        {
                            showViewCategories ?
                                <div className="st-card">
                                    <div className="st-section-title" style={{fontSize: "1rem"}}>Filter by category</div>
                                    <ul className="list-unstyled">
                                        <FilterCheckbox categories={categories} handleFilters={filters => handleFilters(filters, 'category')}/>
                                    </ul>
                                </div>
                                : ''
                        }
                    </div>

                    <div className="col-lg-10 col-xl-10">
                        {
                            showViewProducts ?
                                <div>
                                    <div className="row" style={{rowGap: "26px"}}>
                                        {
                                            filteredProducts.map((product, i) => (
                                                <div key={i} className="col-xl-3 col-lg-4 col-md-6 mb-4">
                                                    <ShopListCard product={product}/>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div> :
                                <div className="st-loader">
                                    <CircularProgress size={80}/>
                                </div>
                        }
                        {loadMoreButton()}
                    </div>
                </div>

                {showViewProducts && showViewCategories ? <Ftr/> : ''}
            </div>
        );
    };

    return (
        <div>
            <NavBar/>
            <div className="container">
                <div className="st-page-hero">
                    <div>
                        <h1>The Collection</h1>
                        <p>Browse our full range of fashion essentials, filters on the left.</p>
                    </div>
                </div>
            </div>
            {appendView()}
        </div>
    );
}

export default ShopPage;
