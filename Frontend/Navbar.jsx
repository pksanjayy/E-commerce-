import React, { useContext, useState, useEffect } from 'react'
import './Navbar.css'
import logo from '../assets/logo.png'
import cart_icon from '../assets/cart_icon.png'
import { Link } from 'react-router-dom'
import { ShopContext } from '../../context/ShopContext'

const Navbar = () => {
    const [menu, setMenu] = useState("shop");
    const { getTotalCartItems, isAuthenticated, logout } = useContext(ShopContext);
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        
        const token = localStorage.getItem('token');
        if (token) {
            
            
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUserEmail(payload.email || 'User');
            } catch (e) {
                console.error("Error decoding token:", e);
            }
        }
    }, [isAuthenticated]);

    return (
        <div className='navbar'>
            <div className="nav-logo">
                <img src={logo} alt="" />
                <p>SHOPPER</p>
            </div>
            <ul className="nav-menu">
                <li onClick={() => { setMenu("shop") }}><Link style={{ textDecoration: 'none' }} to='/'>Shop</Link>{menu === "shop" ? <hr /> : <></>}</li>
                <li onClick={() => { setMenu("mens") }}><Link style={{ textDecoration: 'none' }} to='/mens'>Men</Link>{menu === "mens" ? <hr /> : <></>}</li>
                <li onClick={() => { setMenu("womens") }}><Link style={{ textDecoration: 'none' }} to='/womens'>Women</Link>{menu === "womens" ? <hr /> : <></>}</li>
                <li onClick={() => { setMenu("kids") }}><Link style={{ textDecoration: 'none' }} to='/kids'>Kids</Link>{menu === "kids" ? <hr /> : <></>}</li>
                {isAuthenticated && (
                    <li onClick={() => { setMenu("orders") }}><Link style={{ textDecoration: 'none' }} to='/orders'>Orders</Link>{menu === "orders" ? <hr /> : <></>}</li>
                )}
            </ul>
            <div className="nav-login-cart">
                {isAuthenticated ? (
                    <div className="user-section">
                        <span className="user-email">{userEmail}</span>
                        <button onClick={logout} className="logout-btn">Logout</button>
                    </div>
                ) : (
                    <Link to='/login'><button>Login</button></Link>
                )}
                <Link to='/cart'><img src={cart_icon} alt="" /></Link>
                <div className="nav-cart-count">{getTotalCartItems()}</div>
            </div>
        </div>
    )
}

export default Navbar;