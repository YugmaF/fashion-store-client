import React, {useEffect, useState} from 'react';
import {getProducts, getBraintreeClientToken, processPayment, removeCartItem, createOrder} from './apiCore';
import {emptyCart, showSelectedCart} from './CartHelper';
import {Link} from 'react-router-dom';
import {isAuthenticate} from '../auth';
import DropIn from 'braintree-web-drop-in-react';
import CashOnDelivery from "./CashOnDelivery";
import {getDiscountedPrice, isPromotionActive} from "./pricing";

const Checkout = ({products}) => {
    const [data, setData] = useState({
        loading: false,
        success: false,
        clientToken: null,
        error: '',
        instance: {},
        address: ''
    });

    const userId = isAuthenticate() && isAuthenticate().user._id;
    const token = isAuthenticate() && isAuthenticate().token;

    const getToken = (userId, token) => {
        getBraintreeClientToken(userId, token).then(data => {
            if(data.error) {
                setData({...data, error: data.error});
            } else {
                setData({clientToken: data.clientToken});
            }
        });
    };

    useEffect(() => {
        getToken(userId, token);
    }, []);

    const handleAddress = event => {
        setData({...data, address: event.target.value});
    }

    //function to get total of checked items
    const getTotal = () => {
        return products.reduce((currentValue, nextValue) => {
            //current value gets as 0 and add values to current value from next value by looping through array
            return (nextValue.isChecked ? (parseFloat(currentValue) + parseFloat(nextValue.count) * parseFloat(nextValue.price)).toFixed(2) : (parseFloat(currentValue)).toFixed(2));
        }, 0);
    };

    //function to get discount of checked items
    const getDiscount = () => {
        return products.reduce((currentValue, nextValue) => {
            //current value gets as 0 and add values to current value from next value by looping through array
            const discount = isPromotionActive(nextValue)
                ? parseFloat(nextValue.price) - getDiscountedPrice(nextValue)
                : 0;
            return (nextValue.isChecked ? (parseFloat(currentValue) + parseFloat(nextValue.count) * discount).toFixed(2) : (parseFloat(currentValue)).toFixed(2));
        }, 0);
    };

    //function to get discount of checked items
    const getDiscountedTotal = () => {
        return (getTotal() - getDiscount()).toFixed(2);
    };

    const showCheckout = () => {
        return isAuthenticate() ? (
            <div>
                <div>
                  {showDropIn()}
                </div>
            </div>
        ) : (
            <Link to="/signin">
                <button className="btn btn-primary col-sm-12">Sign in to Checkout</button>
            </Link>
        );
    };

    let deliveryAddress = data.address;

    const buy = () => {
        setData({loading: true});
        // send the nonce to your server
        // nonce = data.instance.requestPaymentMethod
        let nonce;
        let getNonce = data.instance.requestPaymentMethod()
            .then(data => {
                // console.log(data)
                nonce = data.nonce;
                // once you have nonce (card type, card number) send nonce as 'paymentMethod'
                // and also total to be charged
                // console.log('send nonce and total to process: ', nonce, getTotal(products))
                const paymentData = {
                    paymentMethodNonce: nonce,
                    amount: getDiscountedTotal()
                };

                processPayment(userId, token, paymentData)
                    .then(response => {
                        console.log(response)

                        // create order
                        const createOrderData = {
                            products: products,
                            transaction_id: response.transaction.id,
                            amount: response.transaction.amount,
                            address: deliveryAddress
                        };

                        createOrder(userId, token, createOrderData)
                            .then(response => {
                                setData({...data, success: response.success});

                                const { token, user } = isAuthenticate();
                                const items = showSelectedCart();   //get selected items

                                // remove paid products from db one by one
                                for (let i = 0; i < items.length; ++i) {
                                    removeCartItem(user._id, token, items[i]).then(data => {
                                        if (data.error) {
                                            console.log(data.error);
                                        }
                                    });
                                }

                                // delete paid products from local storage
                                emptyCart(() => {
                                    console.log('payment success and empty cart');
                                    setData({loading: false});

                                    window.location.reload();
                                });
                        })
                        .catch(error => {
                            console.log(error);
                            setData({loading: false});
                        });


                    })
                    .catch(error => {
                        console.log(error);
                        setData({loading: false});
                    });
            })
            .catch(error => {
                // console.log('dropin error: ', error)
                setData({...data, error: error.message});
            });
    };

    const cod = () => {
      setData({loading: true});
      const { token, user } = isAuthenticate();
      const items = showSelectedCart();   //get selected items

      // remove paid products from db one by one
      for (let i = 0; i < items.length; ++i) {
        removeCartItem(user._id, token, items[i]).then(data => {
          if (data.error) {
            console.log(data.error);
          }
        });
      }

      // delete paid products from local storage
      emptyCart(() => {
        console.log('payment success and empty cart');
        setData({loading: false});

        window.location.reload();
      });
    }

    const showDropIn = () => (
        <div onBlur={() => setData({...data, error: ''})}>
            {data.clientToken !== null && products.length > 0 ? (
                <div>
                    <div className="gorm-group">
                        <label className="text-muted">Online order delivery address:</label>
                        <textarea
                            onChange={handleAddress}
                            className="form-control mb-3"
                            value={data.address}
                            placeholder="Type delivery address here..."
                        />
                    </div>
                    <DropIn options={{
                        authorization: data.clientToken,
                        paypal: {
                            flow: 'vault'
                        }
                    }} onInstance={instance => data.instance = instance} />
                    <button onClick={buy} className="btn btn-success btn-block">Pay</button>
                    {/*<button className="btn btn-block btn-success mt-2"><Link className="nav-link" style={{color: '#ffffff'}} to="/cod">Cash On Delivery</Link></button>*/}
                    <button onClick={cod} className="btn btn-block btn-success mt-2">Cash On Delivery</button>
                </div>
            ) : null}
        </div>
    );

    const showSuccess = success => (
        <div className="alert alert-info" style={{display: success ? '' : 'none'}}>
            Thanks! Your payment was successful!
        </div>
    );

    const showLoading = loading => loading && <h2>Your transaction is processing! Please Wait...</h2>;

    return (
        <div>
            <div className="row">
                <div className="col-lg-5 col-5">
                    <h6>Subtotal: </h6>
                </div>
                <div className="col-lg-7 col-7 text-right">
                    Rs {getTotal()}
                </div>
            </div>
            <div className="row">
                <div className="col-lg-5 col-5 mb-3">
                    <h6 className="text-black-50">Discount: </h6>
                </div>
                <div className="col-lg-7 col-7 text-right">
                    <h6 className="text-black-50">(-Rs {getDiscount()})</h6>
                </div>
            </div>
            <div className="row">
                <div className="col-lg-5 col-5 mb-3">
                    <h5 className="font-weight-bold">Total: </h5>
                </div>
                <div className="col-lg-7 col-7 text-right mb-4">
                    <h5 className="font-weight-bold">Rs {getDiscountedTotal()}</h5>
                </div>
            </div>

            {showLoading(data.loading)}
            {showSuccess(data.success)}
            {showCheckout()}

        </div>

    );
};

export default Checkout;
