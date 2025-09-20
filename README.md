# School Payment Backend

This is the **backend** for the School Payment project built with **Node.js, Express, MongoDB Atlas**, and **JWT authentication**.

---

## **Setup Instructions**

1. Clone the repo:
```bash
git clone https://github.com/kashish1624/school-payment-backend.git

2. Go into the terminal:
cd school-payment-backend
npm install

3.Create a .env file (use .env.example as reference):

MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
PORT=5000
PG_KEY=edvtest01
API_KEY=your_api_key

4. Run the server:
src/server.js

5. API Endpoints:

Method	          Endpoint	                                  Description
POST	           /api/transactions	                          Create order + transaction
GET	             /api/transactions	                          Fetch all transactions (joined with order)
GET	             /api/transactions/school/:schoolId	          Fetch transactions by school
GET	             /api/transactions/:orderId/status	          Fetch transaction by order ID
PUT            	 /api/transactions/:orderId/refund	          Refund a transaction
POST	           /api/webhook	                                Webhook handler (update status)

6. Screenshots:

![Postman Test](screenshots/ss_postman.png)
![MongoDB Atlas](screenshots/ss_mongo.png)

