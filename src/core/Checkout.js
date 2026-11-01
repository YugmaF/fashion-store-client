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
            return (nextValue.isChecked ? (Number.parseFloat(currentValue) + Number.parseFloat(nextValue.count) * Number.parseFloat(nextValue.price)).toFixed(2) : (Number.parseFloat(currentValue)).toFixed(2));
        }, 0);
    };

    //function to get discount of checked items
    const getDiscount = () => {
        return products.reduce((currentValue, nextValue) => {
            //current value gets as 0 and add values to current value from next value by looping through array
            const discount = isPromotionActive(nextValue)
                ? Number.parseFloat(nextValue.price) - getDiscountedPrice(nextValue)
                : 0;
            return (nextValue.isChecked ? (Number.parseFloat(currentValue) + Number.parseFloat(nextValue.count) * discount).toFixed(2) : (Number.parseFloat(currentValue)).toFixed(2));
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
            <Link to="/signin" className="st-checkout-signin-link">
                <button className="st-btn st-btn-primary st-btn-lg st-btn-block">Sign in to Checkout</button>
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
                <div className="st-checkout-pay">
                    <div className="st-checkout-field">
                        <label>Online order delivery address</label>
                        <textarea
                            onChange={handleAddress}
                            className="st-input"
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
                    <button onClick={buy} className="st-btn st-btn-primary st-btn-lg st-btn-block">Pay</button>
                    <button onClick={cod} className="st-btn st-btn-outline st-btn-lg st-btn-block">Cash On Delivery</button>
                </div>
            ) : null}
        </div>
    );

    const showSuccess = success => (
        success ? <div className="st-alert st-alert-success">Thanks! Your payment was successful!</div> : null
    );

    const showLoading = loading => loading && <div className="st-alert st-alert-info">Your transaction is processing! Please wait…</div>;

    return (
        <div className="st-checkout">
            <div className="st-checkout-row">
                <span>Subtotal</span>
                <span>Rs {getTotal()}</span>
            </div>
            <div className="st-checkout-row st-checkout-muted">
                <span>Discount</span>
                <span>(-Rs {getDiscount()})</span>
            </div>
            <div className="st-checkout-row st-checkout-total">
                <span>Total</span>
                <span>Rs {getDiscountedTotal()}</span>
            </div>

            {showLoading(data.loading)}
            {showSuccess(data.success)}
            {showCheckout()}

        </div>

    );
};

export default Checkout;
