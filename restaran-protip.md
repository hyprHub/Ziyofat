# Premium Restaurant Frontend Prototype — UI/UX Development Prompt

## ROLE

You are a **senior frontend engineer + senior UI/UX designer + product designer**.

Build a **premium, highly polished Restaurant Management & Ordering frontend prototype**.

### IMPORTANT

This is **ONLY a frontend prototype**.

Do NOT build:

* backend
* database
* API
* authentication server
* payment system
* real-time backend
* server-side architecture
* production authentication
* complex backend-like infrastructure

Everything must be **hardcoded / mock data** and controlled with simple frontend state.

The main goal is:

> **Make the frontend look and feel like a real premium restaurant SaaS product.**

The priority is:

```text
DESIGN
>
UX
>
VISUAL QUALITY
>
RESPONSIVENESS
>
INTERACTION
>
CODE COMPLEXITY
```

Do not over-engineer the application.

---

# 1. DESIGN RESEARCH

Before designing, research current premium restaurant software and food-ordering interfaces on Google.

Look at products and websites such as:

* Toast
* SevenRooms
* modern restaurant POS systems
* premium QR ordering platforms
* modern Kitchen Display Systems
* premium hospitality SaaS products

Use them only as **UX/design inspiration**.

Do not copy their branding or exact layouts.

Study:

* navigation
* typography
* spacing
* table management
* order management
* kitchen workflow
* food cards
* mobile ordering
* status visualization
* dashboards
* responsive layouts
* interaction patterns

Then create an **original visual identity**.

The result must look significantly more premium than a typical Tailwind/shadcn admin template.

---

# 2. CORE GOAL

This project should visually demonstrate a complete restaurant product.

It should include:

```text
Super Admin
Restaurant Admin
Kitchen
Waiter
Customer
```

But remember:

**These are frontend views, not separate backend systems.**

Use mock data and frontend state.

---

# 3. TECHNOLOGY

Use:

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Lucide React
* shadcn/ui where useful
* Recharts if charts are needed

Use clean reusable components.

Do not create unnecessary architecture.

---

# 4. DATA

All data must be hardcoded.

Create mock data such as:

```text
src/data/
├── mockRestaurants.ts
├── mockUsers.ts
├── mockProducts.ts
├── mockCategories.ts
├── mockOrders.ts
├── mockTables.ts
└── mockCustomers.ts
```

Use realistic data.

Restaurant:

```text
Rayhon Restaurant
```

Products:

```text
30+ products
```

Tables:

```text
25 tables
```

Orders:

```text
30+ orders
```

Customers:

```text
20+ customers
```

Use realistic UZS prices.

Do not use lorem ipsum.

---

# 5. MOST IMPORTANT DESIGN REQUIREMENT

## DO NOT MAKE A GENERIC ADMIN DASHBOARD.

Avoid this pattern everywhere:

```text
Sidebar
+
4 statistic cards
+
one chart
+
one table
```

That looks like an AI-generated dashboard.

Instead create a strong visual hierarchy.

Use:

* editorial layouts
* large food photography
* strong typography
* whitespace
* subtle borders
* warm surfaces
* dark espresso areas
* carefully selected accent colors
* contextual layouts
* different compositions for different screens

Each section should have its own visual purpose.

---

# 6. VISUAL STYLE

The visual direction should be:

```text
Premium
Warm
Elegant
Modern
Minimal
Sophisticated
Hospitality-focused
Clean
Fast
Professional
```

Think:

```text
Premium restaurant website
+
modern SaaS
+
high-end POS
+
editorial food magazine
```

Do NOT make it look like:

```text
generic CRM
generic ERP
generic Tailwind dashboard
```

---

# 7. COLOR SYSTEM

Base colors:

```text
Cream
#FAF7F2

Espresso
#3C2A21

Latte
#E5C3A6

Terracotta
#D05A3F
```

You may introduce tasteful supporting colors when necessary:

```text
Warm White
#FFFDF9

Soft Sand
#EFE7DE

Taupe
#A89A8C

Deep Brown
#291D18

Sage
#7D8A6A

Muted Gold
#C59B5B

Success
#5E8063

Danger
#B84C3A
```

