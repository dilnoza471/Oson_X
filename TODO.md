# Telegram Mini App — Product Menu
## Project TODO for GitHub Copilot

---

## Tech Stack
- **Framework**: React + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (Postgres + Auth + Storage)
- **Hosting**: Vercel
- **Telegram SDK**: `@tma.js/sdk` or `window.Telegram.WebApp`

---

## Project Structure to Generate

```
src/
  pages/
    shop/
      [shopId].jsx        ← customer-facing mini app
    admin/
      login.jsx           ← admin login page
      dashboard.jsx       ← admin product/category management
  components/
    shop/
      ProductCard.jsx
      CategoryTabs.jsx
      StatusBadge.jsx
    admin/
      ProductForm.jsx
      CategoryForm.jsx
      ProductList.jsx
    shared/
      ProtectedRoute.jsx
  lib/
    supabase.js           ← supabase client init
    telegram.js           ← telegram WebApp SDK helpers
  hooks/
    useSession.js         ← current supabase auth session
    useShop.js            ← fetch shop data by shopId
    useProducts.js        ← fetch products by shopId + category
    useCategories.js      ← fetch categories by shopId
  App.jsx
  main.jsx
```

---

## Phase 1 — Project Setup

- [ ] Scaffold with `npm create vite@latest . -- --template react`
- [ ] Install dependencies:
  ```
  npm install @supabase/supabase-js react-router-dom tailwindcss
  ```
- [ ] Set up Tailwind CSS config
- [ ] Create `.env` file with:
  ```
  VITE_SUPABASE_URL=your_project_url
  VITE_SUPABASE_ANON_KEY=your_anon_key
  ```
- [ ] Create `src/lib/supabase.js` that initializes and exports the Supabase client using the env variables

---

## Phase 2 — Routing

Set up React Router in `App.jsx` with these routes:

| Path | Component | Protected? |
|---|---|---|
| `/shop/:shopId` | Shop page | No |
| `/admin` | Redirect to `/admin/login` | No |
| `/admin/login` | Login page | No |
| `/admin/dashboard` | Admin dashboard | Yes |

- [ ] Create `ProtectedRoute.jsx` — checks for active Supabase session, redirects to `/admin/login` if none found

---

## Phase 3 — Customer Mini App (`/shop/:shopId`)

### Layout
- Full-screen mobile layout optimized for Telegram WebView
- Header: shop name at top
- Category tabs: horizontal scrollable row below header (show "All" as first tab)
- Product grid: 2-column card grid below tabs
- No footer needed

### `useShop.js`
- Fetch single row from `shops` table where `id = shopId`
- Return: `{ shop, loading, error }`

### `useCategories.js`
- Fetch all rows from `categories` where `shop_id = shopId`
- Order by `sort_order asc`
- Return: `{ categories, loading }`

### `useProducts.js`
- Fetch all rows from `products` where `shop_id = shopId`
- Accept optional `categoryId` param — if provided, add `category_id = categoryId` filter
- Order by `sort_order asc, created_at desc`
- Return: `{ products, loading }`

### `CategoryTabs.jsx`
- Props: `categories`, `activeId`, `onChange`
- Render "All" tab first (id = null), then one tab per category
- Horizontal scroll, no wrapping
- Highlight active tab

### `ProductCard.jsx`
- Props: `product`
- Show: product image, name, price (formatted with UZS), status badge, contact button
- If `status = 'out_of_stock'`: dim the card slightly, disable contact button
- If `status = 'coming_soon'`: show "Coming Soon" badge, no contact button

### `StatusBadge.jsx`
- Props: `status`
- Render colored pill: 
  - `in_stock` → green
  - `out_of_stock` → gray
  - `coming_soon` → amber

### Contact Button behavior
- Tapping opens Telegram chat with seller
- Use this URL format:
  ```
  https://t.me/{shop.tg_handle}?text=Hi, I'm interested in {product.name}
  ```
