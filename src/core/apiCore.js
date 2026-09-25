import {API} from "../config";
import queryString from 'query-string';

export const getProducts = (sortBy) => {
    return fetch(`${API}/products`, {
        method: "GET",
    })
        .then(response => response.json())
        .catch(err => console.log(err))
};

export const getPromotionalOffers = (limitTo = 12) => {
    return fetch(`${API}/products/offers?limitTo=${limitTo}`, {
        method: "GET",
    })
        .then(response => response.json())
        .catch(err => console.log(err))
};

export const getProductsByCategory = (categoryId) => {
    return fetch(`${API}/product/category/${categoryId}`, {
        method: "GET",
    })
        .then(response => response.json())
        .catch(err => console.log(err))
};

export const getImage = (productId) => {
    return fetch(`${API}/product/image/${productId}`, {
        method: "GET",
    })
        .then(response => response)
        .catch(err => console.log(err))
};

//function to get product details from db
export const getProduct = (productId) => {
    return fetch(`${API}/product/${productId}`, {
        method: "GET",
    })
        .then(response => response.json())
        .catch(err => console.log(err))
};

export const getAllCategories = () => {
    return fetch(`${API}/categories`, {
        method: "GET",
    })
        .then(response => response.json())
        .catch(err => console.log(err))
};

export const getAddress = (userId, token) => {
    return fetch(`${API}/address/${userId}`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    })
        .then(response => response.json())
        .catch(err => console.log(err))
};

export const updateAddress = (userId, token, address) => {
    return fetch(`${API}/user/${userId}`, {
        method: "PUT",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(address)
    })
        .then(response => response.json())
        .catch(err => console.log(err))
};

//method to add cart items to db
export const updateUserCart = (userId, token, products) => {
    return fetch(`${API}/user/${userId}`, {
        method: "PUT",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(products)
    })
        .then(response => response.json())
        .catch(err => console.log(err))
};

export const addRating = (userId, token, productId, rating) => {
    return fetch(`${API}/product/addRating/${productId}/${userId}`, {
        method: "PUT",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({"rating" : rating})
    })
        .then(response => response.json())
        .catch(err => console.log(err))
};

export const addComment = (userId, token, productId, comments) => {
    return fetch(`${API}/product/addComment/${productId}/${userId}`, {
        method: "PUT",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(comments)
    })
        .then(response => response.json())
        .catch(err => console.log(err))
};

//method to remove item from db
export const removeCartItem = (userId, token, products) => {
    return fetch(`${API}/cart/remove/${userId}`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(products)
    })
        .then(response => response.json())
        .catch(err => console.log(err))
};

export const updateUserWishlist = (userId, token, products) => {
    return fetch(`${API}/wishlist/${userId}`, {
        method: "PUT",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(products)
    })
        .then(response => response.json())
        .catch(err => console.log(err))
};

export const removeWishlistItem = (userId, token, products) => {
    return fetch(`${API}/wishlist/remove/${userId}`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(products)
    })
        .then(response => response.json())
        .catch(err => console.log(err))
};

export const getProductByFilters = (skip, limitTo, filters = {}) => {
    const data = {
        limitTo,
        skip,
        filters
    };
    return fetch(`${API}/products/by/search`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .catch(err => console.log(err))
};

export const getBraintreeClientToken = (userId, token) => {
    return fetch(`${API}/braintree/getToken/${userId}`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
    })
        .then(response => {
            return response.json();
        })
        .catch(err => console.log(err));
};

export const processPayment = (userId, token, paymentData) => {
    return fetch(`${API}/braintree/payment/${userId}`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(paymentData)
    })
        .then(response => {
            return response.json();
        })
        .catch(err => console.log(err));
};

export const getRelatedProducts = (productId) => {
    return fetch(`${API}/products/similar/${productId}`, {
        method: "GET",
    })
        .then(response => response.json())
        .catch(err => console.log(err))
};

export const createOrder = (userId, token, createOrderData) => {
    return fetch(`${API}/order/create/${userId}`, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({order: createOrderData})
    })
        .then(response => {
            return response.json();
        })
        .catch(err => console.log(err));
};

//Get Single Category
export const getSingleCategory = (categoryId) => {
    return fetch(`${API}/category/${categoryId}`, {
        method: 'GET'
    })
        .then(response => response.json())
        .catch(err => console.log(err))
};

export const search = params => {
    const query = queryString.stringify(params);
    return fetch(`${API}/products/search?${query}`, {
        method: "GET"
    })
        .then(response => {
            return response.json();
        })
        .catch(err => {
            console.log(err);
        });
}

export const forgotPassword = (email) => {
    return fetch(`${API}/forgotPassword`, {
        method: "PUT",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(email)
    })
        .then(response => response.json())
        .catch(err => console.log(err))
}

export const resetPasswordByLink = (obj) => {
    return fetch(`${API}/resetPasswordByLink`, {
        method: "PUT",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(obj)
    })
        .then(response => response.json())
        .catch(err => console.log(err))
}
