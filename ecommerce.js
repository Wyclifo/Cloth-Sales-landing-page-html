(function () {
  const CART_STORAGE_KEY = "stylenest-cart-v1";
  const ORDER_STORAGE_KEY = "stylenest-last-order-v1";

  function formatMoney(value) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
  }

  function readJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return parsed ?? fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getCart() {
    const cart = readJSON(CART_STORAGE_KEY, []);
    return Array.isArray(cart) ? cart : [];
  }

  function saveCart(cart) {
    writeJSON(CART_STORAGE_KEY, cart);
  }

  function addToCart(product) {
    const cart = getCart();
    const existing = cart.find((item) => item.id === product.id);

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image: product.image,
        qty: 1
      });
    }

    saveCart(cart);
    return cart;
  }

  function updateCartItemQuantity(id, qty) {
    const cart = getCart();
    const item = cart.find((entry) => entry.id === id);
    if (!item) return cart;

    if (qty <= 0) {
      return removeCartItem(id);
    }

    item.qty = qty;
    saveCart(cart);
    return cart;
  }

  function removeCartItem(id) {
    const cart = getCart().filter((item) => item.id !== id);
    saveCart(cart);
    return cart;
  }

  function clearCart() {
    saveCart([]);
    return [];
  }

  function getCartTotals(cartInput) {
    const cart = cartInput || getCart();
    return cart.reduce(
      function (acc, item) {
        acc.items += item.qty;
        acc.subtotal += item.qty * item.price;
        return acc;
      },
      { items: 0, subtotal: 0 }
    );
  }

  function setNavCartCount() {
    const totals = getCartTotals();
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = String(totals.items);
    });
  }

  function generateReference(prefix) {
    const now = new Date();
    const rand = Math.floor(Math.random() * 9000 + 1000);
    return prefix + "-" + now.getTime() + "-" + rand;
  }

  function saveLastOrder(order) {
    writeJSON(ORDER_STORAGE_KEY, order);
  }

  function getLastOrder() {
    return readJSON(ORDER_STORAGE_KEY, null);
  }

  function updateLastOrderStatus(status, paymentRef) {
    const order = getLastOrder();
    if (!order) return null;
    order.status = status;
    if (paymentRef) {
      order.paymentReference = paymentRef;
    }
    writeJSON(ORDER_STORAGE_KEY, order);
    return order;
  }

  window.StyleNestStore = {
    CART_STORAGE_KEY: CART_STORAGE_KEY,
    ORDER_STORAGE_KEY: ORDER_STORAGE_KEY,
    formatMoney: formatMoney,
    getCart: getCart,
    saveCart: saveCart,
    addToCart: addToCart,
    updateCartItemQuantity: updateCartItemQuantity,
    removeCartItem: removeCartItem,
    clearCart: clearCart,
    getCartTotals: getCartTotals,
    setNavCartCount: setNavCartCount,
    generateReference: generateReference,
    saveLastOrder: saveLastOrder,
    getLastOrder: getLastOrder,
    updateLastOrderStatus: updateLastOrderStatus
  };
})();
