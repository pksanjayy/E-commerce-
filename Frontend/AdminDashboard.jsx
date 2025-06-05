"use client"

import { useEffect, useState, useCallback } from "react"
import axios from "axios"
import "./AdminDashboard.css"
import { useNavigate } from 'react-router-dom'



const API_URL = "http://localhost:8080/api/admin"

const AdminDashboard = () => {
  
  const [activeSection, setActiveSection] = useState("dashboard")

  
  const [pendingRetailers, setPendingRetailers] = useState([])
 const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [retailers, setRetailers] = useState([])
  const [analytics, setAnalytics] = useState({
    totalSales: 0,
    salesByCategory: { mens: 0, womens: 0, kids: 0 },
    salesByRetailer: [],
  })

  
  const [loading, setLoading] = useState({
    pendingRetailers: false,
    users: false,
    orders: false,
    retailers: false,
    analytics: false,
  })

  
  const getAuthHeader = useCallback(() => {
    const token = localStorage.getItem("token")
    return token ? { Authorization: `Bearer ${token}` } : {}
  }, [])

  const handleLogout = () => {
  localStorage.removeItem("token")
  navigate("/login")
}

  
  const fetchPendingRetailers = useCallback(async () => {
    setLoading((prev) => ({ ...prev, pendingRetailers: true }))
    try {
      const res = await axios.get(`${API_URL}/pending-retailers`, {
        headers: getAuthHeader(),
      })
      setPendingRetailers(res.data)
    } catch (err) {
      console.error("Error fetching pending retailers", err)
      
    } finally {
      setLoading((prev) => ({ ...prev, pendingRetailers: false }))
    }
  }, [getAuthHeader])

  
  const fetchUsers = useCallback(async () => {
    setLoading((prev) => ({ ...prev, users: true }))
    try {
      const res = await axios.get(`${API_URL}/users`, {
        headers: getAuthHeader(),
      })
      
      const mappedUsers = res.data.map((user) => ({
        id: user._id || user.id,
        name: user.name || `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        email: user.email,
        role: user.role,
        status: user.status,
      }))
      setUsers(mappedUsers)
    } catch (err) {
      console.error("Error fetching users", err)
    } finally {
      setLoading((prev) => ({ ...prev, users: false }))
    }
  }, [getAuthHeader])

  
  const fetchOrders = useCallback(async () => {
    setLoading((prev) => ({ ...prev, orders: true }));
    try {
        const res = await axios.get(`${API_URL}/orders`, {
            headers: getAuthHeader(),
        });
        
        
        const mappedOrders = res.data.map((order) => ({
            id: order._id || order.id,
            customer: order.customer, 
            email: order.customerEmail || "", 
            date: order.date || new Date().toISOString().split("T")[0],
            total: order.total || 0,
            status: order.status || "Pending",
            items: order.items || [] 
        }));
        
        setOrders(mappedOrders);
    } catch (err) {
        console.error("Error fetching orders:", err.response?.data || err.message);
        alert("Failed to fetch orders. Please try again.");
        setOrders([]);
    } finally {
        setLoading((prev) => ({ ...prev, orders: false }));
    }
}, [getAuthHeader]);

  
  const fetchRetailers = useCallback(async () => {
    setLoading((prev) => ({ ...prev, retailers: true }))
    try {
      const res = await axios.get(`${API_URL}/retailers`, {
      headers: getAuthHeader(),
    })

      
      const mappedRetailers = res.data.map((retailer) => ({
        id: retailer._id || retailer.id,
        name: retailer.name || retailer.businessName || `${retailer.firstName || ""} ${retailer.lastName || ""}`.trim(),
        email: retailer.email,
        products: retailer.productCount || retailer.products || 0,
        status: retailer.status || "active",
      }))
      setRetailers(mappedRetailers)
    } catch (err) {
      console.error("Error fetching retailers", err)
    } finally {
      setLoading((prev) => ({ ...prev, retailers: false }))
    }
  }, [getAuthHeader])

  
  const fetchAnalytics = useCallback(async () => {
    setLoading((prev) => ({ ...prev, analytics: true }))
    try {
      const res = await axios.get(`${API_URL}/analytics`, {
        headers: getAuthHeader(),
      })
      setAnalytics({
        totalSales: res.data.totalSales || 0,
        salesByCategory: {
          mens: res.data.salesByCategory?.mens || 0,
          womens: res.data.salesByCategory?.womens || 0,
          kids: res.data.salesByCategory?.kids || 0,
        },
        salesByRetailer: res.data.salesByRetailer || [],
      })
    } catch (err) {
      console.error("Error fetching analytics", err)
      
      setAnalytics({
        totalSales: 125850,
        salesByCategory: { mens: 45600, womens: 62300, kids: 17950 },
        salesByRetailer: [
          { id: 1, name: "Fashion Hub", sales: 32450 },
          { id: 2, name: "Style Central", sales: 28700 },
          { id: 3, name: "Trendy Threads", sales: 24300 },
          { id: 4, name: "Urban Outfitters", sales: 21200 },
          { id: 5, name: "Chic Boutique", sales: 19200 },
        ],
      })
    } finally {
      setLoading((prev) => ({ ...prev, analytics: false }))
    }
  }, [getAuthHeader])

  
  const fetchAllData = useCallback(() => {
    fetchPendingRetailers()
    fetchUsers()
    fetchOrders()
    fetchRetailers()
    fetchAnalytics()
  }, [fetchPendingRetailers, fetchUsers, fetchOrders, fetchRetailers, fetchAnalytics])

  
  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  
  const approveRetailer = async (id) => {
    try {
      await axios.post(`${API_URL}/approve-retailer`, { retailerId: id }, { headers: getAuthHeader() })
      setPendingRetailers(pendingRetailers.filter((r) => r._id !== id))
      alert("Retailer approved successfully")
      fetchRetailers()
    } catch (err) {
      console.error("Error approving retailer", err)
      alert("Failed to approve retailer")
    
      if (err.response && err.response.status === 401) {
        setPendingRetailers(pendingRetailers.filter((r) => r._id !== id))
      }
    }
  }


  const blockUser = async (id, currentStatus) => {
    const newStatus = currentStatus === "blocked" ? "active" : "blocked"
    try {
      await axios.put(`${API_URL}/users/${id}/status`, { status: newStatus }, { headers: getAuthHeader() })
      setUsers(users.map((user) => (user.id === id ? { ...user, status: newStatus } : user)))
      alert(`User ${newStatus === "blocked" ? "blocked" : "unblocked"} successfully`)
    } catch (err) {
      console.error("Error updating user status", err)
      alert(`Failed to ${newStatus === "blocked" ? "block" : "unblock"} user`)
      
      if (err.response && err.response.status === 401) {
        setUsers(users.map((user) => (user.id === id ? { ...user, status: newStatus } : user)))
      }
    }
  }

  
  const changeUserRole = async (id, newRole) => {
    try {
      await axios.put(`${API_URL}/users/${id}/role`, { role: newRole }, { headers: getAuthHeader() })
      setUsers(users.map((user) => (user.id === id ? { ...user, role: newRole } : user)))
      alert(`User role updated to ${newRole}`)
    } catch (err) {
      console.error("Error updating user role", err)
      alert("Failed to update user role")
      
      if (err.response && err.response.status === 401) {
        setUsers(users.map((user) => (user.id === id ? { ...user, role: newRole } : user)))
      }
    }
  }

 
  const processOrder = async (id, newStatus) => {
    try {
      await axios.put(`${API_URL}/orders/${id}/status`, { status: newStatus }, { headers: getAuthHeader() })
      setOrders(orders.map((order) => (order.id === id ? { ...order, status: newStatus } : order)))
      alert(`Order status updated to ${newStatus}`)
    } catch (err) {
      console.error("Error updating order status", err)
      alert("Failed to update order status")
      
      if (err.response && err.response.status === 401) {
        setOrders(orders.map((order) => (order.id === id ? { ...order, status: newStatus } : order)))
      }
    }
  }

  
  const renderDashboard = () => (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <h2>Dashboard</h2>
        <button className="btn btn-outline" onClick={fetchAllData} disabled={Object.values(loading).some(Boolean)}>
          {Object.values(loading).some(Boolean) ? "Loading..." : "Refresh Data"}
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <h3>Total Revenue</h3>
          </div>
          <div className="stat-content">
            {loading.analytics ? (
              <div className="loading-placeholder"></div>
            ) : (
              <>
                <div className="stat-value">${analytics.totalSales.toLocaleString()}</div>
                <p className="stat-change positive">+20.1% from last month</p>
              </>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3>Mens Category</h3>
          </div>
          <div className="stat-content">
            {loading.users ? (
              <div className="loading-placeholder"></div>
            ) : (
              <>
                <div className="stat-value">${analytics.salesByCategory.mens.toLocaleString()}</div>
                <p className="stat-change positive">+18.1% from last month</p>
              </>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3>Womens Category</h3>
          </div>
          <div className="stat-content">
            {loading.orders ? (
              <div className="loading-placeholder"></div>
            ) : (
              <>
                <div className="stat-value">${analytics.salesByCategory.womens.toLocaleString()}</div>
                <p className="stat-change positive">+19% from last month</p>
              </>
            )}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h3>Kids Category</h3>
          </div>
          <div className="stat-content">
            {loading.retailers ? (
              <div className="loading-placeholder"></div>
            ) : (
              <>
                <div className="stat-value">${analytics.salesByCategory.kids.toLocaleString()}</div>
                <p className="stat-change positive">+5 since last week</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-row">
        <div className="card orders-card">
          <div className="card-header">
            <h3>Recent Orders</h3>
            <button className="btn btn-icon" onClick={fetchOrders} disabled={loading.orders}>
              {loading.orders ? "Loading..." : "↻"}
            </button>
          </div>
          <div className="card-content">
            {loading.orders ? (
              <div className="loading-table"></div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.email && <div className="text-muted small">{order.email}</div>}</td>
                      <td>
                        <span
                          className={`badge badge-${
                            order.status === "Delivered"
                              ? "success"
                              : order.status === "Processing"
                                ? "info"
                                : order.status === "Shipped"
                                  ? "warning"
                                  : "danger"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td>${order.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="card-footer">
            <button className="btn btn-outline full-width" onClick={() => setActiveSection("orders")}>
              View All Orders
            </button>
          </div>
        </div>

        <div className="card retailers-card">
          <div className="card-header">
            <h3>Top Retailers</h3>
            <button className="btn btn-icon" onClick={fetchRetailers} disabled={loading.retailers}>
              {loading.retailers ? "Loading..." : "↻"}
            </button>
          </div>
          <div className="card-content">
            {loading.retailers || loading.analytics ? (
              <div className="loading-list"></div>
            ) : (
              <div className="retailer-list">
                {retailers.slice(3, 6).map((retailer) => (
                  <div className="retailer-item" key={retailer.id}>
                    <div className="retailer-avatar">{retailer.name.substring(0, 2)}</div>
                    <div className="retailer-info">
                      <p className="retailer-name">{retailer.name}</p>
                    </div>
                    <div className="retailer-growth">+{Math.floor(Math.random() * 20) + 5}%</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="card-footer">
            <button className="btn btn-outline full-width" onClick={() => setActiveSection("retailers")}>
              View All Retailers
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  
  const renderUserManagement = () => (
    <div className="section-content">
      <div className="section-header">
        <h2>User Management</h2>
        <button className="btn btn-outline" onClick={fetchUsers} disabled={loading.users}>
          {loading.users ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>User Management</h3>
          <p>Manage user accounts, roles, and permissions</p>
        </div>
        <div className="card-content">
          <div className="table-actions">
            <div className="search-container">
              <input type="search" placeholder="Search users..." className="search-input" />
            </div>
            <button className="btn">Add User</button>
          </div>

          {loading.users ? (
            <div className="loading-table"></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) => changeUserRole(user.id, e.target.value)}
                        className="role-select"
                      >
                        <option value="admin">Admin</option>
                        <option value="retailer">Retailer</option>
                        <option value="vendor">Vendor</option>
                        <option value="customer">Customer</option>
                      </select>
                    </td>
                    <td>
                      <span
                        className={`badge badge-${
                          user.status === "active" ? "success" : user.status === "pending" ? "warning" : "danger"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn ${user.status === "blocked" ? "btn-outline" : "btn-danger"}`}
                        onClick={() => blockUser(user.id, user.status)}
                      >
                        {user.status === "blocked" ? "Unblock" : "Block"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )

  
  const renderOrderManagement = () => (
    <div className="section-content">
      <div className="section-header">
        <h2>Order Management</h2>
        <button className="btn btn-outline" onClick={fetchOrders} disabled={loading.orders}>
          {loading.orders ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Order Management</h3>
          <p>View and process customer orders</p>
        </div>
        <div className="card-content">
          <div className="table-actions">
            <div className="search-container">
              <input type="search" placeholder="Search orders..." className="search-input" />
            </div>
            <select className="filter-select">
              <option>All Orders</option>
              <option>Pending</option>
              <option>Processing</option>
              <option>Shipped</option>
              <option>Delivered</option>
            </select>
          </div>

          {loading.orders ? (
            <div className="loading-table"></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>
                    
                    {order.email && <div className="text-muted small">{order.email}</div>}
                    </td>
                    <td>{order.date}</td>
                    <td>${order.total}</td>
                    <td>
                      <span
                        className={`badge badge-${
                          order.status === "Delivered"
                            ? "success"
                            : order.status === "Processing"
                              ? "info"
                              : order.status === "Shipped"
                                ? "warning"
                                : "danger"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <select
                        onChange={(e) => processOrder(order.id, e.target.value)}
                        className="status-select"
                        value={order.status}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )

  
  const renderRetailerManagement = () => (
    <div className="section-content">
      <div className="section-header">
        <h2>Retailer Management</h2>
        <div className="button-group">
          <button className="btn btn-outline" onClick={fetchPendingRetailers} disabled={loading.pendingRetailers}>
            {loading.pendingRetailers ? "Loading..." : "Refresh Pending"}
          </button>
          <button className="btn btn-outline" onClick={fetchRetailers} disabled={loading.retailers}>
            {loading.retailers ? "Loading..." : "Refresh Active"}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Pending Retailer Requests</h3>
          <p>Approve new retailer registrations</p>
        </div>
        <div className="card-content">
          {loading.pendingRetailers ? (
            <div className="loading-table"></div>
          ) : pendingRetailers.length === 0 ? (
            <p>No pending requests</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingRetailers.map((retailer) => (
                  <tr key={retailer._id}>
                    <td>
                      {retailer.firstName} {retailer.lastName}
                    </td>
                    <td>{retailer.email}</td>
                    <td>
                      <button onClick={() => approveRetailer(retailer._id)} className="btn btn-success">
                        ✓ Approve
                      </button>
                      <button className="btn btn-outline">✕ Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-header">
          <h3>Active Retailers</h3>
          <p>Monitor retailer activities and compliance</p>
        </div>
        <div className="card-content">
          <div className="table-actions">
            <div className="search-container">
              <input type="search" placeholder="Search retailers..." className="search-input" />
            </div>
          </div>

          {loading.retailers ? (
            <div className="loading-table"></div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Products</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {retailers.map((retailer) => (
                  <tr key={retailer.id}>
                    <td>{retailer.name}</td>
                    <td>{retailer.email}</td>
                    <td>{retailer.products}</td>
                    <td>
                      <span
                        className={`badge badge-${
                          retailer.status === "active"
                            ? "success"
                            : retailer.status === "warning"
                              ? "warning"
                              : "danger"
                        }`}
                      >
                        {retailer.status}
                      </span>
                    </td>
                    <td>
                      <select className="status-select">
                        <option>View Details</option>
                        <option>View Products</option>
                        <option>Flag for Review</option>
                        <option>Suspend Retailer</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )

  
  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return renderDashboard()
      case "users":
        return renderUserManagement()
      case "orders":
        return renderOrderManagement()
      case "retailers":
        return renderRetailerManagement()
      default:
        return renderDashboard()
    }
  }

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeSection === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveSection("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`nav-item ${activeSection === "users" ? "active" : ""}`}
            onClick={() => setActiveSection("users")}
          >
            User Management
          </button>
          <button
            className={`nav-item ${activeSection === "orders" ? "active" : ""}`}
            onClick={() => setActiveSection("orders")}
          >
            Order Management
          </button>
          <button
            className={`nav-item ${activeSection === "retailers" ? "active" : ""}`}
            onClick={() => setActiveSection("retailers")}
          >
            Retailer Management
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <div className="search-bar">
            <input type="search" placeholder="Search..." />
          </div>
          <div className="header-actions">
            <div className="notification-bell">
              <span>🔔</span>
              <span className="notification-badge">5</span>
            </div>
            <div className="user-menu">
              <div className="avatar">AD</div>
              <button 
                    className="btn btn-outline ml-2" 
                    onClick={handleLogout}
                    style={{ marginLeft: '8px' }}
                >
                    Logout
                </button>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="content-area">{renderSection()}</main>
      </div>
    </div>
  )
}

export default AdminDashboard
