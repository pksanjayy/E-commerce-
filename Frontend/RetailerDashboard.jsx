"use client"

import { useState, useEffect, useContext } from "react"
import "./RetailerDashboard.css"
import { ShopContext } from "../context/ShopContext"
import { Item } from "../components/Item/Item"
import axios from "axios"
import { useNavigate } from "react-router-dom"


const RetailerDashboard = () => {
  
  const { all_product } = useContext(ShopContext)
  const navigate = useNavigate();


  
  const [retailerType, setRetailerType] = useState("") // "women", "men", "kid"
  const [activeSection, setActiveSection] = useState("products")
  const [userEmail, setUserEmail] = useState("")

  
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")

  
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    new_price: "",
    old_price: "",
    retailer_stock: "",
    shopper_stock: "",
    image: "",
  })

  // Loading states
  const [loading, setLoading] = useState({
    products: false,
  })

  
  const getRetailerTypeFromEmail = (email) => {
  const domain = email.split('@')[0].toLowerCase(); 
  
  if (domain.includes('women')) return 'women';
  if (domain.includes('men')) return 'men';
  if (domain.includes('kids') || domain.includes('kid')) return 'kid';
  return 'other';   
}

  
  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail")
    if (storedEmail) {
      setUserEmail(storedEmail)
      const type = getRetailerTypeFromEmail(storedEmail)
      setRetailerType(type)
    }
  }, [])

  
  const fetchProducts = async () => {
    setLoading((prev) => ({ ...prev, products: true }));

    try {
        const response = await axios.get('/api/retailer/products', {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        });

        setProducts(response.data);
        setFilteredProducts(response.data);
    } catch (error) {
        console.error("Error fetching products:", error.response?.data || error.message);
        alert(error.response?.data?.message || "Failed to fetch products");
    } finally {
        setLoading((prev) => ({ ...prev, products: false }));
    }
  };

  
  useEffect(() => {
    if (retailerType && all_product) {
      fetchProducts()
    }
  }, [retailerType, all_product])

  
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products)
    } else {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.id.toString().includes(searchTerm),
      )
      setFilteredProducts(filtered)
    }
  }, [searchTerm, products])

  
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  
  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      new_price: "",
      old_price: "",
      retailer_stock: "",
      shopper_stock: "",
      image: "",
    })
    setEditingProduct(null)
  }

  
  const openAddForm = () => {
    resetForm()
    setIsFormOpen(true)
  }

  
  const openEditForm = (product) => {
    setFormData({
      id: product.id,
      name: product.name,
      new_price: product.new_price,
      old_price: product.old_price,
      retailer_stock: product.retailer_stock,
      shopper_stock: product.shopper_stock,
      image: product.image,
    })
    setEditingProduct(product)
    setIsFormOpen(true)
  }

  
  const closeForm = () => {
    resetForm()
    setIsFormOpen(false)
  }

  
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        const url = editingProduct 
        ? `/api/retailer/products/${formData.id}`
        : '/api/retailer/products';

        const method = editingProduct ? 'put' : 'post';

        const response = await axios({
        method,
        url,
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        data: formData
        });

        alert(response.data.message);

        if (editingProduct) {
        
        const updatedProducts = products.map((product) =>
            product.id === formData.id ? response.data.product : product
        );
        setProducts(updatedProducts);
        } else {
        
        setProducts([...products, response.data.product]);
        }

        closeForm();
    } catch (error) {
        console.error("Error saving product:", error);
        alert(error.response?.data?.message || error.message);
    }
  };


  
  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return
    }

    try {
      
      await new Promise((resolve) => setTimeout(resolve, 500))

      const updatedProducts = products.filter((product) => product.id !== id)
      setProducts(updatedProducts)
      alert("Product deleted successfully!")
    } catch (error) {
      console.error("Error deleting product:", error)
      alert("Error deleting product. Please try again.")
    }
  }

  
  const updateStock = async (productId, stockType, newValue) => {
    try {
        
        const path = stockType === 'retailer_stock' ? 'retailer-stock' : 'shopper-stock';

        const response = await axios.put(
        `/api/retailer/inventory/${productId}/${path}`,
        { stock: Number(newValue) },
        {
            headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        }
        );

        const updatedProduct = response.data.product;

        const updatedProducts = products.map((product) =>
        product.id === productId ? updatedProduct : product
        );

        setProducts(updatedProducts);
        setFilteredProducts(
        updatedProducts.filter((product) => product.category === retailerType)
        );
    } catch (error) {
        console.error("Error updating stock:", error.response?.data || error.message);
        alert(error.response?.data?.message || "Failed to update stock");
    }
  };


  
  const handleLogout = () => {
    
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    
    
    setUserEmail("");
    setRetailerType("");
    setProducts([]);
    setFilteredProducts([]);
    
    
    navigate("/login"); 
    };
  
  const renderProductManagement = () => (
    <div className="section-content">
      <div className="section-header">
        <h2>
            {{
            women: "Women's Products",
            men: "Men's Products",
            kids: "Kids' Products",
            other: "All Products" // New general retailer case
            }[retailerType]}
        </h2>
        <h2>Product Management - {retailerType.charAt(0).toUpperCase() + retailerType.slice(1)}'s Collection</h2>
        <button className="btn btn-primary" onClick={openAddForm}>
          Add New Product
        </button>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

       {loading.products ? (
        <div>Loading products...</div>
        ) : filteredProducts.length === 0 ? (
        <div className="no-products">
            {retailerType === 'general' 
            ? "No products available. Add your first product!"
            : `No ${retailerType}'s products found`}
        </div>
      ) : (
        <>
          {/* Category info similar to ShopCategory */}
          <div className="shopcategory-indexSort">
            <p>
              <span>Showing 1-{filteredProducts.length}</span> out of {all_product.length} products
            </p>
          </div>

          <div className="shopcategory-products">
            {filteredProducts.map((item, i) => (
              <Item
                key={i}
                id={item.id}
                name={item.name}
                image={item.image}
                new_price={item.new_price}
                old_price={item.old_price}
                retailer_stock={item.retailer_stock}
                shopper_stock={item.shopper_stock}
                onEdit={openEditForm}
                onDelete={handleDeleteProduct}
              />
            ))}
          </div>
        </>
      )}

      {/* Product Form Modal */}
      {isFormOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingProduct ? "Edit Product" : "Add New Product"}</h2>
              <button className="close-btn" onClick={closeForm}>
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-group">
                <label htmlFor="name">Product Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="new_price">New Price ($)</label>
                  <input
                    type="number"
                    id="new_price"
                    name="new_price"
                    value={formData.new_price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="old_price">Old Price ($)</label>
                  <input
                    type="number"
                    id="old_price"
                    name="old_price"
                    value={formData.old_price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="retailer_stock">Retailer Stock</label>
                  <input
                    type="number"
                    id="retailer_stock"
                    name="retailer_stock"
                    value={formData.retailer_stock}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="shopper_stock">Shopper Stock</label>
                  <input
                    type="number"
                    id="shopper_stock"
                    name="shopper_stock"
                    value={formData.shopper_stock}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="image">Image URL</label>
                <input
                  type="text"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={closeForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? "Update Product" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )

  
  const renderRetailerInventory = () => (
    <div className="section-content">
      <div className="section-header">
        <h2>Retailer's Inventory - {retailerType.charAt(0).toUpperCase() + retailerType.slice(1)}'s Stock</h2>
        <button className="btn btn-primary" onClick={fetchProducts}>
          Refresh
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Stock Levels Management</h3>
        </div>
        <div className="card-content">
          {loading.products ? (
            <div className="loading-spinner">Loading inventory...</div>
          ) : products.length === 0 ? (
            <div className="no-data">No products found</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Current Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="product-cell">
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="product-thumbnail"
                        />
                        <div>
                          <div className="product-name">{product.name}</div>
                          <div className="product-price">${product.new_price}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="stock-input"
                        value={product.retailer_stock}
                        min="0"
                        onChange={(e) => updateStock(product.id, "retailer_stock", e.target.value)}
                      />
                    </td>
                    <td>
                      <span
                        className={`stock-status ${product.retailer_stock < 20 ? "low-stock" : product.retailer_stock > 100 ? "high-stock" : "in-stock"}`}
                      >
                        {product.retailer_stock < 20
                          ? "Low Stock"
                          : product.retailer_stock > 100
                            ? "Overstocked"
                            : "In Stock"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm"
                        onClick={() => updateStock(product.id, 'retailer_stock', product.retailer_stock + 10)}
                        >
                        Restock
                      </button>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      
      <div className="card mt-20">
        <div className="card-header">
          <h3>Low Stock Alert</h3>
        </div>
        <div className="card-content">
          {products.filter((p) => p.retailer_stock < 20).length === 0 ? (
            <div className="no-data">No low stock items</div>
          ) : (
            <div className="alert-list">
              {products
                .filter((p) => p.retailer_stock < 20)
                .map((product) => (
                  <div className="alert-item" key={product.id}>
                    <div className="alert-icon">⚠️</div>
                    <div className="alert-content">
                      <h4>{product.name}</h4>
                      <p>
                        Current stock: <strong>{product.retailer_stock}</strong> units
                      </p>
                    </div>
                    <button className="btn btn-sm">Restock</button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  
  const renderShopperInventory = () => (
    <div className="section-content">
      <div className="section-header">
        <h2>Shopper's Inventory - E-commerce Stock</h2>
        <button className="btn btn-primary" onClick={fetchProducts}>
          Refresh
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>E-commerce Platform Stock Levels</h3>
          <p>Stock available for customers on the e-commerce platform</p>
        </div>
        <div className="card-content">
          {loading.products ? (
            <div className="loading-spinner">Loading shopper inventory...</div>
          ) : products.length === 0 ? (
            <div className="no-data">No products found</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>E-commerce Stock</th>
                  <th>Retailer Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="product-cell">
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="product-thumbnail"
                        />
                        <div>
                          <div className="product-name">{product.name}</div>
                          <div className="product-price">${product.new_price}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="stock-input"
                        value={product.shopper_stock}
                        min="0"
                        max={product.retailer_stock}
                        onChange={(e) => updateStock(product.id, "shopper_stock", e.target.value)}
                      />
                    </td>
                    <td>
                      <span className="retailer-stock">{product.retailer_stock}</span>
                    </td>
                    <td>
                      <span
                        className={`stock-status ${product.shopper_stock < 10 ? "low-stock" : product.shopper_stock === 0 ? "out-of-stock" : "in-stock"}`}
                      >
                        {product.shopper_stock === 0
                          ? "Out of Stock"
                          : product.shopper_stock < 10
                            ? "Low Stock"
                            : "Available"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm"
                        disabled={product.retailer_stock === 0}
                        onClick={() => {
                            if (product.retailer_stock > 0) {
                            updateStock(product.id, 'retailer_stock', product.retailer_stock - 1);
                            updateStock(product.id, 'shopper_stock', product.shopper_stock + 1);
                            }
                        }}
                        >
                        Transfer Stock
                      </button>

                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Out of Stock Alert */}
      <div className="card mt-20">
        <div className="card-header">
          <h3>E-commerce Stock Alerts</h3>
        </div>
        <div className="card-content">
          {products.filter((p) => p.shopper_stock < 10).length === 0 ? (
            <div className="no-data">All products are well stocked</div>
          ) : (
            <div className="alert-list">
              {products
                .filter((p) => p.shopper_stock < 10)
                .map((product) => (
                  <div className="alert-item" key={product.id}>
                    <div className="alert-icon">{product.shopper_stock === 0 ? "🚫" : "⚠️"}</div>
                    <div className="alert-content">
                      <h4>{product.name}</h4>
                      <p>
                        E-commerce stock: <strong>{product.shopper_stock}</strong> units
                        <br />
                        Retailer stock available: <strong>{product.retailer_stock}</strong> units
                      </p>
                    </div>
                    <button className="btn btn-sm">Transfer from Retailer</button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  
  const renderSection = () => {
  if (!retailerType || !userEmail) {
    return (
      <div className="section-content">
        <div className="no-data">
          <h2>Please Login</h2>
          <p>You need to login with a valid retailer email to access the dashboard.</p>
        </div>
      </div>
    );
  }

  if (retailerType === 'other') {
    return (
      <div className="section-content">
        <div className="no-data">
          <h2>Retailer Dashboard</h2>
          <p>Please add products to manage your inventory.</p>
          <button 
            className="btn btn-primary" 
            onClick={() => setActiveSection('retailer-inventory')}
          >
            Go to Inventory Management
          </button>
        </div>
      </div>
    );
  }

    switch (activeSection) {
      case "products":
        return renderProductManagement()
      case "retailer-inventory":
        return renderRetailerInventory()
      case "shopper-inventory":
        return renderShopperInventory()
      default:
        return renderProductManagement()
    }
  }

  
  if (!userEmail || !retailerType) {
    return (
      <div className="retailer-dashboard">
        <div className="login-message">
          <h2>Retailer Dashboard</h2>
          <p>Please use your existing login system to access the dashboard.</p>
          <p>The dashboard will automatically detect your retailer type from your email.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="retailer-dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>Retailer Dashboard</h1>
          <div className="retailer-info">
            
            <p className="retailer-type">
              
            </p>
          </div>
        </div>
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeSection === "products" ? "active" : ""}`}
            onClick={() => setActiveSection("products")}
          >
            Products
          </button>
          <button
            className={`nav-item ${activeSection === "retailer-inventory" ? "active" : ""}`}
            onClick={() => setActiveSection("retailer-inventory")}
          >
            Retailer's Inventory
          </button>
          <button
            className={`nav-item ${activeSection === "shopper-inventory" ? "active" : ""}`}
            onClick={() => setActiveSection("shopper-inventory")}
          >
            Shopper's Inventory
          </button>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">{retailerType === "women" ? "WS" : retailerType === "men" ? "MS" : "KS"}</div>
            <div className="user-details">
              <div className="user-name">
                {(() => {
                        switch(retailerType) {
                            case "women": return "Women's Store";
                            case "men": return "Men's Store";
                            case "kids": return "Kids' Store";
                            default: return "General Retailer";
                        }
                        })()}
              </div>
              <div className="user-role">
                <p>Logged in as:</p>
                <p className="retailer-email">{userEmail}</p>
              </div>
            </div>
          </div>
          <button className="btn btn-outline logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <div className="header-title">
            <h2>
               {
                retailerType === 'other' 
                    ? "Retailer Dashboard" 
                    : `${retailerType.charAt(0).toUpperCase() + retailerType.slice(1)}'s Dashboard`
                }
            </h2>
          </div>
          <div className="header-actions">
            <div className="notification-bell">
              <span>🔔</span>
              <span className="notification-badge">
                {products.filter((p) => p.retailer_stock < 20 || p.shopper_stock < 10).length}
              </span>
            </div>
            <button className="btn btn-outline">Help</button>
          </div>
        </header>

        {/* Main content area */}
        <main className="content-area">{renderSection()}</main>
      </div>
    </div>
  )
}

export default RetailerDashboard
