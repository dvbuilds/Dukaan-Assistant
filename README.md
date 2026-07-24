# Dukaan Assistant

An AI-powered shop management assistant built using the **MERN Stack**. It helps small business owners efficiently manage their stores by handling inventory, generating invoices, and providing AI-assisted customer support through an intuitive web interface.

---

## Features

* Secure JWT-based Authentication
* Product Management

  * Add Products
  * View Products
  * Update Product Details
  * Delete Products
* Inventory Management
* Invoice Generation
* AI-powered Customer Query Assistant
* Query Logging
* RESTful APIs
* API Rate Limiting
* Responsive User Interface

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Vite
* HTML5
* CSS3
* JavaScript

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication
* bcrypt.js
* dotenv
* CORS
* Express Rate Limit

---

## Project Structure

```text
Dukaan-Assistant/
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── README.md
```

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Dukaan-Assistant.git

cd Dukaan-Assistant
```

---

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

Create a **.env** file inside the backend folder.

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Run the backend server:

```bash
npm run dev
```

---

### 3. Install Frontend Dependencies

Open another terminal.

```bash
cd frontend
npm install
npm run dev
```

---

## 📡 API Modules

### Authentication

* Register
* Login

### Product Management

* Add Product
* Get Products
* Update Product
* Delete Product

### Inventory

* Manage Stock Availability

### Invoice

* Generate Invoice
* View Invoice History

### AI Assistant

* Answer customer queries
* Store query history

---

## Security Features

* JWT Authentication
* Password Hashing (bcrypt)
* Environment Variables
* API Rate Limiting
* CORS Protection

---

## Future Enhancements

* Sales Dashboard
* Analytics & Reports
* Low Stock Notifications
* Customer Management
* Multi-store Support
* Advanced AI Assistant
* Mobile-Friendly Improvements

---

##  Contributing

Contributions are welcome!

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push to your branch.
5. Open a Pull Request.

---

## Team

Developed by:

* **Junaid Qamar**
* **Manjeet Shaw**
* **Divya Das**


⭐ If you found this project helpful, consider giving it a star on GitHub.
