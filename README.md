
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f2027,50:203a43,100:2c5364&height=200&section=header&text=E-Commerce%20Backend%20API&fontSize=35&fontColor=ffffff&animation=fadeIn" />
</p>


<p align="center">
  <img src="https://skillicons.dev/icons?i=nodejs,express,mongodb" />
</p>

<p align="center">
  🍃 Mongoose &nbsp; | &nbsp; 🔑 JWT &nbsp; | &nbsp; 🔒 bcryptjs  
  <br/>
  ☁️ Cloudinary &nbsp; | &nbsp; 📦 Multer &nbsp; | &nbsp; ✉️ Resend
  <br/>
      ☁️ AWS EC2 &nbsp; | &nbsp; ⚡ Redis &nbsp; | &nbsp; 🗄️ MongoDB Atlas |  ⚙️ PM2 Cluster &nbsp; 
  <br/>
  🛡️ Helmet &nbsp; | &nbsp; 🌐 CORS &nbsp; | &nbsp; 🍪 Cookie-Parser &nbsp; | &nbsp; 📊 Morgan | &nbsp; 🚀 Backend API
</p>








# Ecommerce Backend

This project is a scalable monolithic backend for an e-commerce application built using Node.js, Express.js, and MongoDB. It includes authentication, product management, cart handling with Redis caching, and secure session management using JWT.

The backend is deployed on Amazon EC2 with PM2 cluster mode for process management and performance optimization.

---

## Tools & Tech Used

- **Node.js + Express** — Server and routing
- **MongoDB + Mongoose** — Database and schemas
- **JWT (Access + Refresh Tokens)** — Keeping users logged in securely
- **bcryptjs** — Hashing passwords before saving
- **Cloudinary + Multer** — Image uploads (avatars, product images)
- **Resend** — Sending real emails (verification, password reset OTPs)
- **Helmet + CORS + Cookie-Parser** — Security headers and cross-origin cookies
- **Morgan** — Logging HTTP requests for debugging

---

## Base URL

```
http://localhost:3001/api
```

---

## All Endpoints

### User Auth & Profile
| Method | Endpoint | What it does | Who can use it |
|--------|----------|--------------|----------------|
| POST | `/user/register` | Creates a new account; sends a verification email. Pass `adminKey` in body to register as admin ,a custom `adminkey` can be set in .env file| Anyone |
| POST | `/user/login` | Logs user in and sets access + refresh tokens in cookies | Anyone |
| GET | `/user/verify-user?code=` | Verifies email after user clicks the link from inbox | Anyone |
| GET | `/user/logout` | Clears cookies and removes refresh token from DB | Logged-in user |
| POST | `/user/refresh-token` | Issues a new access token when the old one expires | Anyone with refresh token |
| PUT | `/user/upload-avatar` | Uploads profile picture to Cloudinary | Logged-in user |
| PUT | `/user/update-user` | Updates name, email, mobile or password | Logged-in user |
| PUT | `/user/forget-password` | Sends a 6-digit OTP to email for password reset | Anyone |
| PUT | `/user/verify-otp` | Checks OTP and issues a secure reset token | Anyone |
| PUT | `/user/reset-password` | Sets a new password using the reset token | Anyone with valid reset token |
| PUT | `/user/make-admin` | Promotes a normal user to admin | Admin only |

### Categories
| Method | Endpoint | What it does | Who can use it |
|--------|----------|--------------|----------------|
| POST | `/category/create` | Adds a new product category | Admin only |
| GET | `/category/all` | Lists all categories | Anyone |
| GET | `/category/:categoryId` | Gets a single category by ID | Anyone |
| PUT | `/category/update/:categoryId` | Edits category name or image | Admin only |
| DELETE | `/category/delete/:categoryId` | Removes a category | Admin only |

