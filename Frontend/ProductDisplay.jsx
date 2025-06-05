import React, { useContext, useState, useEffect } from 'react'
import './ProductDisplay.css'
import star_icon from "../assets/star_icon.png";
import star_dull_icon from "../assets/star_dull_icon.png";
import { ShopContext } from '../../context/ShopContext';
import axios from 'axios'

export const ProductDisplay = (props) => {
    const {product} = props;
    const {addToCart} = useContext(ShopContext);
    const [showSignInModal, setShowSignInModal] = useState(false);
    const [shopperStock, setShopperStock] = useState(0);
    const [stockLoading, setStockLoading] = useState(true);


    useEffect(() => {
        const fetchShopperStock = async () => {
            try {
                setStockLoading(true);
                const response = await axios.get(
                    `/api/retailer/products/${product.id}/shopper-stock`
                );
                setShopperStock(response.data.shopper_stock);
            } catch (error) {
                console.error("Error fetching stock:", error);
                setShopperStock(0);
            } finally {
                setStockLoading(false);
            }
        };

        if (product && product.id) {
            fetchShopperStock();
        }
    }, [product]);

    const handleAddToCart = async () => {
        if (shopperStock < 1) {
            alert("This product is out of stock!");
            return;
        }
        
        const token = localStorage.getItem('token');
        if (token) {
           try {
            
            const response = await axios.put(
                `/api/retailer/products/${product.id}/reduce-stock`,
                { quantity: 1 }, // Assuming 1 quantity per add to cart
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            
            setShopperStock(response.data.updatedStock);
            
            
            addToCart(product.id);
        } catch (error) {
            console.error("Error reducing stock:", error);
            alert(error.response?.data?.message || "Failed to update stock");
        }
        } else {
            setShowSignInModal(true);
        }
    };

    const closeModal = () => setShowSignInModal(false);

    return (
        <div className='productdisplay'>
            <div className="productdisplay-left">
                <div className="productdisplay-img-list">
                    <img src={product.image} alt="" />
                    <img src={product.image} alt="" />
                    <img src={product.image} alt="" />
                    <img src={product.image} alt="" />
                </div>
                <div className="productdisplay-img">
                    <img  className='productdisplay-main-img' src={product.image} alt="" />
                </div>
            </div>
            <div className="productdisplay-right">
                <h1>{product.name}</h1>
                <div className="productdisplay-right-star">
                    <img src={star_icon} alt="" />
                    <img src={star_icon} alt="" />
                    <img src={star_icon} alt="" />
                    <img src={star_icon} alt="" />
                    <img src={star_dull_icon} alt="" />
                    <p>(122)</p>
                </div>
                <div className="productdisplay-right-prices">
                    <div className="productdisplay-right-price-old">Rs {product.old_price}</div>
                    <div className="productdisplay-right-price-new">Rs {product.new_price}</div>
                </div>
                <div className="productdisplay-right-description">
                    A lightweight,usually knitted, pullover shirt, close-fitting and with
                    a round neckline and short sleeves, worn as an undershirt or outerior 
                    garment.
                </div>
                <div className="productdisplay-right-size">
                    <h1>Select Size</h1>
                    <div className="productdisplay-right-sizes">
                        <div>S</div>
                        <div>M</div>
                        <div>L</div>
                        <div>XL</div>
                        <div>XXL</div>
                    </div>
                </div>
                <div className="productdisplay-right-stock">
                    {stockLoading ? (
                        <p>Checking stock...</p>
                    ) : shopperStock > 0 ? (
                        <p>In Stock: {shopperStock} units</p>
                    ) : (
                        <p className="out-of-stock">Out of Stock</p>
                    )}
                </div>
                <button onClick={handleAddToCart} disabled={stockLoading || shopperStock < 1}
                >{shopperStock < 1 ? "OUT OF STOCK" : "ADD TO CART"}</button>
                <p className='productdisplay-right-category'><span>Category :</span>Women , T-Shirt, Crop Top</p>
                <p className='productdisplay-right-category'><span>Tags :</span>Modern, Latest</p>
            </div>

            {/* Custom Sign In Modal */}
            {showSignInModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Sign In Required</h2>
                        <p>Please sign in to add items to your cart.</p>
                        <div className="modal-buttons">
                            <button className="modal-close" onClick={closeModal}>Close</button>
                            <button className="modal-signin" onClick={() => {
                                closeModal();
                                window.location.href = '/login';
                            }}>Sign In</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}