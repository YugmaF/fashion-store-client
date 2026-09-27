import React, {useState} from "react";
import {signup} from "../auth";
import Recaptcha from 'react-recaptcha';
import Grid from "@material-ui/core/Grid";
import CssBaseline from "@material-ui/core/CssBaseline";
import Paper from "@material-ui/core/Paper";
import Avatar from "@material-ui/core/Avatar";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Link from "@material-ui/core/Link";
import Box from "@material-ui/core/Box";
import Logo from "../assets/Logos/Logo_Menu-v1.png";
import {makeStyles} from "@material-ui/core/styles";

function Copyright() {
    return (
        <Typography variant="body2" color="textSecondary" align="center">
            {'Copyright © '}
            <Link color="inherit" href="https://fashion-store-5827.onrender.com/">
                Fashion Store
            </Link>{' '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100vh',
    },
    image: {
        backgroundImage: 'url(https://image.freepik.com/free-photo/elegant-woman-costume-hat-with-handbag-room_23-2148068414.jpg)',
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
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));

const Signup = () => {

    const classes = useStyles();

    const [values, setValues] = useState({
        name: '',
        email: '',
        password: '',
        error: '',
        success: false
    });

    const [recaptchaVerified, setRecaptchaVerified] = useState(false);
    const [recaptchaKey, setRecaptchaKey] = useState(0);
    const recaptchaSiteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY
        || '6LcZZPUUAAAAAIlxCF98ooQ_SCWA5yOvXwjd1q8S';

    const {name, email, password, success, error} = values;

    const handleChange = name => event => {
        setValues({...values, error: false, [name]: event.target.value});
    };

    const clickSubmit = (event) => {
        event.preventDefault();
        setValues({...values, error: false});
        if (recaptchaVerified) {
            signup({name, email, password})
                .then(data => {
                    if (data.error) {
                        setValues({...values, error: data.error, success: false});
                    } else {
                        setRecaptchaKey(currentKey => currentKey + 1);
                        setRecaptchaVerified(false);
                        setValues({...values, name: '', email: '', password: '', error: '', success: true});
                    }
                });
        } else {
            setValues({...values, error: "Please verify ReCaptcha!", success: false})
        }

    };

    const showError = () => (
        <div className="alert alert-danger text-center" style={{display: error ? '' : 'none'}}>
            {error}
        </div>
    );

    const showSuccess = () => (
        <div className="alert alert-info" style={{display: success ? '' : 'none'}}>
            New User Added Successfully <a href="/signin">Login</a>
        </div>
    );

    const signUpForm = () => (
        <Grid container component="main" className={classes.root}>
            <CssBaseline/>
            <Grid item xs={false} sm={4} md={7} className={classes.image}/>
            <Grid className="p-5" item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
                <div className={classes.paper}>
                    <Avatar className={classes.avatar}>
                        <LockOutlinedIcon/>
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Sign Up
                    </Typography>

                    <form className={classes.form} noValidate>
                        <TextField
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            id="name"
                            label="Name"
                            name="name"
                            autoComplete="name"
                            onChange={handleChange('name')}
                            autoFocus
                        />
                        <TextField
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            onChange={handleChange('email')}
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
                        <Recaptcha
                            key={recaptchaKey}
                            sitekey={recaptchaSiteKey}
                            render="explicit"
                            verifyCallback={verifyCallback}
                        />

                        <br/>
                        {showSuccess()}
                        {showError()}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                            onClick={clickSubmit}
                        >
                            Register
                        </Button>
                        <Box mt={5}>
                            <Copyright/>
                        </Box>
                    </form>
                    <img className="mt-3" src={Logo} alt="Fashion Store"/>
                </div>
            </Grid>
        </Grid>
        // </div>


    );
    const verifyCallback = (response) => {
        if (response) {
            setRecaptchaVerified(true);
        }
    };

    return (
        <div>
            {signUpForm()}
        </div>
    )
};

export default Signup;
