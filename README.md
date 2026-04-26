<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f2027,50:203a43,100:2c5364&height=200&section=header&text=E-Commerce%20Backend%20API&fontSize=35&fontColor=ffffff&animation=fadeIn" />
</p>










# Ecommerce Backend

This is the backend for an E-Commerce app built with Node.js and Express. I made this project to get a solid grip on how real-world backend systems work things like secure login flows, role-based access, cart logic, and handling images. The API is RESTful, returns consistent JSON responses, and is structured so it's easy to hook up to any frontend later.

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
| import this file => E-Commerce full API.postman_collection , to postman to see full collection of Endpoints |
----

## How the System Works (The Thinking Behind It)

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

Built this to understand how real E-Commerce backends handle auth, roles, inventory, and user data.