Do not use too many colors.

The interface should remain visually calm.

---

# 8. 60-30-10 PRINCIPLE

Use approximately:

```text
60%
Warm neutral backgrounds

30%
Espresso / dark structural elements

10%
Accent colors
```

Accent colors should be used for:

* CTA
* active states
* status
* important actions
* highlights

Do not turn the whole UI terracotta.

---

# 9. TYPOGRAPHY

Use a modern premium font such as:

```text
Inter
Manrope
DM Sans
Plus Jakarta Sans
```

You may use an elegant serif for selected customer-facing headings:

```text
Cormorant Garamond
DM Serif Display
Playfair Display
```

Use serif sparingly.

Typography should be one of the main visual design elements.

Large numbers such as:

```text
8,450,000 UZS
```

should look premium and prominent.

---

# 10. FOOD IMAGES

Food photography is extremely important.

Use large, high-quality food images.

Images should feel:

```text
Natural
Appetizing
Warm
Premium
Restaurant-quality
```

Use image URLs if necessary.

Every image must have a fallback.

If image loading fails:

```text
warm neutral background
+
Utensils icon
+
product name
```

Never display broken image UI.

---

# 11. BORDER RADIUS

Do not round everything excessively.

Avoid:

```text
rounded-3xl everywhere
```

Use intentional radius.

Recommended:

```text
Buttons: 10–12px
Cards: 14–18px
Dialogs: 18–24px
Small controls: 8–10px
```

---

# 12. SHADOWS

Use minimal shadows.

Prefer:

```text
borders
contrast
surface changes
spacing
```

instead of heavy shadows.

---

# 13. ANIMATIONS

Use subtle animations:

* hover
* active state
* modal
* drawer
* toast
* cart updates
* quantity changes
* kitchen status movement
* table status changes

Keep animation fast:

```text
150ms
200ms
250ms
```

Do not over-animate.

---

# 14. MULTILINGUAL UI

The entire UI must support:

```text
UZ
RU
EN
```

Default:

```text
UZ
```

Create a language switcher.

Language must change across the whole interface.

Use:

```text
i18next
react-i18next
```

or a similarly clean frontend solution.

---

# 15. LANGUAGE REQUIREMENTS

Uzbek must be natural Uzbek Latin.

Russian must be natural Russian.

English must be professional SaaS English.

Do not hardcode visible UI strings directly inside components.

Use translation keys.

Example:

```text
navigation.dashboard
navigation.orders
navigation.tables
navigation.menu
navigation.kitchen
navigation.staff
navigation.customers
navigation.reports
navigation.settings
```

Persist selected language with localStorage.

Language must not reset when navigating.

---

# 16. PRODUCT DATA TRANSLATIONS

Products should have multilingual content:

```ts
{
  name: {
    uz: "...",
    ru: "...",
    en: "..."
  },
  description: {
    uz: "...",
    ru: "...",
    en: "..."
  }
}
```

Business state should use language-independent values.

For example:

```ts
status: "preparing"
```

not:

```ts
status: "Tayyorlanmoqda"
```

---

# 17. ROLES

Create these demo roles:

```text
Super Admin
Restaurant Admin
Kitchen
Waiter
Customer
```

Login is only a frontend demo selector.

No authentication backend.

---

# 18. LOGIN PAGE

Route:

```text
/login
```

Create a premium role selection screen.

Do not make it look like a boring corporate login.

Example:

```text
Welcome back

Choose a demo experience
```

Cards:

```text
Super Admin
Restaurant Owner
Kitchen
Waiter
Customer
```

Each role should have:

* icon
* short description
* hover effect
* clear CTA

Customer:

```text
Open Restaurant Menu
```

---

# 19. SUPER ADMIN

Route:

```text
/super-admin
```

Sidebar:

```text
Overview
Restaurants
Users
Subscriptions
Payments
Analytics
System Logs
Settings
```

Dashboard should show:

