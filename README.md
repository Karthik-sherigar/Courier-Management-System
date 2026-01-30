# Courier Management System

A premium, full-stack Courier Management System designed to handle shipment booking, tracking, and delivery management efficiently. This system supports multiple user roles including Customers, Delivery Staff, and Administrators.

## 🚀 Features

### 👤 User/Customer
- **Secure Registration & Login**: Account creation with secure authentication.
- **Book Shipments**: Easy interface to book new couriers with sender and receiver details.
- **Track Packages**: Real-time tracking of shipments using a unique Tracking ID.
- **Shipment History**: View a history of all shipments created by the user.

### 🏢 Staff/Admin
- **Dashboard Overview**: View all shipments in the system.
- **Status Updates**: Update shipment status (e.g., Picked Up, In Transit, Delivered) and current location.
- **Proof of Delivery**: Option to add delivery proof (URL/Text).

## 🛠️ Tech Stack

### Backend
- **Node.js**: Runtime environment.
- **Express.js**: Web framework for building the API.
- **MongoDB**: NoSQL database for storing user and shipment data.
- **Mongoose**: ODM library for MongoDB.
- **JWT (JSON Web Tokens)**: For secure user authentication.
- **Bcrypt.js**: For password hashing.

### Frontend
- **HTML5 & CSS3**: For structure and styling.
- **Vanilla JavaScript**: For frontend logic and API integration.

## 📁 Project Structure

```
Courier-Management-System/
├── middleware/         # Custom middleware (Authentication)
├── models/             # Mongoose models (User, Shipment)
├── public/             # Static frontend files
│   ├── css/            # Stylesheets
│   ├── js/             # Frontend scripts
│   └── index.html      # Main entry point
├── routes/             # API Routes (Auth, Shipments)
├── .gitignore          # Git ignore file
├── package.json        # Project metadata and dependencies
└── server.js           # Main server entry point
```

## ⚙️ Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone <repository_url>
    cd Courier-Management-System
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory and add the following:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    ```
    *Note: If no `.env` is provided, the app defaults to port 5000 and uses a local MongoDB instance.*

4.  **Run the Application**
    - **Development Mode** (requires nodemon):
      ```bash
      npm run dev
      ```
    - **Production Mode**:
      ```bash
      npm start
      ```

5.  **Access the App**
    Open your browser and navigate to: `http://localhost:5000`

## 📡 API Documentation

### Authentication (`/api/auth`)

| Method | Endpoint    | Description             | Access |
| :----- | :---------- | :---------------------- | :----- |
| POST   | `/register` | Register a new user     | Public |
| POST   | `/login`    | Login user & get token  | Public |

### Shipments (`/api/shipments`)

| Method | Endpoint          | Description                        | Access           |
| :----- | :---------------- | :--------------------------------- | :--------------- |
| POST   | `/`               | Create a new shipment              | Private          |
| GET    | `/track/:id`      | Track shipment by Tracking ID      | Public           |
| GET    | `/user/:userId`   | Get all shipments for a specific user | Private        |
| GET    | `/`               | Get all shipments (Admin view)     | Private (Admin)  |
| PUT    | `/:id/status`     | Update shipment status & location  | Private (Staff)  |

## 🤝 Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -m 'Add new feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a Pull Request.

## 📄 License

This project is licensed under the MIT License.
