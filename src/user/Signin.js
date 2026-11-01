import React, {useEffect, useState} from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import {makeStyles} from '@material-ui/core/styles';
import {Redirect} from "react-router-dom";
import {signin, authenticate, isAuthenticate} from "../auth";
import {addItem, getCartProductId, showCart} from "../core/CartHelper";
import {updateUserCart, forgotPassword} from "../core/apiCore";
import {read} from "./apiUser";
import Logo from '../assets/Logos/Logo_Menu-v1.png';
import {confirmAlert} from "react-confirm-alert";

function Copyright() {
    return (
        <Typography variant="body2" color="textSecondary" align="center">
            {'Copyright © '}
            <Link color="inherit" href="https://quarantinefashionstore.herokuapp.com/">
                QuarantineFashionStore.herokuapp.com
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const useStyles = makeStyles((theme) => ({
    root: {
        minHeight: '100vh',
        background: '#f6f6fa',
    },
    image: {
        backgroundImage: 'url(http://la-madleine.de/wp-content/uploads/2019/07/Luxury-Shopping-1520x1024.jpg)',
        backgroundRepeat: 'no-repeat',
        backgroundColor:
            theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
    paper: {
        margin: theme.spacing(8, 4),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: '#e73c7e',
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));

const Signin = () => {
    const classes = useStyles();

    const [values, setValues] = useState({
        email: '',
        password: '',
        error: '',
        loading: false,
        redirect: false
    });

    const [productId, setProductId] = useState({
        product: '',
        errorP: ''
    });

    const [items, setItems] = useState([]); //state for cart items
    const {email, password, loading, error, redirect} = values;
    const {user} = isAuthenticate();


    useEffect(() => {
        //set cart items to state
        setItems(showCart());
    }, []);

    //function to add db items to local storage
    const addToCart = (product) => {
        addItem(product, () => {
            return <Redirect to="/cart"/>;  //redirect to cart
        })
    };

    const handleChange = name => event => {
        setValues({...values, error: false, [name]: event.target.value});
        setProductId({...productId, errorP: false, product: JSON.parse(JSON.stringify(getCartProductId()))});
    };

    //method to set cart items to db
    const setProduct = (product) => {
        const {token, user} = isAuthenticate(); //get logged user details

        //set items in the local storage to database
        updateUserCart(user._id, token, {product}).then(data => {
            if (data.error) {
                console.log(data.error);
            }
        })
    };

    //function to set db products to local storage
    const setDbProductsToCart = () => {
        const {token, user} = isAuthenticate();

        //get cart items from db
        read(user._id, token).then(data => {
            if (data.error) {
            } else {
                //get db items one by one and add to local storage
                for (let i = 0; i < (data.product).length; i++) {
                    addToCart((data.product)[i]);
                }
            }
        });
    };

    const clickSubmit = (event) => {
        event.preventDefault();
        setValues({...values, error: false, loading: true});

        if (email === '' || password === '') {
            setValues({...values, error: 'Fields cannot be empty', loading: false})
        } else {
            signin({email, password})
                .then(data => {
                    if (data.error) {
                        setValues({...values, error: data.error, loading: false})
                    } else {
                        authenticate(data, () => {
                                setValues({...values, redirect: true})
                            }
                        );

                        //get cart items one by one and add to db
                        if (items.length > 0) {
                            for (let i = 0; i < items.length; i++) {
                                setProduct(items[i]);
                            }
                        }

                        setDbProductsToCart();  //set db items to cart
                    }
                })
        }
    };

    const showError = () => (
        <div className="alert alert-danger text-center" style={{display: error ? '' : 'none'}}>
            {error}
        </div>
    );

    const handleForgotPassword = () => {
        if(email === ''){
            confirmAlert({
                title: 'Please add an email!',
                buttons: [
                    {
                        label: 'OK',
                    }
                ]
            });
        }else{
            const emailObj = {
                email: email
            }

            forgotPassword(emailObj)
                .then(response => {
                    if(response.error){
                        console.log(error);
                        if(!error){
                            confirmAlert({
                                title: 'User not found!',
                                buttons: [
                                    {
                                        label: 'OK',
                                    }
                                ]
                            });
                        }
                    }else{
                        console.log(response);
                        confirmAlert({
                            title: response.message,
                            buttons: [
                                {
                                    label: 'OK',
                                }
                            ]
                        });
                    }
                });
        }
    }

    const redirectUser = () => {
        if (redirect) {
            if (user && (user.role === "1" || user.role === "2")) {
                return <Redirect to="/admin/dashboard"/>
            } else {
                return <Redirect to="/user/dashboard"/>
            }
        }

        if (isAuthenticate()) {
            return <Redirect to="/"/>
        }
    };

    return (
        <Grid container component="main" className={classes.root}>
            <CssBaseline/>
            <Grid item xs={false} sm={4} md={7} className={classes.image}/>
            <Grid className="p-5" item xs={12} sm={8} md={5} className="st-auth-panel" component={Paper} elevation={6} square>
                <div className={classes.paper}>
                    <Avatar className={classes.avatar}>
                        <LockOutlinedIcon/>
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign in
                    </Typography>

                    <form className={classes.form} noValidate>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            onChange={handleChange('email')}
                            autoFocus
                        />
                        <TextField
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            onChange={handleChange('password')}
                            autoComplete="current-password"
                        />
                        {showError()}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                            onClick={clickSubmit}
                        >
                            Sign In
                        </Button>
                        <Grid container>
                            <Grid item xs>
                                <Link onClick={handleForgotPassword} href="#" variant="body2">
                                    Forgot password?
                                </Link>
                            </Grid>
                            <Grid item>
                                <Link href="/signup" variant="body2">
                                    {"Don't have an account? Sign Up"}
                                </Link>
                            </Grid>
                        </Grid>
                        <Box mt={5}>
                            <Copyright/>
                        </Box>
                    </form>
                    <img className="mt-5" src={Logo}/>
                </div>
            </Grid>
            {redirectUser()}
        </Grid>
    );
}

export default Signin;