```text
Total Restaurants
Active Restaurants
Total Users
Today's Orders
Monthly Revenue
Active Subscriptions
```

Include:

* restaurant growth
* revenue
* order growth
* subscription distribution
* recent restaurants

Use realistic mock data.

Do not make every element a card.

---

# 20. RESTAURANT ADMIN

Route:

```text
/admin
```

This should be the strongest desktop interface.

Sidebar:

```text
Dashboard
Orders
Tables
Menu
Categories
Kitchen
Staff
Customers
Reports
Settings
```

Dashboard greeting:

```text
Good morning, Aziz
Here's how Rayhon is performing today.
```

Show:

```text
Today's Revenue
8,450,000 UZS

Orders
147

Average Order
57,482 UZS

Occupied Tables
18 / 25
```

Use a sophisticated composition with:

* revenue chart
* live orders
* table occupancy
* popular dishes
* peak hours
* recent activity

---

# 21. TABLE MANAGEMENT

Route:

```text
/admin/tables
```

Create a beautiful visual floor plan.

25 tables.

Statuses:

```text
Available
Occupied
Waiting
Cleaning
Reserved
```

Use visually distinct but tasteful status colors.

Example:

```text
TABLE 05
4 seats
Occupied

Order #104
128,000 UZS
```

Clicking a table opens a drawer.

Drawer should show:

* table
* seats
* status
* current order
* order total
* actions

Actions:

```text
Add Order
View Order
Change Status
Request Bill
```

---

# 22. MENU

Route:

```text
/admin/menu
```

Categories:

```text
All
Pizza
Burger
Salad
Soup
Main Course
Drinks
Desserts
```

Use large visual food cards.

Each product:

```text
Image
Name
Description
Price
Availability
Preparation time
```

Actions:

```text
Edit
Delete
Toggle Availability
```

Buttons must actually work with frontend state.

---

# 23. PRODUCT MODAL

Create a beautiful product drawer/modal.

Fields:

```text
Image
Name
Description
Price
Category
Preparation Time
Availability
```

Create:

```text
Add Product
```

Edit:

```text
Edit Product
```

Delete with confirmation.

No backend.

---

# 24. ORDERS

Route:

```text
/admin/orders
```

Create a premium order management interface.

Filters:

```text
All
Pending
Confirmed
Preparing
Ready
Served
Completed
Cancelled
```

Include:

```text
Search
Filter
Table
Time
Status
```

Order list/table:

```text
Order
Table
Customer
Items
Total
Status
Time
```

Click opens order drawer.

---

# 25. ORDER DETAIL

Example:

```text
Order #104

Table 15

Pepperoni Pizza ×2
Cola ×2
Fries ×1

Subtotal
120,000 UZS

Tax
8,000 UZS

Total
128,000 UZS
```

Timeline:

```text
✓ Received
✓ Confirmed
● Preparing
○ Ready
○ Served
```

Allow status changes using frontend state.

---

# 26. KITCHEN

Route:

```text
/kitchen
```

Create a dedicated Kitchen Display System.

Use a dark interface.

Do not make it look like the admin dashboard.

Three main columns:

```text
NEW
PREPARING
READY
```

Order tickets must be very readable.

Example:

```text
#104

TABLE 15

2 × PEPPERONI PIZZA
2 × COLA
1 × FRIES

10:42

[ START ]
```

Preparing:

```text
#104

TABLE 15

2 × PEPPERONI PIZZA
2 × COLA

[ READY ]
```

Ready:

```text
#104

TABLE 15

READY

[ SERVED ]
```

When status changes, move the ticket between columns.

Use subtle movement animation.

Kitchen operator should understand the order within 1–2 seconds.

---

# 27. WAITER

Route:

```text
/waiter
```

This interface must be **mobile-first**.

Important:

## User and Waiter use the same ordering system.

They are not separate fake systems.

Waiter can see customer orders for tables.

Customer orders appear for waiter.

Waiter can add products to the same order.

Waiter can see:

* current order
* table status
* bill requests
* waiter requests

---

# 28. WAITER TABLES

Main screen:

```text
My Tables
```

Table grid:

```text
01 Available
02 Occupied
03 Waiting
04 Available
```

Use a bottom navigation:

```text
Tables
Orders
Requests
More
```

Do not use a desktop sidebar on mobile.

---

# 29. WAITER TABLE DETAIL

Tap a table:

```text
Table 02

4 Guests

Current Order

Burger ×2
Cola ×2

130,000 UZS
```

Actions:

```text
Add Order
View Order
Request Bill
Call Kitchen
```

Use large touch targets.

---

# 30. WAITER ORDER CREATION

Route:

```text
/waiter/order/:tableId
```

Header:

```text
Table 02
```

Horizontal category navigation:

```text
Pizza
Burger
Salad
Soup
Drinks
Dessert
```

Product cards should be compact and visual.

Quantity:

```text
[-] 2 [+]
```

Sticky cart:

```text
3 items
130,000 UZS

VIEW ORDER
```

The waiter should be able to create a basic order very quickly.

---

# 31. CUSTOMER

Route:

```text
/menu/:restaurantSlug/:tableToken
```

This is the most visually beautiful part of the entire product.

It should feel like:

```text
premium restaurant website
+
modern mobile ordering app
```

No admin navigation.

Header:

```text
Rayhon Restaurant
Table 15
```

Hero:

```text
Welcome

What would you like
to enjoy today?
```

Use beautiful food imagery.

---

# 32. CUSTOMER MENU

Categories:

```text
Pizza
Burger
Salad
Soup
Main Course
Drinks
Desserts
```

On mobile use horizontal scrolling.

Food cards should feature large images.

Example:

```text
[ LARGE FOOD IMAGE ]

Pepperoni Pizza

Spicy & cheesy

55,000 UZS
+
```

---

# 33. CUSTOMER PRODUCT MODAL

When product is tapped:

Open a bottom sheet on mobile.

Show:

```text
Large image
Product name
Description
Price
Preparation time
Quantity selector
Add to Order
```

Example:

```text
[-] 1 [+]
```

CTA:

```text
Add to Order
```

---

# 34. CUSTOMER CART

Sticky bottom cart:

```text
3 items
130,000 UZS

VIEW CART
```

Cart:

```text
Your Order

Pepperoni Pizza
2 × 55,000

Cola
2 × 10,000

Total
130,000 UZS

[ PLACE ORDER ]
```

Keep the flow extremely simple.

---

# 35. CUSTOMER ORDER TRACKING

After ordering:

```text
Order #104

✓ Order received

● Preparing

○ Ready

○ Served
```

Show estimated time.

Include:

```text
Simulate Next Status
```

for the demo.

---

# 36. CUSTOMER SERVICE REQUESTS

Include:

```text
Call Waiter
Request Bill
Request Water
```

When clicked:

```text
Waiter has been notified ✓
```

The waiter interface should also reflect the request.

---

# 37. SHARED FRONTEND STATE

Do NOT build separate fake data systems.

Use simple React state/context to make the demo feel connected.

For example:

```text
Customer adds Pizza
        ↓
Shared Order State
        ↓
Waiter sees Pizza
        ↓
Kitchen sees Pizza
        ↓
Admin sees Order
```

If kitchen changes:

```text
Preparing → Ready
```

the customer/waiter views should reflect it when navigating between pages.

This does NOT need backend synchronization.

Frontend state is enough.

---

# 38. MOCK INTERACTIONS

The following must work:

```text
Navigation
Tabs
Search
Filters
Dropdowns
Modals
Drawers
Add Product
Edit Product
Delete Product
Availability Toggle
Quantity
Add to Cart
Remove from Cart
Create Order
Change Order Status
Change Table Status
Call Waiter
Request Bill
Request Water
Notifications
Language Switch
Role Switch
```

---

# 39. NOTIFICATIONS

Create a small notification system.

Examples:

```text
New order received
Table 15 requested the bill
Table 07 needs assistance
Order #104 is ready
Pepperoni Pizza is unavailable
```

Use:

```text
Toast
Notification bell
Notification panel
```

