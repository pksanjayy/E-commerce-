import './App.css';
import Navbar from './components/Navbar/Navbar';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Cart from './pages/Cart';
import { Shop } from './pages/Shop';
import { ShopCategory } from './pages/ShopCategory';
import { Product } from './pages/Product';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { Footer } from './components/Footer/Footer';
import men_banner from './components/assets/banner_mens.png';
import women_banner from './components/assets/banner_women.png';
import kid_banner from './components/assets/banner_kids.png';
import AdminDashboard from './pages/AdminDashboard';
import RetailerDashboard from './pages/RetailerDashboard';

import { useEffect } from 'react';
import { Orders } from './components/Orders/Orders';


function AppContent() {
  const location = useLocation();

  
  const hideLayout = ['/admin-dashboard', '/retailer-dashboard'];
  

  const shouldHideLayout = hideLayout.includes(location.pathname);

  return (
    <>
      {!shouldHideLayout && <Navbar />}
      <Routes>
        <Route path='/' element={<Shop />} />
        <Route path='/mens' element={<ShopCategory banner={men_banner} category="men" />} />
        <Route path='/womens' element={<ShopCategory banner={women_banner} category="women" />} />
        <Route path='/kids' element={<ShopCategory banner={kid_banner} category="kid" />} />
        <Route path='/product'>
          <Route path=':productId' element={<Product />} />
        </Route>
        <Route path='/cart' element={<Cart />} />
        <Route path='/orders' element={<Orders />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/login' element={<Login />} />
        <Route path='/retailer-dashboard' element={<RetailerDashboard />} />
        <Route path='/admin-dashboard' element={<AdminDashboard />} />
      </Routes>
      {!shouldHideLayout && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
