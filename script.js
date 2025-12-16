// ====== CONFIGURE YOUR EMAILJS DETAILS HERE ======
const EMAILJS_PUBLIC_KEY = "xa4_2q1s8H7pvdu0H";
const EMAILJS_SERVICE_ID = "service_auvf4k5";
const EMAILJS_TEMPLATE_ID = "template_zn2xde5";

// OWNER EMAIL (fixed)
const OWNER_EMAIL = "bawliyakunal@gmail.com";

// ===== SERVICES DATA =====
const servicesData = {
  "dry-clean": { name: "Dry Cleaning", price: 200 },
  "wash-fold": { name: "Wash & Fold", price: 100 },
  "ironing": { name: "Ironing", price: 30 },
  "stain-removal": { name: "Stain Removal", price: 500 },
  "leather-suede": { name: "Leather & Suede Cleaning", price: 999 },
  "wedding-dress": { name: "Wedding Dress Cleaning", price: 2800 },
};

// Cart object
const cart = {};

// DOM refs
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
      document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
    });
  }

  // Footer year
  const yearSpan = document.getElementById("year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  // Cart DOM
  cartTableBody = document.getElementById("cart-items");
  totalAmountEl = document.getElementById("total-amount");
  emptyCartText = document.getElementById("empty-cart");

  // Add buttons
  document.querySelectorAll(".add-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.serviceId;
      addToCart(id);
      toggleButtons(id, true);
    });
  });

  // Remove buttons
  document.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.serviceId;
      removeFromCart(id);
      toggleButtons(id, false);
    });
  });

  // Booking form
  bookingForm = document.getElementById("booking-form");
  bookingMessage = document.getElementById("booking-message");
  bookingError = document.getElementById("booking-error");

  bookingForm?.addEventListener("submit", handleBookingSubmit);

  renderCart();
});

// ===== BUTTON TOGGLE =====
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

// ===== CART LOGIC =====
function addToCart(id) {
  if (!servicesData[id]) return;
  cart[id] = 1;
  renderCart();
}

function removeFromCart(id) {
  delete cart[id];
  renderCart();
}

function renderCart() {
  cartTableBody.innerHTML = "";

  const items = Object.entries(cart);

  if (items.length === 0) {
    emptyCartText.classList.remove("hidden");
    totalAmountEl.textContent = "₹0.00";
    return;
  }

  emptyCartText.classList.add("hidden");

  let total = 0;

  items.forEach(([id, qty], index) => {
    const item = servicesData[id];
    const lineTotal = item.price * qty;
    total += lineTotal;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td class="py-2 pr-2">${index + 1}</td>
      <td class="py-2 pr-2">${item.name} <span class="text-xs">(x${qty})</span></td>
      <td class="py-2 pr-2 text-right">₹${lineTotal.toFixed(2)}</td>
    `;
    cartTableBody.appendChild(row);
  });

  totalAmountEl.textContent = "₹" + total.toFixed(2);
}

// ===== BOOKING + EMAILJS =====
function handleBookingSubmit(e) {
  e.preventDefault();

  bookingMessage.classList.add("hidden");
  bookingError.classList.add("hidden");

  if (Object.keys(cart).length === 0) {
    bookingError.textContent = "Please add at least one service.";
    bookingError.classList.remove("hidden");
    return;
  }

  const fullName = document.getElementById("fullName").value.trim();
  const emailVal = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();

  let orderDetails = "";
  let total = 0;

  Object.entries(cart).forEach(([id, qty]) => {
    const item = servicesData[id];
    const lineTotal = item.price * qty;
    total += lineTotal;
    orderDetails += `${item.name} x${qty} - ₹${lineTotal}\n`;
  });

  const baseParams = {
    customer_name: fullName,
    customer_email: emailVal,
    customer_phone: phone,
    order_details: orderDetails,
    order_total: "₹" + total.toFixed(2),
  };

  // 1️⃣ Send to OWNER
  emailjs
    .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      ...baseParams,
      to_email: OWNER_EMAIL,
      receiver_name: "Atom Laundry Admin",
    })

    // 2️⃣ Send to CUSTOMER
    .then(() => {
      return emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        ...baseParams,
        to_email: emailVal,
        receiver_name: fullName,
      });
    })

    // SUCCESS
    .then(() => {
      bookingMessage.classList.remove("hidden");
      bookingForm.reset();

      // reset cart UI
      Object.keys(cart).forEach((id) => toggleButtons(id, false));
      for (const key in cart) delete cart[key];
      renderCart();
    })

    // ERROR
    .catch((err) => {
      console.error(err);
      bookingError.textContent = "Something went wrong. Please try again.";
      bookingError.classList.remove("hidden");
    });
}
