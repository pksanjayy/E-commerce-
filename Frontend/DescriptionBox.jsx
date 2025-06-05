import React from 'react'
import './DescriptionBox.css'

export const DescriptionBox = () => {
  return (
    <div className='descriptionbox'>
        <div className="descriptionbox-navigator">
            <div className="descriptionbox-nav-box">Description</div>
            <div className="descriptionbox-nav-box fade">Reviews (122)</div>
        </div>
        <div className="descriptionbox-description">
            <p>The Shopper website is an online platform where people can buy and sell products or services. 
                It acts like a digital shop, allowing users to browse items, add them to a cart, and make secure payments. 
                Customers can shop from anywhere at any time. These websites often include features like order tracking and reviews. 
                Shopper has become a key part of modern shopping.</p>
            <p>
                In addition to basic shopping functions, shopper websites often offer personalized recommendations based on user behavior. 
                They support various payment gateways to ensure secure and convenient transactions. Many also provide discounts, coupons, and loyalty programs to attract and retain customers. 
                A well-designed shopper website is mobile-friendly and ensures a smooth user experience. It also includes admin panels to manage inventory, orders, and customer queries efficiently.
            </p>
        </div>
    </div>
  )
}
