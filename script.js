// ====== CONFIGURE YOUR EMAILJS DETAILS HERE ======
const EMAILJS_PUBLIC_KEY = "xa4_2q1s8H7pvdu0H";
const EMAILJS_SERVICE_ID = "service_auvf4k5";
const EMAILJS_TEMPLATE_ID = "template_zn2xde5";

// Services data
const servicesData = {
  "dry-clean": { name: "Dry Cleaning", price: 200 },
  "wash-fold": { name: "Wash & Fold", price: 100 },
  "ironing": { name: "Ironing", price: 30 },
  "stain-removal": { name: "Stain Removal", price: 500 },
  "leather-suede": { name: "Leather & Suede Cleaning", price: 999 },
  "wedding-dress": { name: "Wedding Dress Cleaning", price: 2800 },
};

// Cart object (each service present or not)
const cart = {};

// DOM elements
let cartTableBody, totalAmountEl, emptyCartText;
let bookingForm, bookingMessage, bookingError;

document.addEventListener("DOMContentLoaded", () => {
  // Init EmailJS
  if (window.emailjs) {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }

  // Mobile menu
  const mobileBtn = document.getElementById("mobile-menu-btn");
  const mobileMenu = document.getElementById("mobile-menu");
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
  }

  // Hero CTA scroll
  const heroCTA = document.getElementById("hero-cta");
  if (heroCTA) {
    heroCTA.addEventListener("click", () => {
      const servicesSection = document.getElementById("services");
      if (servicesSection) servicesSection.scrollIntoView({ behavior: "smooth" });
    });
  }

  // Footer year
  const yearSpan = document.getElementById("year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // Cart DOM refs
  cartTableBody = document.getElementById("cart-items");
  totalAmountEl = document.getElementById("total-amount");
  emptyCartText = document.getElementById("empty-cart");

  // Add/Remove buttons with toggle
  document.querySelectorAll(".add-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-service-id");
      addToCart(id);
      toggleButtons(id, true);
    });
  });

  document.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-service-id");
      removeFromCart(id);
      toggleButtons(id, false);
    });
  });

  // Booking form
  bookingForm = document.getElementById("booking-form");
  bookingMessage = document.getElementById("booking-message");
  bookingError = document.getElementById("booking-error");

  if (bookingForm) bookingForm.addEventListener("submit", handleBookingSubmit);

  renderCart();
});

// Toggle visibility of Add / Remove
function toggleButtons(id, inCart) {
  const addBtn = document.querySelector(`.add-btn[data-service-id="${id}"]`);
  const removeBtn = document.querySelector(`.remove-btn[data-service-id="${id}"]`);
  if (!addBtn || !removeBtn) return;

  if (inCart) {
    addBtn.classList.add("hidden");
    removeBtn.classList.remove("hidden");
  } else {
    removeBtn.classList.add("hidden");
    addBtn.classList.remove("hidden");
  }
}

// ===== CART =====
function renderCart() {
  if (!cartTableBody || !totalAmountEl || !emptyCartText) return;

  cartTableBody.innerHTML = "";
  const entries = Object.entries(cart);

  if (entries.length === 0) {
    emptyCartText.classList.remove("hidden");
    totalAmountEl.textContent = "₹0.00";
    return;
  }

  emptyCartText.classList.add("hidden");

  let total = 0;
  entries.forEach(([id, quantity], index) => {
    const item = servicesData[id];
    if (!item) return;

    const lineTotal = item.price * quantity;
    total += lineTotal;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="py-2 pr-2 text-gray-700">${index + 1}</td>
      <td class="py-2 pr-2 text-gray-700">
        ${item.name} <span class="text-xs text-gray-400">(x${quantity})</span>
      </td>
      <td class="py-2 pr-2 text-right text-gray-700">₹${lineTotal.toFixed(2)}</td>
    `;
    cartTableBody.appendChild(row);
  });

  totalAmountEl.textContent = "₹" + total.toFixed(2);
}

function addToCart(id) {
  if (!servicesData[id]) return;
  cart[id] = 1;           // one of each service
  renderCart();
}

function removeFromCart(id) {
  if (!cart[id]) return;
  delete cart[id];
  renderCart();
}

// ===== BOOKING + EMAILJS =====
function handleBookingSubmit(e) {
  e.preventDefault();
  if (!bookingMessage || !bookingError) return;

  bookingMessage.classList.add("hidden");
  bookingError.classList.add("hidden");

  const fullName = document.getElementById("fullName").value;
  const emailVal = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;

  let orderDetails = "";
  let total = 0;

  Object.entries(cart).forEach(([id, quantity]) => {
    const item = servicesData[id];
    if (!item) return;
    const lineTotal = item.price * quantity;
    total += lineTotal;
    orderDetails += `${item.name} x${quantity} - ₹${lineTotal.toFixed(2)}\n`;
  });

  if (!orderDetails) orderDetails = "No services selected.";

  const templateParams = {
    customer_name: fullName,
    customer_email: emailVal,
    customer_phone: phone,
    order_details: orderDetails,
    order_total: "₹" + total.toFixed(2),
  };

  if (!window.emailjs) {
    console.error("EmailJS not loaded");
    bookingError.textContent = "Email service not available. Please try again later.";
    bookingError.classList.remove("hidden");
    return;
  }

  emailjs
    .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
    .then(() => {
      bookingMessage.classList.remove("hidden");
      bookingError.classList.add("hidden");
      bookingForm.reset();
    })
    .catch((err) => {
      console.error(err);
      bookingError.classList.remove("hidden");
    });
}
