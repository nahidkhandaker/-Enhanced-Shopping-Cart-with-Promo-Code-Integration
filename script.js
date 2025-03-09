// Cart items
let products = [];
let cartItems = [];
let appliedPromoCode = null;
let discountRate = 0;

// Available promo codes
const promoCodes = {
    "ostad10": 0.10, // 10% discount
    "ostad5": 0.05   // 5% discount
};

// DOM elements
const productsContainer = document.getElementById('productsContainer');
const cartItemsContainer = document.getElementById('cartItems');
const emptyCartMessage = document.getElementById('emptyCartMessage');
const subtotalElement = document.getElementById('subtotal');
const discountRowElement = document.getElementById('discountRow');
const discountAmountElement = document.getElementById('discountAmount');
const totalPriceElement = document.getElementById('totalPrice');
const checkoutButton = document.getElementById('checkoutButton');
const promoCodeInput = document.getElementById('promoCodeInput');
const applyPromoButton = document.getElementById('applyPromoButton');
const promoMessageElement = document.getElementById('promoMessage');

// Initialize
function init() {
    // Fetch products from the JSON file
    fetchProducts();
    applyPromoButton.addEventListener('click', applyPromoCode);
}

// Fetch products from JSON file
function fetchProducts() {
    fetch('products.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            products = data.products;
            renderProducts();
        })
        .catch(error => {
            console.error('Error fetching products:', error);
            // Display error message on the page
            productsContainer.innerHTML = `
                <div class="error-message">
                    <p>Failed to load products. Please try again later.</p>
                </div>
            `;
        });
}

// Render products
function renderProducts() {
    productsContainer.innerHTML = '';
    
    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = 'product-card';
        productElement.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-details">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-price">$${product.price.toFixed(2)}</p>
                <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
            </div>
        `;
        
        productsContainer.appendChild(productElement);
        
        // Add event listener to the Add to Cart button
        const addToCartButton = productElement.querySelector('.add-to-cart');
        addToCartButton.addEventListener('click', () => addToCart(product));
    });
}

// Add to cart
function addToCart(product) {
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cartItems.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    renderCart();
    updateCartSummary();
}

// Render cart
function renderCart() {
    if (cartItems.length === 0) {
        emptyCartMessage.style.display = 'block';
        cartItemsContainer.innerHTML = '';
        cartItemsContainer.appendChild(emptyCartMessage);
        checkoutButton.disabled = true;
        return;
    }
    
    emptyCartMessage.style.display = 'none';
    cartItemsContainer.innerHTML = '';
    
    cartItems.forEach(item => {
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h3 class="cart-item-title">${item.name}</h3>
                <p class="cart-item-price">$${item.price.toFixed(2)}</p>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                <span class="item-quantity">${item.quantity}</span>
                <button class="quantity-btn increase" data-id="${item.id}">+</button>
                <button class="remove-item" data-id="${item.id}">Remove</button>
            </div>
        `;
        
        cartItemsContainer.appendChild(cartItemElement);
        
        // Add event listeners for quantity buttons
        const decreaseButton = cartItemElement.querySelector('.decrease');
        const increaseButton = cartItemElement.querySelector('.increase');
        const removeButton = cartItemElement.querySelector('.remove-item');
        
        decreaseButton.addEventListener('click', () => updateQuantity(item.id, -1));
        increaseButton.addEventListener('click', () => updateQuantity(item.id, 1));
        removeButton.addEventListener('click', () => removeItem(item.id));
    });
    
    checkoutButton.disabled = false;
}

// Update quantity
function updateQuantity(id, change) {
    const itemIndex = cartItems.findIndex(item => item.id === id);
    
    if (itemIndex !== -1) {
        cartItems[itemIndex].quantity += change;
        
        if (cartItems[itemIndex].quantity <= 0) {
            removeItem(id);
        } else {
            renderCart();
            updateCartSummary();
        }
    }
}

// Remove item
function removeItem(id) {
    cartItems = cartItems.filter(item => item.id !== id);
    renderCart();
    updateCartSummary();
}

// Update cart summary
function updateCartSummary() {
    const subtotal = calculateSubtotal();
    const discountAmount = calculateDiscount(subtotal);
    const total = subtotal - discountAmount;
    
    subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
    
    if (discountAmount > 0) {
        discountRowElement.classList.remove('hidden');
        discountAmountElement.textContent = `-$${discountAmount.toFixed(2)}`;
    } else {
        discountRowElement.classList.add('hidden');
    }
    
    totalPriceElement.textContent = `$${total.toFixed(2)}`;
}

// Calculate subtotal
function calculateSubtotal() {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Calculate discount
function calculateDiscount(subtotal) {
    return subtotal * discountRate;
}

// Apply promo code
function applyPromoCode() {
    const promoCode = promoCodeInput.value.trim();
    
    // Check if the same promo code is already applied
    if (appliedPromoCode === promoCode) {
        displayPromoMessage("This promo code is already applied.", false);
        return;
    }
    
    // Check if the promo code is valid
    if (promoCodes.hasOwnProperty(promoCode)) {
        appliedPromoCode = promoCode;
        discountRate = promoCodes[promoCode];
        updateCartSummary();
        displayPromoMessage(`Promo code applied! You got a ${discountRate * 100}% discount.`, true);
        promoCodeInput.value = ''; // Clear the input field
    } else {
        displayPromoMessage("Invalid promo code. Please try again.", false);
    }
}

// Display promo message
function displayPromoMessage(message, isSuccess) {
    promoMessageElement.textContent = message;
    promoMessageElement.className = 'promo-message';
    
    if (isSuccess) {
        promoMessageElement.classList.add('promo-success');
    } else {
        promoMessageElement.classList.add('promo-error');
    }
    
    // Clear the message after 3 seconds
    setTimeout(() => {
        promoMessageElement.textContent = '';
        promoMessageElement.className = 'promo-message';
    }, 3000);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', init);