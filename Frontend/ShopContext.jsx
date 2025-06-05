import React, { createContext, useEffect, useState } from "react";
import all_product from "../components/assets/all_product";
import axios from 'axios';


export const ShopContext = createContext(null);
const getDefaultCart = ()=>{
        let cart = {};
        for (let index = 0; index < all_product.length + 1; index++) {
            cart[index] = 0;
            
        }
        return cart;
}
const ShopContextProvider = (props) => {
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem('cartItems');
        return savedCart ? JSON.parse(savedCart) : {};
    });
    const [orders, setOrders] = useState(() => {
        const savedOrders = localStorage.getItem('orders');
        return savedOrders ? JSON.parse(savedOrders) : [];
    });

    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return !!localStorage.getItem('token');
    });
    

    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    useEffect(() => {
        localStorage.setItem('orders', JSON.stringify(orders));
    }, [orders]);

    const updateCartBackend = async (productId, quantity) => {
        try {
            await axios.post('/api/users/cart', {
            productId,
            quantity
            }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
            });
        } catch (error) {
            console.error("Error updating cart:", error);
        }
        };
    
    const login = (token) => {
        localStorage.setItem('token', token);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setCartItems({});
        setIsAuthenticated(false);
        window.location.href = '/';
    };

    

    const addToCart = (itemId) => {
        setCartItems((prev) => {
            const updated = { ...prev, [itemId]: (prev[itemId] || 0) + 1 };
            updateCartBackend(itemId, updated[itemId]);
            return updated;
        });
        };


    const removeFromCart = (itemId) =>{
        setCartItems((prev) => {
            const updated = { ...prev, [itemId]: Math.max((prev[itemId] || 0) - 1, 0) };
            updateCartBackend(itemId, updated[itemId]);
            return updated;
        });
        };


   const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const itemId in cartItems) {
            if (cartItems[itemId] > 0) {
                const itemInfo = all_product.find(
                    (product) => product.id === Number(itemId)
                );
                if (itemInfo) {
                    totalAmount += itemInfo.new_price * cartItems[itemId];
                }
            }
        }
        return totalAmount;
    }


    const getTotalCartItems = () => {
        return Object.values(cartItems).reduce((total, quantity) => total + quantity, 0);
    };

    const checkout = async () => {
        const items = Object.entries(cartItems).map(([productId, quantity]) => {
            const product = all_product.find((p) => p.id === Number(productId));
            return {
            productId: Number(productId),
            quantity,
            price: product?.new_price || 0,
            };
        });

        const total = getTotalCartAmount();

        try {
            const res = await axios.post('/api/users/orders', {
            items,
            total,
            }, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
            }
            });

            setOrders([res.data.order, ...orders]);
            setCartItems({});
            alert("Order placed successfully");

            return res.data.order;
        } catch (error) {
            console.error("Error placing order:", error);
            alert("Failed to place order");
        }
    };



   
    useEffect(() => {
        const fetchOrders = async () => {
            try {
            const res = await axios.get('/api/users/orders', {
                headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            setOrders(res.data);
            } catch (error) {
            console.error("Error fetching orders:", error);
            }
        };

        fetchOrders();
        }, []);

    useEffect(() => {
        const fetchCart = async () => {
            try {
            const res = await axios.get('/api/users/cart', {
                headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            const cartObj = {};
            res.data.items.forEach(item => {
                cartObj[item.productId] = item.quantity;
            });

            setCartItems(cartObj);
            } catch (error) {
            console.error("Error fetching cart:", error);
            }
        };

        fetchCart();
        }, []);




    const clearCart = () => {
        setCartItems({});
    };


    const contextValue = {getTotalCartItems,getTotalCartAmount,all_product,cartItems,addToCart,removeFromCart,orders,checkout,clearCart,isAuthenticated,login,
logout};
    
    
    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    )
}

export default ShopContextProvider;
