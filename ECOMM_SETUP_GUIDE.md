# EShopper E-Commerce CMS - Complete Setup Guide

This document explains how to set up the EShopper e-commerce website with a Firebase-powered Content Management System (CMS), allowing admins to add/edit/delete products, manage categories, and publish products from an admin dashboard.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Step 1: Firebase Project Setup](#step-1-firebase-project-setup)
4. [Step 2: Firebase Authentication Setup](#step-2-firebase-authentication-setup)
5. [Step 3: Firestore Database Setup](#step-3-firestore-database-setup)
6. [Step 4: Firebase Storage Setup](#step-4-firebase-storage-setup)
7. [Step 5: Add Firebase Config to Your Code](#step-5-add-firebase-config-to-your-code)
8. [Step 6: Security Configuration](#step-6-security-configuration)
9. [Step 7: Deployment](#step-7-deployment)
10. [Admin Dashboard Usage](#admin-dashboard-usage)
11. [Troubleshooting](#troubleshooting)
12. [Database Structure](#database-structure)

---

## Project Overview

### Features
- ✅ **Product Management**: Add, edit, delete products with images
- ✅ **Category Management**: Create and manage product categories
- ✅ **Publish System**: Draft/Published status for products
- ✅ **Featured Products**: Mark products as featured for homepage
- ✅ **Image Uploads**: Product images, carousel banners
- ✅ **Store Settings**: Configure store name, contact info, currency
- ✅ **Admin Dashboard**: Secure login to manage everything
- ✅ **Dynamic Filtering**: Filter by price, color, size, category
- ✅ **Static Hosting**: Works on GitHub Pages (free)

### Tech Stack
- **Frontend**: HTML, CSS, JavaScript, Bootstrap 4
- **Backend**: Firebase (Firestore, Auth, Storage)
- **Hosting**: GitHub Pages or any static host

---

## Prerequisites

Before starting, you need:
- A GitHub account
- A Google account (for Firebase)
- Basic knowledge of HTML/CSS/JavaScript
- Git installed on your computer

---

## Step 1: Firebase Project Setup

### 1.1 Create Firebase Project

1. Go to **https://console.firebase.google.com/**
2. Click **"Create a project"** (or "Add project")
3. Enter project name: `eshopper-cms` (or any name)
4. **Disable** Google Analytics (not needed)
5. Click **Create Project**
6. Wait for creation, then click **Continue**

### 1.2 Register Web App

1. On the project overview page, click the **Web icon** `</>`
2. App nickname: `eshopper`
3. **Don't** check "Firebase Hosting"
4. Click **Register app**
5. You'll see a config object - **COPY THIS**:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123..."
};
```

---

## Step 2: Firebase Authentication Setup

### 2.1 Enable Authentication

1. In Firebase Console, click **Build** → **Authentication**
2. Click **Get started**
3. Click **Email/Password**
4. Toggle **Enable** → Click **Save**

### 2.2 Create Admin User

1. Go to **Authentication** → **Users** tab
2. Click **Add user**
3. Enter:
   - **Email**: your-email@example.com
   - **Password**: your-secure-password (min 6 characters)
4. Click **Add user**

⚠️ **Remember these credentials** - you'll use them to log into the admin dashboard.

---

## Step 3: Firestore Database Setup

### 3.1 Create Database

1. In Firebase Console, click **Build** → **Firestore Database**
2. Click **Create database**
3. Select **Start in test mode** (we'll secure it later)
4. Choose a location close to you
5. Click **Enable**

### 3.2 Database Structure

The database will automatically create these collections when you add products:

```
firestore/
├── products/
│   └── {productId}    {name, description, price, originalPrice, category, status, sizes[], colors[], featured, image, createdAt, updatedAt}
├── categories/
│   └── {categoryId}   {name, description, createdAt}
└── settings/
    └── store          {storeName, storeEmail, storePhone, storeAddress, storeDescription, currencySymbol, featuredTitle, carousel1, carousel2}
```

---

## Step 4: Firebase Storage Setup

### 4.1 Enable Storage

1. In Firebase Console, click **Build** → **Storage**
2. Click **Get started**
3. Select **Start in test mode**
4. Choose a location
5. Click **Done**

### 4.2 Storage Structure

Images are stored in:
```
storage/
├── products/
│   └── product-{timestamp}.{ext}
└── carousel/
    ├── carousel1-{timestamp}.{ext}
    └── carousel2-{timestamp}.{ext}
```

---

## Step 5: Add Firebase Config to Your Code

You need to add your Firebase config to **4 files**:

### Files to Update:
1. `admin.html`
2. `index.html`
3. `shop.html`
4. `detail.html`

### How to Update:

In each file, find this section:

```javascript
// =====================================================
// FIREBASE CONFIGURATION - REPLACE WITH YOUR OWN!
// =====================================================
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
// =====================================================
```

Replace with your Firebase config from Step 1.2.

---

## Step 6: Security Configuration

### 6.1 Firestore Security Rules

Go to **Firebase Console** → **Firestore Database** → **Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products - anyone can read published, only authenticated users can write
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Categories - anyone can read, only authenticated users can write
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Settings - anyone can read, only authenticated users can write
    match /settings/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

Click **Publish**.

### 6.2 Storage Security Rules

Go to **Firebase Console** → **Storage** → **Rules**:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /carousel/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

Click **Publish**.

### 6.3 API Key Restrictions (Important for Production!)

1. Go to **https://console.cloud.google.com/**
2. Select your Firebase project
3. Go to **APIs & Services** → **Credentials**
4. Click on your API key
5. Under **Application restrictions**:
   - Select **"HTTP referrers (websites)"**
   - Add: `https://YOUR-USERNAME.github.io/*`
   - Add: `http://localhost:*` (for local development)
6. Click **Save**

---

## Step 7: Deployment

### 7.1 GitHub Repository Setup

1. Create a new repository on GitHub
2. Clone it to your computer:
   ```bash
   git clone https://github.com/YOUR-USERNAME/YOUR-REPO.git
   ```
3. Add your e-commerce files to the repository

### 7.2 Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select **main** branch
4. Click **Save**
5. Your site will be live at: `https://YOUR-USERNAME.github.io/YOUR-REPO/`

### 7.3 Push Changes

```bash
git add -A
git commit -m "Your commit message"
git push
```

Changes deploy automatically in 1-2 minutes.

---

## Admin Dashboard Usage

### Accessing the Dashboard

URL: `https://YOUR-USERNAME.github.io/YOUR-REPO/admin.html`

### Login

1. Enter your admin email and password (created in Step 2.2)
2. Click **Sign In**

### Managing Products

#### Add a Product:
1. Click **Products** in the sidebar
2. Click **Add Product** button
3. Fill in product details:
   - **Name**: Product name
   - **Description**: Product description
   - **Price**: Current price
   - **Original Price**: Optional (shows as crossed-out price for sales)
   - **Category**: Select a category
   - **Status**: Draft (hidden) or Published (visible on store)
   - **Sizes**: Comma-separated (e.g., "XS, S, M, L, XL")
   - **Colors**: Comma-separated (e.g., "Black, White, Red")
   - **Featured**: Check to show on homepage
   - **Image**: Click to upload product image
4. Click **Save Product**

#### Edit a Product:
1. Click **Edit** on any product card
2. Make changes
3. Click **Save Product**

#### Delete a Product:
1. Click the trash icon on any product card
2. Confirm deletion

### Managing Categories

1. Click **Categories** in the sidebar
2. To add: Enter name and description, click **Add Category**
3. To delete: Click the trash icon

### Store Settings

1. Click **Site Settings** in the sidebar
2. Update store information:
   - Store name, email, phone, address
   - Currency symbol (e.g., $, €, £)
   - Featured section title
3. Upload carousel/banner images
4. Click **Save Settings**

---

## Troubleshooting

### Problem: Can't Login to Admin

**Solutions:**
1. Check your email/password are correct
2. Make sure you created a user in Firebase Authentication
3. Check API key restrictions include your domain
4. Clear browser cache and try again

### Problem: Products Not Loading on Store

**Solutions:**
1. Check Firebase config is correct in all 4 files
2. Make sure products are **Published** (not Draft)
3. Check browser console for errors (F12)
4. Verify Firestore rules allow read access

### Problem: Images Not Uploading

**Solutions:**
1. Make sure Firebase Storage is enabled
2. Check Storage security rules
3. Check you're logged in as admin
4. Check browser console for errors

### Problem: Firebase Abuse Notification

**Solutions:**
1. Immediately restrict API key to your domain only
2. Set proper Firestore and Storage security rules
3. Delete any compromised API keys
4. Create a new API key if needed

### Problem: Changes Not Showing on Site

**Solutions:**
1. Wait 1-2 minutes for GitHub Pages to deploy
2. Hard refresh the page: `Ctrl + Shift + R`
3. Clear browser cache
4. Check browser console for errors

---

## Database Structure

### Products Collection
```javascript
{
  name: "Product Name",
  description: "Product description...",
  price: 99.99,
  originalPrice: 149.99,  // optional, for sale items
  category: "categoryId",
  status: "published",    // or "draft"
  sizes: ["XS", "S", "M", "L", "XL"],
  colors: ["Black", "White", "Red"],
  featured: true,
  image: "https://storage.url/product-image.jpg",
  createdAt: "2024-12-05T10:00:00.000Z",
  updatedAt: "2024-12-05T10:00:00.000Z"
}
```

### Categories Collection
```javascript
{
  name: "Category Name",
  description: "Category description",
  createdAt: "2024-12-05T10:00:00.000Z"
}
```

### Settings Document
```javascript
{
  storeName: "EShopper",
  storeEmail: "info@example.com",
  storePhone: "+012 345 67890",
  storeAddress: "123 Street, New York, USA",
  storeDescription: "Your store description...",
  currencySymbol: "$",
  featuredTitle: "Trendy Products",
  carousel1: "https://storage.url/carousel1.jpg",
  carousel2: "https://storage.url/carousel2.jpg"
}
```

---

## File Structure

```
ecomm/
├── admin.html              # Admin dashboard
├── index.html              # Homepage with dynamic products
├── shop.html               # Shop page with filtering
├── detail.html             # Product detail page
├── cart.html               # Shopping cart
├── checkout.html           # Checkout page
├── contact.html            # Contact page
├── ECOMM_SETUP_GUIDE.md    # This documentation
├── css/
│   └── style.css           # Main styles
├── img/
│   ├── product-*.jpg       # Default product images
│   ├── carousel-*.jpg      # Default carousel images
│   └── ...
├── js/
│   └── main.js             # Template JavaScript
└── lib/
    ├── easing/
    └── owlcarousel/
```

---

## Quick Start Checklist

- [ ] Create Firebase project
- [ ] Enable Authentication & create admin user
- [ ] Create Firestore database
- [ ] Enable Firebase Storage
- [ ] Copy Firebase config to all 4 HTML files
- [ ] Set Firestore security rules
- [ ] Set Storage security rules
- [ ] Deploy to GitHub Pages
- [ ] Test admin login
- [ ] Add your first category
- [ ] Add your first product
- [ ] Test store frontend

---

## Support

If you encounter issues:
1. Check this documentation first
2. Check the browser console for errors (`F12` → Console tab)
3. Review Firebase documentation: https://firebase.google.com/docs
4. Check GitHub Pages documentation: https://docs.github.com/en/pages

---

**Created for EShopper E-Commerce Template**

*Last updated: December 2024*