### SubCategories
| Method | Endpoint | What it does | Who can use it |
|--------|----------|--------------|----------------|
| POST | `/subcategory/create` | Adds a subcategory linked to categories | Admin only |
| GET | `/subcategory/all` | Lists all subcategories | Anyone |
| GET | `/subcategory/category/:categoryId` | Gets subcategories under a specific category | Anyone |
| GET | `/subcategory/:subCategoryId` | Gets a single subcategory | Anyone |
| PUT | `/subcategory/update/:subCategoryId` | Edits subcategory details | Admin only |
| DELETE | `/subcategory/delete/:subCategoryId` | Removes a subcategory | Admin only |

### Products
| Method | Endpoint | What it does | Who can use it |
|--------|----------|--------------|----------------|
| POST | `/product/create` | Adds a new product with price, stock, discount | Admin only |
| GET | `/product/all` | Lists products with pagination | Anyone |
| GET | `/product/search` | Searches products by name/description | Anyone |
| GET | `/product/:productId` | Gets full details of a single product | Anyone |
| PUT | `/product/update/:productId` | Partial update on any product field | Admin only |
| DELETE | `/product/delete/:productId` | Deletes a product | Admin only |

### Address
| Method | Endpoint | What it does | Who can use it |
|--------|----------|--------------|----------------|
| POST | `/address/add` | Saves a new delivery address | Logged-in user |
| PUT | `/address/update/:addressId` | Updates an existing address | Logged-in user |
| DELETE | `/address/delete/:addressId` | Deletes an address | Logged-in user |
| PUT | `/address/set-default/:addressId` | Marks one address as default | Logged-in user |

### Cart
| Method | Endpoint | What it does | Who can use it |
|--------|----------|--------------|----------------|
| POST | `/cart/add` | Adds a product to user's cart | Logged-in user |
| GET | `/cart` | Shows cart items + total price, discount, payable amount | Logged-in user |
| GET | `/cart/count` | Returns how many items are in the cart | Logged-in user |
| PUT | `/cart/update/:cartItemId` | Changes quantity (checks stock first) | Logged-in user |
| DELETE | `/cart/remove/:cartItemId` | Removes a single item from cart | Logged-in user |
| DELETE | `/cart/clear` | Empties the entire cart | Logged-in user |

### Image Upload
| Method | Endpoint | What it does | Who can use it |
|--------|----------|--------------|----------------|
| POST | `/image` | Uploads an image to Cloudinary | Admin only |

---
## IMPORT FULL POSTMAN (all Routes) 
| Import file : *API.postman_collection*  to postman to see full collection of Endpoints |
----

# 🚀 Deployment (AWS EC2)

## 📌 Overview

The backend is deployed on **Amazon EC2** using Ubuntu Server. Redis is hosted locally on the instance, while the database is managed via **MongoDB Atlas**. The application is managed using **PM2** in cluster mode for better performance and reliability(Vertical Scaling).

---

## ⚙️ Steps

### 1. Launch EC2 Instance

* Ubuntu Server (22.04 / 24.04, x86)
* Instance type: t2.micro/t3.micro (free tier)
* Configure security group:

  * Port 22 (SSH)
  * Port 3000/3001 (API)

---

### 2. Connect to Instance

```bash
ssh -i key.pem ubuntu@PUBLIC_IP
```

---

### 3. Install Dependencies

```bash
sudo apt update && sudo apt upgrade -y

# Node.js (v20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Git & Redis
sudo apt install git redis-server -y
```

---

### 4. Setup Redis

```bash
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

---

### 5. Clone & Setup Project

```bash
git clone <repo-url>
cd <project-folder>
npm install
```

Create `.env` file with required variables (MongoDB URI, JWT secrets, Redis config).

---

### 6. Run Application with PM2 (Cluster Mode)

```bash
npm install -g pm2

