# School Payment Backend

This is the **backend** for the School Payment project built with **Node.js, Express, MongoDB Atlas**, and **JWT authentication**.

---

## API Endpoints

  
  | Method | Endpoint | Description |
  |--------|---------|-------------|
  | POST   | /api/transactions | Create order + transaction |
  | GET    | /api/transactions | Fetch all transactions (joined with order) |
  | GET    | /api/transactions/school/:schoolId | Fetch transactions by school |
  | GET    | /api/transactions/:orderId/status | Fetch transaction by order ID |
  | PUT    | /api/transactions/:orderId/refund | Refund a transaction |
  | POST   | /api/webhook | Webhook handler (update status) |

Example request for POST `/api/transactions`:

```json
{
  "schoolId": "12345",
  "studentName": "John Doe",
  "amount": 500
}

Example response:
{
  "success": true,
  "transactionId": "abc123",
  "status": "pending"
}

---

## Create a .env file (use .env.example as reference):
  
  MONGO_URI=your_mongodb_atlas_uri
  JWT_SECRET=your_jwt_secret
  PORT=5000
  PG_KEY=edvtest01
  API_KEY=your_api_key

---

## 🚀 How to Run

1. Clone or download the repo
   ```bash
   git clone https://github.com/kashish1624/school-payment-backend.git

2. Go into the folder:
    ```bash
   cd school-payment-frontend

2. Install dependencies:
   ```bash
   npm install

3. Start the frontend:
   ```bash
   npm run dev
   #  or
   node src/server.js

---

## Screenshots
  ```markdown
  ![Postman Test](screenshots/ss_postman.png)
  ![MongoDB Atlas](screenshots/ss_mongo.png)




