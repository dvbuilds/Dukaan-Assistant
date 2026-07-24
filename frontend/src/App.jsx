import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // Shop Info state
  const [shopInfo, setShopInfo] = useState({
    storeName: '',
    storeHours: '',
    deliveryPolicy: '',
    items: []
  });

  // Form state for adding a new item
  const [newItem, setNewItem] = useState({
    name: '',
    price: '',
    status: 'In Stock'
  });

  // Assistant state
  const [question, setQuestion] = useState('');
  const [language, setLanguage] = useState('English');
  const [generatedReply, setGeneratedReply] = useState('');
  const [history, setHistory] = useState([]);

  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [apiKeyConfigured, setApiKeyConfigured] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Load shop info on mount
  useEffect(() => {
    fetchShopInfo();
  }, []);

  // Show toast utility
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const fetchShopInfo = async () => {
    try {
      const res = await fetch('/api/shop-info');
      if (!res.ok) throw new Error('Failed to load shop info.');
      const data = await res.json();

      // If backend sends nested format with apiKey status
      if (data.storeName !== undefined) {
        setShopInfo(data);
      } else if (data.data) {
        setShopInfo(data.data);
      }

      if (data.apiKeyConfigured !== undefined) {
        setApiKeyConfigured(data.apiKeyConfigured);
      }
    } catch (err) {
      console.error(err);
      setError('Could not connect to the backend server. Make sure it is running.');
    }
  };

  const handleShopInfoChange = (field, value) => {
    setShopInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...shopInfo.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    };
    setShopInfo(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const handleDeleteItem = (id) => {
    setShopInfo(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.name.trim() || !newItem.price.trim()) {
      showToast('Please enter both name and price.');
      return;
    }

    const itemToAdd = {
      id: Date.now().toString(),
      name: newItem.name.trim(),
      price: newItem.price.trim(),
      status: newItem.status
    };

    setShopInfo(prev => ({
      ...prev,
      items: [...prev.items, itemToAdd]
    }));

    // Reset add item form
    setNewItem({
      name: '',
      price: '',
      status: 'In Stock'
    });
  };

  const saveShopInfo = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/shop-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(shopInfo)
      });

      if (!res.ok) throw new Error('Failed to save shop info.');
      const result = await res.json();

      showToast('Shop data saved successfully!');

      // Update local state just in case
      if (result.data) {
        setShopInfo(result.data);
      }

      // Let's recheck backend API key status as well
      if (result.apiKeyConfigured !== undefined) {
        setApiKeyConfigured(result.apiKeyConfigured);
      } else {
        // Fallback: check config status again
        fetchShopInfo();
      }
    } catch (err) {
      console.error(err);
      setError('Failed to save shop info to backend.');
    } finally {
      setIsSaving(false);
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.trim(),
          shopInfo,
          language
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.details || data.error || 'Failed to generate reply.');
      }

      setGeneratedReply(data.reply);

      // Add to session history
      setHistory(prev => [
        {
          id: Date.now().toString(),
          question: question.trim(),
          reply: data.reply,
          language
        },
        ...prev
      ]);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while generating the reply.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedReply) return;
    navigator.clipboard.writeText(generatedReply);
    showToast('Reply copied to clipboard!');
  };

  const clearHistory = () => {
    setHistory([]);
    showToast('History cleared.');
  };

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toastMessage && <div className="toast">{toastMessage}</div>}

      {/* Header */}
      <header className="app-header">
        <div className="app-title-group">
          <div className="app-mark" aria-hidden="true">D</div>
          <div>
            <h1>Dukaan Assistant</h1>
            <p>Draft precise replies for your customers using your own store facts</p>
          </div>
        </div>
        <div>
          {apiKeyConfigured !== null && (
            <div className={`api-key-badge ${apiKeyConfigured ? 'configured' : 'missing'}`}>
              <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
                <circle cx="4" cy="4" r="4" />
              </svg>
              {apiKeyConfigured ? 'AI Service Online' : 'Set GEMINI_API_KEY in backend/.env'}
            </div>
          )}
        </div>
      </header>

      {/* Global Error Display */}
      {error && (
        <div className="error-message">
          <strong>Notice:</strong> {error}
        </div>
      )}

      {/* Main Grid */}
      <main className="dashboard-grid">

        {/* Left Column: Shop Info Form */}
        <section className="panel">
          <div className="panel-header">
            <h2>My Shop Info</h2>
            <button
              onClick={saveShopInfo}
              disabled={isSaving}
              className="btn btn-primary"
            >
              {isSaving ? (
                <>
                  <span className="spinner"></span> Saving...
                </>
              ) : 'Save Shop Info'}
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="store-name">Store Name</label>
            <input
              id="store-name"
              type="text"
              className="input-field"
              value={shopInfo.storeName}
              onChange={(e) => handleShopInfoChange('storeName', e.target.value)}
              placeholder="e.g. Gupta General Store"
            />
          </div>

          <div className="form-group">
            <label htmlFor="store-hours">Store Hours</label>
            <input
              id="store-hours"
              type="text"
              className="input-field"
              value={shopInfo.storeHours}
              onChange={(e) => handleShopInfoChange('storeHours', e.target.value)}
              placeholder="e.g. 9:00 AM - 9:00 PM, Closed on Sundays"
            />
          </div>

          <div className="form-group">
            <label htmlFor="delivery-policy">Delivery Policy & Rules</label>
            <textarea
              id="delivery-policy"
              className="textarea-field"
              value={shopInfo.deliveryPolicy}
              onChange={(e) => handleShopInfoChange('deliveryPolicy', e.target.value)}
              placeholder="e.g. Free delivery within 2km on orders above Rs. 500."
            />
          </div>

          {/* Product List Section */}
          <div className="inventory-section">
            <div className="inventory-header">
              <h3>Products, Prices & Stock</h3>
              <span style={{ color: 'var(--text-secondary)' }}>
                {shopInfo.items.length} items listed
              </span>
            </div>

            <div className="inventory-table-container">
              {shopInfo.items.length > 0 ? (
                <table className="inventory-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th style={{ width: '80px' }}>Price (₹)</th>
                      <th style={{ width: '120px' }}>Stock Status</th>
                      <th style={{ width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {shopInfo.items.map((item, idx) => (
                      <tr key={item.id}>
                        <td>
                          <input
                            aria-label={`Product name for item ${idx + 1}`}
                            type="text"
                            className="input-cell"
                            value={item.name}
                            onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            aria-label={`Price for item ${idx + 1}`}
                            type="text"
                            className="input-cell"
                            value={item.price}
                            onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                          />
                        </td>
                        <td>
                          <select
                            aria-label={`Stock status for item ${idx + 1}`}
                            className={`status-select ${item.status === 'In Stock' ? 'in-stock' : 'out-of-stock'}`}
                            value={item.status}
                            onChange={(e) => handleItemChange(idx, 'status', e.target.value)}
                          >
                            <option value="In Stock">In Stock</option>
                            <option value="Out of Stock">Out of Stock</option>
                          </select>
                        </td>
                        <td>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="btn-danger-icon"
                            title="Delete Item"
                            aria-label={`Delete item ${item.name}`}
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
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                  No items yet — add your first product below.
                </div>
              )}
            </div>

            {/* Add Item Inline Form */}
            <form onSubmit={handleAddItem} className="add-item-form">
              <input
                aria-label="New product name"
                type="text"
                className="input-field"
                placeholder="Product Name"
                value={newItem.name}
                onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
              />
              <input
                aria-label="New product price"
                type="text"
                className="input-field"
                placeholder="Price"
                value={newItem.price}
                onChange={(e) => setNewItem(prev => ({ ...prev, price: e.target.value }))}
              />
              <select
                aria-label="New product stock status"
                className="select-field"
                value={newItem.status}
                onChange={(e) => setNewItem(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="In Stock">In Stock</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
              <button
                type="submit"
                className="btn btn-secondary"
                style={{ padding: '7px 14px', fontSize: '0.8125rem' }}
              >
                Add
              </button>
            </form>
          </div>
        </section>

        {/* Right Column: AI Assistant Panel */}
        <section className="panel">
          <div className="panel-header">
            <h2>AI Reply Assistant</h2>
            <div className="actions-row">
              <div className="language-selector">
                <label htmlFor="language-select">Language</label>
                <select
                  id="language-select"
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

          <div className="form-group">
            <label htmlFor="customer-query">Paste Customer Question</label>
            <textarea
              id="customer-query"
              className="textarea-field"
              rows="4"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. Do you have Tata Salt available? Is home delivery free?"
            />
          </div>

          <button
            onClick={generateReply}
            disabled={isLoading || !question.trim()}
            className="btn btn-primary"
            style={{ width: '100%', padding: '11px' }}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span> Generating Reply...
              </>
            ) : 'Generate Reply'}
          </button>

          {/* AI Response Output Block */}
          <div className="draft-container">
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

          {/* Session History List */}
          <div className="history-section">
            <div className="history-header">
              <h3>Session History</h3>
              {history.length > 0 && (
                <button onClick={clearHistory} className="clear-btn">
                  Clear History
                </button>
              )}
            </div>

            <div className="history-list">
              {history.length > 0 ? (
                history.map(item => (
                  <div key={item.id} className="history-item">
                    <div className="history-question">
                      Q: {item.question} <span style={{ color: 'var(--text-muted)' }}>({item.language})</span>
                    </div>
                    <div className="history-reply">
                      {item.reply}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem', padding: '10px 0' }}>
                  No draft replies in this session yet.
                </div>
              )}
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}

export default App;