pm2 start index.js -i max --name ecommerce-api
pm2 save
pm2 startup
```

---

### 7. Auto Start on Reboot

* Redis → managed via systemd
* Application → managed via PM2

Both services automatically restart when the EC2 instance starts.

📊 *Load Testing*

Load testing was performed using Loader.io to evaluate performance under concurrent traffic.

LOAD TEST REPORT - https://loader.io/reports/fc64ba9cd85dea64c7e686a5e6eddb7a/results/83739fc501d234e268fd0a3d2ba5bef3

<img width="1536" height="868" alt="loadtestEcomImg" src="https://github.com/user-attachments/assets/cf4cdd2d-3c45-4b46-95da-c7b92ceefc6b" />



🔹 Test Configuration
Test Type: Clients per Test
Concurrent Users: 250
Duration: 1 minute
🔹 Results
Average Response Time: ~114 ms
Max Response Time: 226 ms
Error Rate: 0%
Timeouts: 0
🔹 Observations
Stable response time under concurrent load
No failures or timeouts observed
Redis caching helped reduce database load and improve latency

# IMAGES OF DEPLOYMENT
<img width="1206" height="484" alt="ec2ecommerceimg" src="https://github.com/user-attachments/assets/019ed479-a1f8-408a-8567-410efa4ce5b2" />
<img width="1270" height="670" alt="ec2awsimg" src="https://github.com/user-attachments/assets/5d05bb18-7205-4374-840e-a462daac5e24" />
<img width="1872" height="771" alt="ecmimg" src="https://github.com/user-attachments/assets/dd903fd3-e54c-458a-8aa4-9c64bc2f97c8" />
<img width="1720" height="622" alt="redisawsimg" src="https://github.com/user-attachments/assets/16aaa787-e1d4-4765-8eeb-592747537d23" />
<img width="1918" height="1063" alt="redis_eccomerce" src="https://github.com/user-attachments/assets/8c9166cd-e34e-4ed2-90a7-dab3f619e1a6" />
<img width="1915" height="279" alt="pm2LISTimg" src="https://github.com/user-attachments/assets/60588291-9058-40ac-8652-0d1363e8b7be" />
<img width="1912" height="970" alt="pm2monitorIMG" src="https://github.com/user-attachments/assets/1c6427dd-9706-454b-bf80-2c2da726a829" />






---

## ⚠️ Notes
* Ensure ports are open in security group


## How the Backend System Works (The Thinking Behind It)

**Two-layer login:** I used short-lived access tokens and long-lived refresh tokens stored in `httpOnly` cookies. This way even if someone sniffs the access token, it expires quickly, and the refresh token is never exposed to JavaScript.

**Role separation:** Instead of mixing admin checks everywhere, I split it into two middlewares — `auth` checks "are you logged in?" and `admin` checks "are you allowed?". Makes the code cleaner and safer.

**Forgot password flow:** I didn't just send a reset link. I generate a random OTP, hash it with SHA-256, store it with an expiry, and email the plain OTP. After verification, a second crypto reset token is issued. This adds a small delay that brute-force attacks hate.

**Cart pricing on the backend:** Total price, discount, and final payable amount are all calculated server-side. The frontend only displays what the backend sends. This stops anyone from tampering with prices in the browser.

**Stock check on every quantity update:** Before updating cart quantity, the code checks live stock. So if only 3 items are left and the user asks for 5, it rejects immediately. No overselling.

**Partial updates:** Product and category updates only change the fields you send. You don't need to send the entire object every time. Thus consumes Less bandwidth.

**Search that scales:** Product names and descriptions are text-indexed in MongoDB. Search is fast even as the catalog grows, and pagination keeps response sizes small.

---

## Running it Locally

```bash
cd server
npm install
# create a .env file with: MONGODB_URI, SECRET_KEY_ACCESS_TOKEN, SECRET_KEY_REFRESH_TOKEN, 
# ADMIN_SECRET_KEY, CLOUDINARY credentials, RESEND_API_KEY, FRONTEND_URL
npm run dev
```

Server starts at `http://localhost:3001`

---

## Author

**Samarjit Banerjee**

Built this to understand how real E-Commerce backends handle auth, roles, inventory, and user data, and Deployment using AWS EC2.
