# bazario — Amazon-style Ecommerce Frontend (Step 2: connected to backend)

React + Vite + Tailwind CSS frontend, ab real backend (Node/Express/MongoDB)
se connected hai: login, signup, cart, checkout with Razorpay, order history.

## Apne machine pe chalane ke liye

1. Node.js install hona chahiye (v18+): https://nodejs.org
2. Backend pehle chalao (dekho `amazon-clone-backend/README.md`) — ye
   `http://localhost:5000` pe chalna chahiye.
3. `.env.example` ko `.env` mein copy karo:
   ```
   cp .env.example .env
   ```
   (default `VITE_API_URL=http://localhost:5000/api` local ke liye theek hai)
4. Terminal mein project folder kholo:
   ```
   cd amazon-clone-frontend
   npm install
   npm run dev
   ```
5. Browser mein khulega: `http://localhost:5173`

## Folder structure

```
src/
  api/
    client.js          -> saare backend calls yahan se hote hain (fetch wrapper + JWT)
  context/
    AuthContext.jsx     -> login/signup/logout state, localStorage me token
    CartContext.jsx      -> cart state, backend se sync
  components/
    Header.jsx           -> navbar, ab real user/cart state dikhata hai
    ProductCard.jsx       -> Add to Cart button ab real backend call karta hai
    ProductGrid.jsx        -> products backend se fetch hote hain (search/category support)
    HeroBanner.jsx, CategoryGrid.jsx, Footer.jsx -> same as pehle
  pages/
    Home.jsx
    Login.jsx / Signup.jsx
    Cart.jsx
    Checkout.jsx          -> address form + Razorpay payment popup
    Orders.jsx             -> order history
  App.jsx                 -> routing + AuthProvider/CartProvider wrap
```

## Poora flow kaise kaam karta hai

1. Signup/Login karo → JWT token localStorage mein save hota hai.
2. Home page products ko `GET /api/products` se fetch karta hai.
3. "Add to Cart" → agar login nahi hai to `/login` pe bhej deta hai, warna
   `POST /api/cart` call hota hai.
4. Cart page (`/cart`) se "Proceed to Buy" → Checkout page.
5. Checkout pe address bharo → "Pay" click karne pe:
   - Backend se order banta hai (`POST /api/orders`) — prices DB se verify hote hain
   - Razorpay checkout popup khulta hai
   - Payment hone ke baad `POST /api/orders/verify` se signature verify hota hai
   - Order "paid" mark hota hai, cart clear ho jaata hai
6. `/orders` pe apne saare orders dekh sakte ho.

## Vercel deployment — env variable zaroor set karo

Vercel project settings → Environment Variables mein:
```
VITE_API_URL = https://your-backend.onrender.com/api
```
Isके bina frontend `localhost:5000` try karega jo production mein kaam nahi karega.
Deploy karne ke baad backend ke `.env` mein `CLIENT_URL` ko apne Vercel domain
se update karna mat bhoolna (CORS ke liye), warna requests block ho jayengi.

## Abhi kya baaki hai (Step 3)

- Admin panel (product add/edit/delete UI)
- Product detail page (`/product/:id` abhi placeholder hai)
- Reviews UI on product page
- Order tracking / status updates for admin
