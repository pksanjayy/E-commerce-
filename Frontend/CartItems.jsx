import React, { useContext, useState } from 'react'
import './CartItems.css'
import { ShopContext } from '../../context/ShopContext'
import remove_icon from '../assets/cart_cross_icon.png'
import { SuccessPopup } from '../Success/SuccessPopup'


export const CartItems = () => {
  const {getTotalCartAmount,all_product,cartItems,removeFromCart,checkout,clearCart} = useContext(ShopContext)
  const [showSuccess,setShowSuccess] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  const handleCheckout = async () => {
    const order = await checkout(); 
    setCurrentOrder(order);         
    setShowSuccess(true);           
  };

  
  const handleContinueShopping = () => {
        setShowSuccess(false);
        
    };

  const handleNewCart = () => {
        clearCart();
        setShowSuccess(false);
    };

  return (
    <div className='cartitems'>
      {showSuccess && (
                <SuccessPopup 
                    order={currentOrder} 
                    onContinue={handleContinueShopping}
                    onNewCart={handleNewCart}
                />
            )}
      <div className="cartitems-format-main">
        <p>Products</p>
        <p>Title</p>
        <p>Price</p>
        <p>Quantity</p>
        <p>Total</p>
        <p>Remove</p>
      </div>
      <hr />
      {all_product.map((e)=>{
        if(cartItems[e.id]>0)
        {
          return <div>
                    <div className="cartitems-format cartitems-format-main">
                      <img src={e.image} alt="" className='carticon-product-icon' />
                      <p>{e.name}</p>
                      <p>${e.new_price}</p>
                      <button className='caritems-quantity'>{cartItems[e.id]}</button>
                      <p>${e.new_price*cartItems[e.id]}</p>
                      <img className='cartitems-remove-icon' src={remove_icon} onClick={()=>{removeFromCart(e.id)}} alt="" />
                    </div>
                    <hr />
                  </div>
        }
        return null;
      })}
      <div className="cartitems-down">
        <div className="cartitems-total">
          <h1>Cart Total</h1>
          <div>
            <div className="cartitems-total-item">
              <p>Subtotal</p>
              <p>${getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <p>Shipping Fee</p>
              <p>Free</p>
            </div>
            <hr />
            <div className="cartitems-total-item">
              <h3>Total</h3>
              <h3>${getTotalCartAmount()}</h3>
            </div>
          </div>
          <button onClick={handleCheckout}>PROCEED TO CHECKOUT</button>
        </div>
        <div className="cartitems-promocode">
          <p>If you have a promocode enter it here</p>
          <div className="cartitems-promobox">
            <input type="text" placeholder='promo code' />
            <button>Submit</button>
          </div>
        </div>
      </div>
    </div>
  )
}
