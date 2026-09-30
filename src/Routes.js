import React from "react";
import {BrowserRouter, Switch, Route} from 'react-router-dom';
import ResetPasswordPage from "./core/ResetPasswordPage";
import Layout from './core/Layout';
import Home from './core/Home';
import ShopPage from './core/Shop';
import Signup from "./user/Signup";
import Menu from './core/Menu';
import Signin from "./user/Signin";
import AboutUs from "./core/AboutUs";
import Product from "./core/Product";
import PrivateRoute from "./auth/PrivateRoute";
import Dashboard from "./user/UserDashboard";
import AdminRoute from "./auth/AdminRoute";
import StoreManagerRote from "./auth/StoreManagerRoute"
import AdminDashboard from "./user/AdminDashboard";
import Cart from "./core/Cart";
import AddCategory from "./admin/AddCategory";
import Profile from "./user/Profile";
import AddProduct from "./admin/AddProduct";
import AddAdminUser from "./admin/AddAdminUser";
import ManageProducts from "./admin/ManageProducts";
import UpdateProduct from "./admin/UpdateProduct";
import Wishlist from "./core/Wishlist";
import Page404 from "./core/Page404";
import CashOnDelivery from "./core/CashOnDelivery";
import ManageCategories from "./admin/ManageCategories";
import UpdateCategory from "./admin/UpdateCategory";
import Orders from "./admin/Orders";
import ManageAdminUser from "./admin/ManageAdminUser";
import ProductByCategory from "./core/ProductByCategory";
import ProductBySearch from "./core/ProductBySearch";
import Offers from "./core/Offers";
import SalesForecast from "./admin/SalesForecast";

const Routes = () => {
    return (
        <BrowserRouter>
            <Menu/>
            <Switch>
                <Route path="/" exact component={Home} />
                <Route path="/shop" exact component={ShopPage} />
                <Route path="/offers" exact component={Offers} />
                <Route path="/layout" exact component={Layout} />
                <Route path="/signup" exact component={Signup} />
                <Route path="/signin" exact component={Signin} />
                <Route path="/aboutUs" exact component={AboutUs} />
                <Route path="/product/:productId" exact component={Product} />
                <Route path="/product/category/:categoryId" exact component={ProductByCategory} />
                <Route path="/product/search/:searchData/:categoryId" exact component={ProductBySearch} />
                <Route path="/reset/password/:tokenId" exact component={ResetPasswordPage} />
                <PrivateRoute path="/user/dashboard" exact component={Dashboard} />
                <StoreManagerRote
                    path="/admin/dashboard" exact component={AdminDashboard} />
                <AdminRoute
                    path="/create/category" exact component={AddCategory} />
                <StoreManagerRote
                    path="/create/product" exact component={AddProduct} />
                <AdminRoute
                    path="/create/user" exact component={AddAdminUser} />
                <Route path="/cart" exact component={Cart} />
                <Route path="/wishlist" exact component={Wishlist} />
                <Route path="/cod" exact component={CashOnDelivery} />
                <PrivateRoute path="/profile/:userId" exact component={Profile} />
                <StoreManagerRote
                    path="/admin/products" exact component={ManageProducts} />
                <StoreManagerRote
                    path="/admin/product/update/:productId" exact component={UpdateProduct} />
                <AdminRoute
                    path="/admin/categories" exact component={ManageCategories} />
                <AdminRoute
                    path="/admin/orders" exact component={Orders} />
                <StoreManagerRote
                    path="/admin/category/update/:categoryId" exact component={UpdateCategory} />
                <AdminRoute
                    path="/manage/user" exact component={ManageAdminUser} />
                <AdminRoute
                    path="/admin/sales-forecast" exact component={SalesForecast} />

                <Route path="" component={Page404} />

            </Switch>
        </BrowserRouter>
    )
};

export default Routes;