- Open via `window.Telegram.WebApp.openTelegramLink(url)` if inside Telegram, else `window.open(url)`

### `telegram.js`
- Export helper: `isInsideTelegram()` — returns true if `window.Telegram?.WebApp?.initData` is not empty
- Export helper: `openTelegramLink(url)` — uses SDK if inside Telegram, falls back to window.open
- On page load, call `window.Telegram.WebApp.ready()` and `window.Telegram.WebApp.expand()` to go full screen

---

## Phase 4 — Admin Login (`/admin/login`)

- [ ] Simple centered form: email input, password input, login button
- [ ] On submit: call `supabase.auth.signInWithPassword({ email, password })`
- [ ] On success: redirect to `/admin/dashboard`
- [ ] On error: show inline error message below form
- [ ] If session already exists on page load: redirect straight to `/admin/dashboard`

---

## Phase 5 — Admin Dashboard (`/admin/dashboard`)

> Only accessible to logged-in admins. All writes are scoped to their own `shop_id`.

### On load
- Get current session: `supabase.auth.getUser()`
- Fetch admin row from `admins` table where `id = user.id` to get their `shop_id`
- Store `shop_id` in state — use it for all subsequent queries

### Layout
- Top bar: shop name + logout button
- Two tabs: **Products** | **Categories**

---

### Products Tab

#### `ProductList.jsx`
- Fetch all products for this `shop_id`
- Show as a list (not grid) — each row shows: image thumbnail, name, price, status toggle, edit button, delete button

#### Status Toggle
- Clicking the status cycles: `in_stock` → `out_of_stock` → `coming_soon` → `in_stock`
- On click: call `supabase.from('products').update({ status }).eq('id', product.id)`
- Update local state immediately (optimistic update)

#### Add Product Button
- Opens `ProductForm.jsx` as a modal or slide-up panel

#### `ProductForm.jsx`
- Fields: Name (text), Description (textarea), Price (number), Category (select from existing categories), Image URL (text input for now — file upload comes later), Status (select)
- On submit: call `supabase.from('products').insert({...fields, shop_id})`
- On success: close form, refresh product list

#### Edit Product
- Opens same `ProductForm.jsx` pre-filled with existing values
- On submit: call `supabase.from('products').update({...fields}).eq('id', product.id)`

#### Delete Product
- Show confirmation: "Delete [product name]?"
- On confirm: call `supabase.from('products').update({ deleted: true })` — use soft delete (add a `deleted boolean default false` column to products, filter it out in all reads)

---

### Categories Tab

#### `CategoryForm.jsx`
- Fields: Name (text)
- On submit: `supabase.from('categories').insert({ name, shop_id })`

#### Category list
- Show all categories with a delete button
- On delete: check if any products use this category first — if yes, warn "X products use this category. They will become uncategorized." then proceed.
- On confirm: `supabase.from('categories').delete().eq('id', id)`

---



---

## Phase 6 — Vercel Deployment

- [ ] Push to GitHub
- [ ] Connect repo to Vercel
- [ ] Add env variables in Vercel dashboard (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- [ ] Set up Vercel rewrites so all routes fall back to `index.html` (needed for React Router):
  - Create `vercel.json` at project root:
    ```json
    {
      "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
    }
    ```

---

## Phase 8 — Telegram Bot Setup

- [ ] Create a bot via `@BotFather` on Telegram
- [ ] Use `/newapp` command to register the mini app URL (your Vercel URL)
- [ ] For each client: create a channel post or use `/setmenubutton` to attach the mini app button
- [ ] Test opening the mini app from within Telegram on mobile

---

## Notes for Copilot

- All Supabase queries should handle loading and error states
- Never hardcode `shop_id` — always derive it from the URL param or the logged-in admin's record
- Price display: always show with `toLocaleString('uz-UZ')` + ` UZS` suffix
- Keep the customer-facing app as lightweight as possible — no unnecessary dependencies
- Admin dashboard does not need to look pretty for v1 — functional is enough