Keep it elegant.

---

# 40. RESPONSIVE DESIGN

Admin:

```text
desktop-first
```

Kitchen:

```text
large-screen-first
```

Waiter:

```text
mobile-first
```

Customer:

```text
mobile-first
```

Support:

```text
1440
1280
1024
768
430
390
375
```

Do not simply shrink desktop layouts.

Create proper mobile layouts.

---

# 41. MOBILE DESIGN

For mobile use:

* bottom navigation
* bottom sheets
* sticky CTA
* horizontal category scrolling
* large touch targets
* compact headers
* full-screen drawers where appropriate

Minimum touch target:

```text
44px
```

---

# 42. ACCESSIBILITY

Implement:

* semantic HTML
* keyboard navigation
* focus states
* aria-labels
* readable font sizes
* sufficient contrast

---

# 43. EMPTY / LOADING / ERROR STATES

Add polished:

```text
Loading
Empty
Error
Success
```

states.

Do not leave blank screens.

---

# 44. COMPONENTS

Create reusable components where useful:

```text
Sidebar
Topbar
MobileHeader
BottomNavigation

FoodImage
ProductCard
ProductModal
ProductDrawer

OrderCard
OrderDrawer
OrderStatusBadge
OrderTimeline

TableCard
FloorPlan
TableDrawer

KitchenTicket
KitchenColumn

CartDrawer
CartItem
QuantitySelector

NotificationBell
NotificationPanel
Toast

LanguageSwitcher
ConfirmDialog
EmptyState
LoadingSkeleton
```

Do not create components unnecessarily.

---

# 45. ROUTES

Implement:

```text
/
/login

/super-admin
/super-admin/restaurants
/super-admin/users
/super-admin/subscriptions

/admin
/admin/orders
/admin/tables
/admin/menu
/admin/categories
/admin/kitchen
/admin/staff
/admin/customers
/admin/reports
/admin/settings

/kitchen

/waiter
/waiter/tables
/waiter/order/:tableId

/menu/:restaurantSlug/:tableToken
/menu/:restaurantSlug/:tableToken/cart
/menu/:restaurantSlug/:tableToken/order/:orderId
```

All routes must render correctly.

---

# 46. README

Create a simple `README.md`.

Include:

```text
Project overview
Tech stack
Installation
Development
Build
Demo roles
Routes
Language support
```

Commands:

```bash
npm install
npm run dev
npm run build
```

---

# 47. FINAL QUALITY CHECK

Before finishing:

```text
npm install
npm run build
```

Fix all errors.

Check:

```text
No TypeScript errors
No console errors
No broken routes
No broken images
No horizontal overflow
No dead buttons
No missing translations
No broken mobile layouts
```

Test:

```text
UZ
RU
EN
```

Test all roles.

---

# 48. FINAL PRIORITY

If you have to choose between:

```text
more features
```

and:

```text
better design
```

choose:

# BETTER DESIGN

The application should have fewer but much better-designed features rather than hundreds of mediocre features.

---

# 49. FINAL DESIGN STANDARD

The final result should feel like:

```text
A premium restaurant product
designed by a professional product team.
```

It must NOT feel like:

```text
AI dashboard
Tailwind template
school project
generic CRUD admin panel
```

The visual quality should be the strongest part of the project.

Focus especially on:

```text
1. Food photography
2. Typography
3. Spacing
4. Navigation
5. Customer ordering experience
6. Waiter speed
7. Kitchen readability
8. Shared order flow
9. Mobile UX
10. UZ/RU/EN localization
```

---

# 50. FINAL INSTRUCTION

Build the frontend as a **high-fidelity clickable prototype**.

Use hardcoded mock data.

Keep the implementation simple.

Do not build backend infrastructure.

Do not over-engineer.

Do not spend time on authentication or database architecture.

Instead spend the majority of the effort on:

> **premium UI, clean UX, food imagery, responsive layouts, realistic restaurant workflows, micro-interactions and visual polish.**

The final prototype should make the user immediately think:

# “This looks like a real premium restaurant SaaS product.”
