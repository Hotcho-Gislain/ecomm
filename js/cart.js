/**
 * EShopper Cart Management
 * Handles cart operations using localStorage
 */

const Cart = {
    // Get cart from localStorage
    getCart: function() {
        const cart = localStorage.getItem('eshopper_cart');
        return cart ? JSON.parse(cart) : [];
    },

    // Save cart to localStorage
    saveCart: function(cart) {
        localStorage.setItem('eshopper_cart', JSON.stringify(cart));
        this.updateCartBadge();
    },

    // Add item to cart
    addItem: function(product, quantity = 1, size = null, color = null) {
        const cart = this.getCart();
        
        // Check if item already exists (same product, size, color)
        const existingIndex = cart.findIndex(item => 
            item.id === product.id && 
            item.size === size && 
            item.color === color
        );

        if (existingIndex > -1) {
            cart[existingIndex].quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                originalPrice: product.originalPrice || null,
                image: product.image || 'img/product-1.jpg',
                quantity: quantity,
                size: size,
                color: color
            });
        }

        this.saveCart(cart);
        this.showNotification(`${product.name} added to cart!`);
        return true;
    },

    // Remove item from cart
    removeItem: function(index) {
        const cart = this.getCart();
        cart.splice(index, 1);
        this.saveCart(cart);
    },

    // Update item quantity
    updateQuantity: function(index, quantity) {
        const cart = this.getCart();
        if (quantity <= 0) {
            this.removeItem(index);
        } else {
            cart[index].quantity = quantity;
            this.saveCart(cart);
        }
    },

    // Get cart total
    getTotal: function() {
        const cart = this.getCart();
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    // Get cart item count
    getItemCount: function() {
        const cart = this.getCart();
        return cart.reduce((count, item) => count + item.quantity, 0);
    },

    // Clear cart
    clearCart: function() {
        localStorage.removeItem('eshopper_cart');
        this.updateCartBadge();
    },

    // Update cart badge in header
    updateCartBadge: function() {
        const count = this.getItemCount();
        const badges = document.querySelectorAll('.fa-shopping-cart').forEach(icon => {
            const badge = icon.parentElement.querySelector('.badge');
            if (badge) {
                badge.textContent = count;
            }
        });
    },

    // Show notification
    showNotification: function(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 9999;
            animation: slideIn 0.3s ease;
            font-family: 'Poppins', sans-serif;
        `;
        notification.innerHTML = `<i class="fas fa-check-circle mr-2"></i>${message}`;
        
        // Add animation style
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    },

    // Format price
    formatPrice: function(price, currency = '$') {
        return currency + parseFloat(price).toFixed(2);
    },

    // Generate order summary for email
    generateOrderSummary: function(customerInfo) {
        const cart = this.getCart();
        const currency = window.currencySymbol || '$';
        
        let summary = `
ORDER DETAILS
=============
Customer: ${customerInfo.firstName} ${customerInfo.lastName}
Email: ${customerInfo.email}
Phone: ${customerInfo.phone}
Address: ${customerInfo.address}, ${customerInfo.city}, ${customerInfo.country} ${customerInfo.zip}

ITEMS ORDERED
=============
`;
        
        cart.forEach((item, index) => {
            summary += `${index + 1}. ${item.name}`;
            if (item.size) summary += ` (Size: ${item.size})`;
            if (item.color) summary += ` (Color: ${item.color})`;
            summary += `\n   Qty: ${item.quantity} x ${this.formatPrice(item.price, currency)} = ${this.formatPrice(item.price * item.quantity, currency)}\n`;
        });

        summary += `
=============
SUBTOTAL: ${this.formatPrice(this.getTotal(), currency)}
SHIPPING: Free
TOTAL: ${this.formatPrice(this.getTotal(), currency)}
`;

        return summary;
    }
};

// Initialize cart badge on page load
document.addEventListener('DOMContentLoaded', function() {
    Cart.updateCartBadge();
});

