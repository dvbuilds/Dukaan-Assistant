import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('dukaan_token') || '');
  const [store, setStore] = useState(JSON.parse(localStorage.getItem('dukaan_store')) || null);
  const [view, setView] = useState(localStorage.getItem('dukaan_token') ? 'dashboard' : 'login');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [isPublicChat, setIsPublicChat] = useState(false);
  const [publicSlug, setPublicSlug] = useState('');
  const [publicStore, setPublicStore] = useState(null);
  const [publicError, setPublicError] = useState('');
  const [publicLoading, setPublicLoading] = useState(false);
  const [publicQuestion, setPublicQuestion] = useState('');
  const [publicLanguage, setPublicLanguage] = useState('English');
  const [publicReply, setPublicReply] = useState('');
  const [publicGenerating, setPublicGenerating] = useState(false);

  const [signupForm, setSignupForm] = useState({ storeName: '', ownerEmail: '', password: '' });
  const [loginForm, setLoginForm] = useState({ ownerEmail: '', password: '' });

  const [shopInfo, setShopInfo] = useState({ storeName: '', storeHours: '', deliveryPolicy: '', slug: '' });
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  
  const [dashboardTab, setDashboardTab] = useState('ai');
  const [productSearch, setProductSearch] = useState('');

  const [newProduct, setNewProduct] = useState({ name: '', price: '', status: 'In Stock' });

  const [invoiceCustomer, setInvoiceCustomer] = useState({ name: '', contact: '' });
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [invoiceProductSelect, setInvoiceProductSelect] = useState('');
  const [invoiceQty, setInvoiceQty] = useState(1);
  const [currentPrintInvoice, setCurrentPrintInvoice] = useState(null);
  const [invoiceSubmitting, setInvoiceSubmitting] = useState(false);

  const [question, setQuestion] = useState('');
  const [language, setLanguage] = useState('English');
  const [generatedReply, setGeneratedReply] = useState('');
  const [history, setHistory] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/chat/')) {
      const slug = path.split('/chat/')[1];
      if (slug) {
        setIsPublicChat(true);
        setPublicSlug(slug);
        fetchPublicStore(slug);
      }
    }
  }, []);

  useEffect(() => {
    if (token && !isPublicChat) {
      fetchShopInfo();
      fetchProducts();
      fetchInvoices();
      fetchHistory();
    }
  }, [token, isPublicChat]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  const handleApiResponse = async (res) => {
    if (res.status === 401) {
      handleLogout();
      throw new Error('Session expired. Please log in again.');
    }
    return res;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!signupForm.storeName || !signupForm.ownerEmail || !signupForm.password) {
      setAuthError('All fields are required.');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create account.');

      localStorage.setItem('dukaan_token', data.token);
      localStorage.setItem('dukaan_store', JSON.stringify(data.store));
      setToken(data.token);
      setStore(data.store);
      setView('dashboard');
      showToast('Store account created successfully!');
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.ownerEmail || !loginForm.password) {
      setAuthError('Email and password are required.');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed.');

      localStorage.setItem('dukaan_token', data.token);
      localStorage.setItem('dukaan_store', JSON.stringify(data.store));
      setToken(data.token);
      setStore(data.store);
      setView('dashboard');
      showToast(`Welcome back, ${data.store.storeName}!`);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('dukaan_token');
    localStorage.removeItem('dukaan_store');
    setToken('');
    setStore(null);
    setView('login');
    setLoginForm({ ownerEmail: '', password: '' });
    setSignupForm({ storeName: '', ownerEmail: '', password: '' });
    setProducts([]);
    setInvoices([]);
    setHistory([]);
    setShopInfo({ storeName: '', storeHours: '', deliveryPolicy: '', slug: '' });
  };

  const fetchShopInfo = async () => {
    try {
      const res = await fetch('/api/shop-info', { headers: getAuthHeaders() });
      await handleApiResponse(res);
      const data = await res.json();
      setShopInfo({
        storeName: data.storeName,
        storeHours: data.storeHours,
        deliveryPolicy: data.deliveryPolicy,
        slug: data.slug
      });
      setApiKeyConfigured(data.apiKeyConfigured);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not load shop info.');
    }
  };

  const saveShopInfo = async (infoToSave = shopInfo) => {
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/shop-info', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(infoToSave)
      });
      await handleApiResponse(res);
      const result = await res.json();
      showToast('Shop data saved successfully!');
      if (result.data) {
        setShopInfo(result.data);
      }
      setApiKeyConfigured(result.apiKeyConfigured);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save shop info.');
    } finally {
      setIsSaving(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products', { headers: getAuthHeaders() });
      await handleApiResponse(res);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name.trim() || !newProduct.price.trim()) {
      showToast('Please enter both name and price.');
      return;
    }
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          productName: newProduct.name.trim(),
          price: newProduct.price.trim(),
          stockStatus: newProduct.status
        })
      });
      await handleApiResponse(res);
      const data = await res.json();
      setProducts(prev => [...prev, data]);
      setNewProduct({ name: '', price: '', status: 'In Stock' });
      showToast('Product added successfully!');
    } catch (err) {
      setError(err.message || 'Failed to add product.');
    }
  };

  const handleUpdateProduct = async (id, updatedFields) => {
    try {
      const productToUpdate = products.find(p => p._id === id);
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          productName: updatedFields.productName !== undefined ? updatedFields.productName : productToUpdate.productName,
          price: updatedFields.price !== undefined ? updatedFields.price : productToUpdate.price,
          stockStatus: updatedFields.stockStatus !== undefined ? updatedFields.stockStatus : productToUpdate.stockStatus
        })
      });
      await handleApiResponse(res);
      const data = await res.json();
      
      setProducts(prev => prev.map(p => p._id === id ? data : p));
      showToast('Product updated.');
    } catch (err) {
      setError(err.message || 'Failed to update product.');
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      await handleApiResponse(res);
      setProducts(prev => prev.filter(p => p._id !== id));
      showToast('Product removed.');
    } catch (err) {
      setError(err.message || 'Failed to delete product.');
    }
  };

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoices', { headers: getAuthHeaders() });
      await handleApiResponse(res);
      const data = await res.json();
      setInvoices(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddInvoiceItem = (e) => {
    e.preventDefault();
    if (!invoiceProductSelect) return;
    const selectedProd = products.find(p => p._id === invoiceProductSelect);
    if (!selectedProd) return;

    const existingIdx = invoiceItems.findIndex(item => item.productName === selectedProd.productName);
    const qty = parseInt(invoiceQty) || 1;

    if (existingIdx > -1) {
      const newItems = [...invoiceItems];
      const newQty = newItems[existingIdx].quantity + qty;
      const subtotal = newQty * parseFloat(selectedProd.price);
      newItems[existingIdx] = {
        ...newItems[existingIdx],
        quantity: newQty,
        subtotal
      };
      setInvoiceItems(newItems);
    } else {
      const subtotal = qty * parseFloat(selectedProd.price);
      setInvoiceItems(prev => [
        ...prev,
        {
          id: selectedProd._id,
          productName: selectedProd.productName,
          quantity: qty,
          price: selectedProd.price,
          subtotal
        }
      ]);
    }

    setInvoiceQty(1);
    setInvoiceProductSelect('');
  };

  const handleRemoveInvoiceItem = (productName) => {
    setInvoiceItems(prev => prev.filter(item => item.productName !== productName));
  };

  const calculateInvoiceTotal = () => {
    return invoiceItems.reduce((acc, item) => acc + item.subtotal, 0);
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!invoiceCustomer.name.trim()) {
      showToast("Customer name is required.");
      return;
    }
    if (invoiceItems.length === 0) {
      showToast("Please add at least one product to the invoice.");
      return;
    }

    setInvoiceSubmitting(true);
    try {
      const payload = {
        customerName: invoiceCustomer.name.trim(),
        customerContact: invoiceCustomer.contact.trim(),
        items: invoiceItems.map(item => ({
          productName: item.productName,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.subtotal
        })),
        totalAmount: calculateInvoiceTotal()
      };

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });
      await handleApiResponse(res);
      const data = await res.json();

      setInvoices(prev => [data, ...prev]);
      setCurrentPrintInvoice(data);
      setInvoiceCustomer({ name: '', contact: '' });
      setInvoiceItems([]);
      showToast('Invoice generated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to create invoice.');
    } finally {
      setInvoiceSubmitting(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history', { headers: getAuthHeaders() });
      await handleApiResponse(res);
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  };

  const generateReply = async () => {
    if (!question.trim()) {
      showToast('Please enter a customer question.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedReply('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          question: question.trim(),
          language
        })
      });
      await handleApiResponse(res);
      const data = await res.json();

      setGeneratedReply(data.reply);
      fetchHistory();
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while generating the reply.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    setError(null);
    try {
      const res = await fetch('/api/history', {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      await handleApiResponse(res);
      setHistory([]);
      showToast('Query history cleared from database.');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to delete logs.');
    }
  };

  const copyToClipboard = () => {
    if (!generatedReply) return;
    navigator.clipboard.writeText(generatedReply);
    showToast('Reply copied to clipboard!');
  };

  const filteredProducts = products.filter(p => 
    p.productName.toLowerCase().includes(productSearch.toLowerCase())
  );

  const fetchPublicStore = async (slug) => {
    setPublicLoading(true);
    setPublicError('');
    try {
      const res = await fetch(`/api/public/store/${slug}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to load store details.');
      }
      const data = await res.json();
      setPublicStore(data);
    } catch (err) {
      console.error(err);
      setPublicError(err.message || 'Store not found.');
    } finally {
      setPublicLoading(false);
    }
  };

  const handlePublicAsk = async (e) => {
    e.preventDefault();
    if (!publicQuestion.trim()) return;

    setPublicGenerating(true);
    setPublicReply('');
    setPublicError('');

    try {
      const res = await fetch(`/api/public/${publicSlug}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: publicQuestion.trim(),
          language: publicLanguage
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate reply.');
      }

      setPublicReply(data.reply);
    } catch (err) {
      console.error(err);
      setPublicError(err.message || 'An error occurred.');
    } finally {
      setPublicGenerating(false);
    }
  };

  const handleShopInfoChange = (field, value) => {
    setShopInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isPublicChat) {
    return (
      <div className="public-chat-container">
        {toastMessage && <div className="toast">{toastMessage}</div>}
        
        <div className="app-container" style={{ minHeight: 'auto', paddingBottom: 0 }}>
          <header className="app-header">
            <div className="app-title-group">
              <h1 className="font-serif-title">Dukaan Assistant</h1>
              <p>Customer Chat Portal</p>
            </div>
          </header>
        </div>

        <div className="auth-main">
          {publicLoading && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              <span className="brand-loader" style={{ width: '24px', height: '24px' }}></span>
              <p style={{ marginTop: '12px', fontWeight: '500' }}>Loading store details...</p>
            </div>
          )}

          {publicError && (
            <div className="auth-card" style={{ textAlign: 'center' }}>
              <div className="error-message" style={{ marginBottom: 0 }}>
                {publicError}
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '12px' }}>
                Please check the web URL or contact the shop owner.
              </p>
            </div>
          )}

          {publicStore && (
            <div className="auth-card" style={{ maxWidth: '600px', width: '90%' }}>
              <div className="public-store-header">
                <h2>{publicStore.storeName}</h2>
                <span className="helper-text" style={{ marginTop: '4px' }}>
                  Ask {publicStore.storeName} anything — stock, prices, hours, delivery. Powered by AI, answered instantly.
                </span>
                <div className="public-store-meta">
                  <span className="meta-item"><strong>Hours:</strong> {publicStore.storeHours || 'N/A'}</span>
                  <span className="meta-item"><strong>Delivery Policy:</strong> {publicStore.deliveryPolicy || 'N/A'}</span>
                </div>
              </div>

              <form onSubmit={handlePublicAsk} className="auth-form" style={{ gap: '16px' }}>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label htmlFor="pub-question-box">Ask the Assistant a Question</label>
                    <div className="language-selector">
                      <select 
                        aria-label="Public chat language"
                        className="select-field"
                        style={{ padding: '4px 20px 4px 6px', fontSize: '0.75rem' }}
                        value={publicLanguage}
                        onChange={(e) => setPublicLanguage(e.target.value)}
                      >
                        <option value="English">English</option>
                        <option value="Bengali">Bengali</option>
                        <option value="Hindi">Hindi</option>
                      </select>
                    </div>
                  </div>
                  <textarea 
                    id="pub-question-box"
                    className="textarea-field"
                    rows="4"
                    required
                    placeholder="e.g. Is home delivery free? Do you have Atta in stock?"
                    value={publicQuestion}
                    onChange={(e) => setPublicQuestion(e.target.value)}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={publicGenerating || !publicQuestion.trim()}
                >
                  {publicGenerating ? (
                    <>
                      <span className="brand-loader"></span> Generating Reply...
                    </>
                  ) : 'Ask Assistant'}
                </button>
              </form>

              {publicReply && (
                <div className="draft-container" style={{ marginTop: '10px' }}>
                  <div className="draft-header">
                    <span className="draft-label">Assistant Response ({publicLanguage})</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(publicReply);
                        showToast('Copied to clipboard!');
                      }}
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    >
                      Copy
                    </button>
                  </div>
                  <div className="draft-content">
                    {publicReply}
                  </div>
                </div>
              )}

              <div className="public-chat-footer">
                Powered by Dukaan Assistant
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (view === 'login') {
    return (
      <div className="auth-container">
        {toastMessage && <div className="toast">{toastMessage}</div>}
        
        <div className="app-container" style={{ minHeight: 'auto', paddingBottom: 0 }}>
          <header className="app-header">
            <div className="app-title-group">
              <h1 className="font-serif-title">Dukaan Assistant</h1>
              <p>Draft precise replies for your customers using your own store facts</p>
            </div>
          </header>
        </div>

        <div className="auth-main">
          <div className="auth-card">
            <div className="auth-header">
              <h2>Login to Dukaan Assistant</h2>
              <p>Access your store dashboard</p>
            </div>
            {authError && <div className="error-message">{authError}</div>}
            <form onSubmit={handleLogin} className="auth-form">
              <div className="form-group">
                <label htmlFor="login-email">Email Address</label>
                <input 
                  id="login-email"
                  type="email" 
                  className="input-field" 
                  placeholder="owner@yourstore.com"
                  value={loginForm.ownerEmail}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, ownerEmail: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <input 
                  id="login-password"
                  type="password" 
                  className="input-field" 
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={authLoading}>
                {authLoading ? 'Logging in...' : 'Log In'}
              </button>
            </form>
            <div className="auth-footer">
              Don't have an account? <button onClick={() => { setView('signup'); setAuthError(''); }} className="link-btn">Sign Up</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'signup') {
    return (
      <div className="auth-container">
        {toastMessage && <div className="toast">{toastMessage}</div>}
        
        <div className="app-container" style={{ minHeight: 'auto', paddingBottom: 0 }}>
          <header className="app-header">
            <div className="app-title-group">
              <h1 className="font-serif-title">Dukaan Assistant</h1>
              <p>Draft precise replies for your customers using your own store facts</p>
            </div>
          </header>
        </div>

        <div className="auth-main">
          <div className="auth-card">
            <div className="auth-header">
              <h2>Create Store Account</h2>
              <p>Set up Dukaan Assistant for your shop</p>
            </div>
            {authError && <div className="error-message">{authError}</div>}
            <form onSubmit={handleSignup} className="auth-form">
              <div className="form-group">
                <label htmlFor="signup-store-name">Store Name</label>
                <input 
                  id="signup-store-name"
                  type="text" 
                  className="input-field" 
                  placeholder="Gupta General Store"
                  value={signupForm.storeName}
                  onChange={(e) => setSignupForm(prev => ({ ...prev, storeName: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="signup-email">Owner Email</label>
                <input 
                  id="signup-email"
                  type="email" 
                  className="input-field" 
                  placeholder="owner@yourstore.com"
                  value={signupForm.ownerEmail}
                  onChange={(e) => setSignupForm(prev => ({ ...prev, ownerEmail: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="signup-password">Password</label>
                <input 
                  id="signup-password"
                  type="password" 
                  className="input-field" 
                  placeholder="••••••••"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={authLoading}>
                {authLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
            <div className="auth-footer">
              Already have an account? <button onClick={() => { setView('login'); setAuthError(''); }} className="link-btn">Log In</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {toastMessage && <div className="toast">{toastMessage}</div>}

      <header className="app-header">
        <div className="app-title-group">
          <h1>Dukaan Assistant</h1>
          <p>Logged in as <strong style={{ color: 'var(--text-primary)' }}>{store?.storeName}</strong></p>
        </div>
        <div className="header-actions">
          {apiKeyConfigured !== null && (
            <div className={`api-key-badge ${apiKeyConfigured ? 'configured' : 'missing'}`}>
              <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                <circle cx="4" cy="4" r="4" />
              </svg>
              {apiKeyConfigured ? 'AI Service Online' : 'Set GEMINI_API_KEY in backend/.env'}
            </div>
          )}
          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8125rem' }}>
            Log Out
          </button>
        </div>
      </header>

      {error && (
        <div className="error-message">
          <strong>Notice:</strong> {error}
          <button className="clear-btn" onClick={() => setError(null)} style={{ marginLeft: '10px', float: 'right' }}>Dismiss</button>
        </div>
      )}

      <main className="dashboard-grid">
        
        <section className="panel">
          <div className="panel-header">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <h2>My Shop Info</h2>
              <span className="helper-text">This is what your AI helper knows — keep it accurate and up to date.</span>
            </div>
            <button 
              onClick={() => saveShopInfo()} 
              disabled={isSaving} 
              className="btn btn-primary"
            >
              {isSaving ? (
                <>
                  <span className="brand-loader"></span> Saving...
                </>
              ) : 'Save Shop Facts'}
            </button>
          </div>

          <div className="hero-banner left-hero">
            <div className="decorator-circle circle-1"></div>
            <div className="decorator-circle circle-2"></div>
            <div className="hero-banner-content">
              <div className="hero-badge green-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                </svg>
              </div>
              <div className="hero-text">
                <h3>Your shop's data brain</h3>
                <p>Fill in your store details and inventory below. Your AI assistant reads this data in real-time to answer customer questions.</p>
              </div>
            </div>
            <div className="hero-tags">
              <span className="tag-pill tag-yellow">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Store Details
              </span>
              <span className="tag-pill tag-coral">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}>
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                Products List
              </span>
              <span className="tag-pill tag-purple">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}>
                  <path d="M23 4v6h-6M1 20v-6h6"></path>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                </svg>
                Active Sync
              </span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="store-name-input">Store Name</label>
            <input 
              id="store-name-input"
              type="text" 
              className="input-field"
              value={shopInfo.storeName}
              onChange={(e) => handleShopInfoChange('storeName', e.target.value)}
              placeholder="e.g. Gupta General Store"
            />
          </div>

          <div className="form-group">
            <label htmlFor="store-hours-input">Store Hours</label>
            <input 
              id="store-hours-input"
              type="text" 
              className="input-field"
              value={shopInfo.storeHours}
              onChange={(e) => handleShopInfoChange('storeHours', e.target.value)}
              placeholder="e.g. 9:00 AM - 9:00 PM, Closed on Sundays"
            />
          </div>

          <div className="form-group">
            <label htmlFor="delivery-policy-input">Delivery Policy & Rules</label>
            <textarea 
              id="delivery-policy-input"
              className="textarea-field"
              value={shopInfo.deliveryPolicy}
              onChange={(e) => handleShopInfoChange('deliveryPolicy', e.target.value)}
              placeholder="e.g. Free delivery within 2km on orders above Rs. 500."
            />
          </div>

          <div className="inventory-section">
            <div className="inventory-header" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <h3>Products & Inventory</h3>
                <span className="helper-text">The AI will only mention items listed here.</span>
              </div>
              <span className="num-val" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', alignSelf: 'flex-start' }}>
                {products.length} items total
              </span>
            </div>

            <div className="search-bar-container">
              <input 
                aria-label="Search products by name"
                type="text"
                className="input-field search-input"
                placeholder="Search products by name..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </div>

            <div className="inventory-table-container">
              {filteredProducts.length > 0 ? (
                <table className="inventory-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th style={{ width: '90px' }}>Price (₹)</th>
                      <th style={{ width: '120px' }}>Stock Status</th>
                      <th style={{ width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((item, idx) => (
                      <tr key={item._id}>
                        <td>
                          <input 
                            aria-label={`Product name for item ${idx + 1}`}
                            type="text"
                            className="input-cell"
                            value={item.productName}
                            onChange={(e) => {
                              const value = e.target.value;
                              setProducts(prev => prev.map(p => p._id === item._id ? { ...p, productName: value } : p));
                            }}
                            onBlur={(e) => handleUpdateProduct(item._id, { productName: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleUpdateProduct(item._id, { productName: e.target.value });
                            }}
                          />
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>₹</span>
                            <input 
                              aria-label={`Price for item ${idx + 1}`}
                              type="text"
                              className="input-cell num-val"
                              style={{ width: '50px', textAlign: 'right' }}
                              value={item.price}
                              onChange={(e) => {
                                const value = e.target.value;
                                setProducts(prev => prev.map(p => p._id === item._id ? { ...p, price: value } : p));
                              }}
                              onBlur={(e) => handleUpdateProduct(item._id, { price: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleUpdateProduct(item._id, { price: e.target.value });
                              }}
                            />
                          </div>
                        </td>
                        <td>
                          <select 
                            aria-label={`Stock status for item ${idx + 1}`}
                            className={`status-select ${item.stockStatus === 'In Stock' ? 'in-stock' : 'out-of-stock'}`}
                            value={item.stockStatus}
                            onChange={(e) => handleUpdateProduct(item._id, { stockStatus: e.target.value })}
                          >
                            <option value="In Stock">In Stock</option>
                            <option value="Out of Stock">Out of Stock</option>
                          </select>
                        </td>
                        <td>
                          <button 
                            onClick={() => handleDeleteProduct(item._id)}
                            className="btn-danger-icon"
                            title="Delete Item"
                            aria-label={`Delete item ${item.productName}`}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                  {products.length === 0 ? 'No items in inventory. Add one below.' : 'No matching products found.'}
                </div>
              )}
            </div>

            <form onSubmit={handleAddProduct} className="add-item-form">
              <input 
                aria-label="New product name"
                type="text"
                className="input-field"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                required
              />
              <input 
                aria-label="New product price"
                type="text"
                className="input-field num-val"
                placeholder="Price"
                value={newProduct.price}
                onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                required
              />
              <select 
                aria-label="New product stock status"
                className="select-field"
                value={newProduct.status}
                onChange={(e) => setNewProduct(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="In Stock">In Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
              <button 
                type="submit" 
                className="btn btn-secondary" 
                style={{ padding: '6px 12px', fontSize: '0.8125rem' }}
              >
                Add Product
              </button>
            </form>
          </div>

          <div className="share-section">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <h3>Share Your Assistant</h3>
              <span className="helper-text">Share this link with customers so they can ask questions directly — no login needed for them.</span>
            </div>
            <div className="share-link-box" style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <input 
                aria-label="Public chat link"
                type="text" 
                className="input-field" 
                readOnly
                value={`${window.location.origin}/chat/${shopInfo.slug || store?.slug || ''}`}
              />
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/chat/${shopInfo.slug || store?.slug || ''}`);
                  showToast('Assistant link copied to clipboard!');
                }}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8125rem' }}
              >
                Copy
              </button>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="hero-banner">
            <div className="decorator-circle circle-1"></div>
            <div className="decorator-circle circle-2"></div>
            <div className="hero-banner-content">
              <div className="hero-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </div>
              <div className="hero-text">
                <h3>Meet your shop's AI helper</h3>
                <p>Ask it anything a customer might ask. It only answers using facts you gave it below — never a guess.</p>
              </div>
            </div>
            <div className="hero-tags">
              <span className="tag-pill tag-teal">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}>
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                  <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
                Real stock & prices
              </span>
              <span className="tag-pill tag-purple">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}>
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                3 languages
              </span>
              <span className="tag-pill tag-pink">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}>
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
                Instant replies
              </span>
            </div>
          </div>

          <div className="tab-navigation">
            <button 
              className={`tab-btn ${dashboardTab === 'ai' ? 'active' : ''}`}
              onClick={() => setDashboardTab('ai')}
            >
              AI Reply Assistant
            </button>
            <button 
              className={`tab-btn ${dashboardTab === 'invoice' ? 'active' : ''}`}
              onClick={() => setDashboardTab('invoice')}
            >
              Invoice Generator
            </button>
          </div>

          {dashboardTab === 'ai' && (
            <div className="tab-content">
              <div className="panel-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                <h2>Customer Reply Generator</h2>
                <div className="actions-row">
                  <div className="language-selector">
                    <label htmlFor="lang-select">Language</label>
                    <select 
                      id="lang-select"
                      className="select-field"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <option value="English">English</option>
                      <option value="Bengali">Bengali</option>
                      <option value="Hindi">Hindi</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '12px' }}>
                <label htmlFor="customer-query-box">Paste Customer Question</label>
                <textarea 
                  id="customer-query-box"
                  className="textarea-field"
                  rows="4"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. Do you have Tata Salt in stock? Is free delivery available?"
                />
              </div>

              <button 
                onClick={generateReply} 
                disabled={isLoading || !question.trim()}
                className="btn btn-primary"
                style={{ width: '100%', padding: '10px' }}
              >
                {isLoading ? (
                  <>
                    <span className="brand-loader"></span> Generating Reply...
                  </>
                ) : 'Generate Reply'}
              </button>

              <div className="draft-container" style={{ marginTop: '16px' }}>
                <div className="draft-header">
                  <span className="draft-label">Suggested Reply ({language})</span>
                  {generatedReply && (
                    <button 
                      onClick={copyToClipboard}
                      className="btn btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    >
                      Copy to Clipboard
                    </button>
                  )}
                </div>
                <div className="draft-content">
                  {generatedReply ? (
                    generatedReply
                  ) : (
                    <span className="draft-placeholder">
                      Your generated reply will appear here...
                    </span>
                  )}
                </div>
              </div>

              <div className="history-section">
                <div className="history-header">
                  <h3>Reply History (Last 20)</h3>
                  {history.length > 0 && (
                    <button onClick={clearHistory} className="clear-btn">
                      Clear History
                    </button>
                  )}
                </div>

                <div className="history-list">
                  {history.length > 0 ? (
                    history.map(item => (
                      <div key={item._id || item.id} className="history-item">
                        <div className="history-question" style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Q: {item.question} <span style={{ color: 'var(--text-muted)' }}>({item.language})</span></span>
                          {item.source === 'public' && <span className="public-source-badge">Public Question</span>}
                        </div>
                        <div className="history-reply">
                          {item.reply}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem', padding: '10px 0' }}>
                      No draft replies saved in history yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {dashboardTab === 'invoice' && (
            <div className="tab-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {currentPrintInvoice && (
                <div className="invoice-overlay">
                  <div className="invoice-print-card">
                    <div className="invoice-print-header">
                      <h3>{store?.storeName}</h3>
                      <p className="subtitle">Sales Invoice</p>
                    </div>
                    
                    <div className="invoice-print-meta">
                      <div>
                        <strong>Customer:</strong> {currentPrintInvoice.customerName}<br/>
                        {currentPrintInvoice.customerContact && <><strong>Contact:</strong> <span className="num-val">{currentPrintInvoice.customerContact}</span><br/></>}
                        <strong>Date:</strong> <span className="num-val">{new Date(currentPrintInvoice.createdAt).toLocaleString()}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <strong>Invoice ID:</strong> <span className="num-val">{currentPrintInvoice._id.slice(-8).toUpperCase()}</span><br/>
                        <strong>Hours:</strong> {shopInfo.storeHours || 'N/A'}
                      </div>
                    </div>

                    <table className="invoice-print-table">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th style={{ textAlign: 'center', width: '60px' }}>Qty</th>
                          <th style={{ textAlign: 'right', width: '100px' }}>Rate (₹)</th>
                          <th style={{ textAlign: 'right', width: '100px' }}>Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentPrintInvoice.items.map((item, index) => (
                          <tr key={index}>
                            <td>{item.productName}</td>
                            <td className="num-val" style={{ textAlign: 'center' }}>{item.quantity}</td>
                            <td className="num-val" style={{ textAlign: 'right' }}>{item.price}</td>
                            <td className="num-val" style={{ textAlign: 'right' }}>{item.subtotal}</td>
                          </tr>
                        ))}
                        <tr className="total-row">
                          <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total Amount:</td>
                          <td className="num-val" style={{ textAlign: 'right', fontWeight: 'bold' }}>₹{currentPrintInvoice.totalAmount}</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="invoice-print-footer">
                      <p>Thank you for shopping with us!</p>
                      <p className="policy">{shopInfo.deliveryPolicy}</p>
                    </div>

                    <div className="invoice-print-actions">
                      <button onClick={() => window.print()} className="btn btn-primary">
                        Print Invoice
                      </button>
                      <button onClick={() => setCurrentPrintInvoice(null)} className="btn btn-secondary">
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}

               <div className="invoice-builder">
                <div className="panel-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <h2>Create Customer Invoice</h2>
                    <span className="helper-text">Create a quick itemized bill for any customer order.</span>
                  </div>
                </div>

                <form onSubmit={handleCreateInvoice} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label htmlFor="customer-name-input">Customer Name *</label>
                      <input 
                        id="customer-name-input"
                        type="text"
                        className="input-field"
                        placeholder="e.g. Ramesh Kumar"
                        value={invoiceCustomer.name}
                        onChange={(e) => setInvoiceCustomer(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="customer-contact-input">Contact Number (Optional)</label>
                      <input 
                        id="customer-contact-input"
                        type="text"
                        className="input-field num-val"
                        placeholder="e.g. 9876543210"
                        value={invoiceCustomer.contact}
                        onChange={(e) => setInvoiceCustomer(prev => ({ ...prev, contact: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="add-invoice-item-box">
                    <div className="form-group" style={{ flex: 2 }}>
                      <label htmlFor="product-select">Select Product</label>
                      <select 
                        id="product-select"
                        className="select-field"
                        value={invoiceProductSelect}
                        onChange={(e) => setInvoiceProductSelect(e.target.value)}
                      >
                        <option value="">-- Choose Product --</option>
                        {products.map(p => (
                          <option key={p._id} value={p._id} disabled={p.stockStatus === 'Out of Stock'}>
                            {p.productName} (₹{p.price}) {p.stockStatus === 'Out of Stock' ? '- [OUT OF STOCK]' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group" style={{ width: '80px' }}>
                      <label htmlFor="qty-input">Qty</label>
                      <input 
                        id="qty-input"
                        type="number"
                        min="1"
                        className="input-field num-val"
                        value={invoiceQty}
                        onChange={(e) => setInvoiceQty(parseInt(e.target.value) || 1)}
                      />
                    </div>

                    <button 
                      type="button" 
                      onClick={handleAddInvoiceItem} 
                      className="btn btn-secondary" 
                      style={{ height: '38px', alignSelf: 'flex-end' }}
                      disabled={!invoiceProductSelect}
                    >
                      Add to Invoice
                    </button>
                  </div>

                  <div className="invoice-draft-items">
                    <h4>Invoice Items</h4>
                    <table className="invoice-draft-table">
                      <thead>
                        <tr>
                          <th>Item Name</th>
                          <th style={{ width: '60px', textAlign: 'center' }}>Qty</th>
                          <th style={{ width: '80px', textAlign: 'right' }}>Price</th>
                          <th style={{ width: '100px', textAlign: 'right' }}>Subtotal</th>
                          <th style={{ width: '40px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoiceItems.length > 0 ? (
                          invoiceItems.map(item => (
                            <tr key={item.id}>
                              <td>{item.productName}</td>
                              <td className="num-val" style={{ textAlign: 'center' }}>{item.quantity}</td>
                              <td className="num-val" style={{ textAlign: 'right' }}>₹{item.price}</td>
                              <td className="num-val" style={{ textAlign: 'right' }}>₹{item.subtotal}</td>
                              <td style={{ textAlign: 'center' }}>
                                <button 
                                  type="button" 
                                  onClick={() => handleRemoveInvoiceItem(item.productName)}
                                  className="btn-danger-icon"
                                  title="Remove item"
                                  aria-label={`Remove item ${item.productName}`}
                                >
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem', padding: '16px' }}>
                              No items added to invoice draft.
                            </td>
                          </tr>
                        )}
                        {invoiceItems.length > 0 && (
                          <tr className="total-row">
                            <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold' }}>Total Amount:</td>
                            <td colSpan="2" className="num-val" style={{ textAlign: 'left', fontWeight: 'bold', paddingLeft: '20px' }}>₹{calculateInvoiceTotal()}</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '10px' }}
                    disabled={invoiceSubmitting || invoiceItems.length === 0}
                  >
                    {invoiceSubmitting ? 'Creating Invoice...' : 'Create Invoice'}
                  </button>
                </form>
              </div>

              <div className="history-section" style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '20px' }}>
                <div className="history-header">
                  <h3>Invoice History</h3>
                  <span className="num-val" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {invoices.length} invoices saved
                  </span>
                </div>

                <div className="invoice-history-list">
                  {invoices.length > 0 ? (
                    invoices.map(inv => (
                      <div 
                        key={inv._id} 
                        className="invoice-history-item"
                        onClick={() => setCurrentPrintInvoice(inv)}
                        title="Click to view and print"
                      >
                        <div className="invoice-history-meta">
                          <span className="inv-cust-name">{inv.customerName}</span>
                          <span className="inv-date">{new Date(inv.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="invoice-history-details">
                          <span>{inv.items.length} items</span>
                          <strong className="inv-total">₹{inv.totalAmount}</strong>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem', padding: '20px 0' }}>
                      No invoices created yet.
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}
        </section>

      </main>
    </div>
  );
}

export default App;
