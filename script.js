const products = [
  { id: 1, name: "Мёд с орехами", category: "Сладости", price: 490 },
  { id: 2, name: "Крафтовый шоколад", category: "Сладости", price: 390 },
  { id: 3, name: "Ассорти сухофруктов", category: "Здоровый перекус", price: 560 },
  { id: 4, name: "Чай травяной", category: "Напитки", price: 320 },
  { id: 5, name: "Кофе зерновой", category: "Напитки", price: 650 },
  { id: 6, name: "Паштет фермерский", category: "Деликатесы", price: 720 },
  { id: 7, name: "Сырное плато mini", category: "Деликатесы", price: 870 },
  { id: 8, name: "Домашнее печенье", category: "Выпечка", price: 410 },
  { id: 9, name: "Ягодный конфитюр", category: "Сладости", price: 350 },
];

const boxLimits = {
  small: 4,
  medium: 8,
  large: 12,
};

const state = {
  cart: [],
};

const productsEl = document.getElementById("products");
const cartEl = document.getElementById("cart");
const itemsCountEl = document.getElementById("itemsCount");
const boxLimitEl = document.getElementById("boxLimit");
const totalPriceEl = document.getElementById("totalPrice");
const statusEl = document.getElementById("status");
const boxSizeEl = document.getElementById("boxSize");
const checkoutButtonEl = document.getElementById("checkoutButton");

function formatPrice(value) {
  return `${value.toLocaleString("ru-RU")} ₽`;
}

function renderProducts() {
  productsEl.innerHTML = "";

  products.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <span class="product-card__category">${product.category}</span>
      <h3>${product.name}</h3>
      <p class="product-card__price">${formatPrice(product.price)}</p>
      <button type="button" data-id="${product.id}">Добавить</button>
    `;

    const button = card.querySelector("button");
    button.addEventListener("click", () => addToCart(product.id));

    productsEl.appendChild(card);
  });
}

function renderCart() {
  cartEl.innerHTML = "";
  state.cart.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "cart-item";
    li.innerHTML = `
      <span>${item.name} — ${formatPrice(item.price)}</span>
      <button type="button" data-index="${index}" aria-label="Удалить ${item.name}">×</button>
    `;

    li.querySelector("button").addEventListener("click", () => {
      state.cart.splice(index, 1);
      renderCart();
      renderSummary();
      statusEl.textContent = "Позиция удалена из набора.";
    });

    cartEl.appendChild(li);
  });
}

function renderSummary() {
  const itemCount = state.cart.length;
  const limit = boxLimits[boxSizeEl.value];
  const total = state.cart.reduce((sum, item) => sum + item.price, 0);

  itemsCountEl.textContent = String(itemCount);
  boxLimitEl.textContent = String(limit);
  totalPriceEl.textContent = formatPrice(total);
}

function addToCart(productId) {
  const limit = boxLimits[boxSizeEl.value];
  if (state.cart.length >= limit) {
    statusEl.textContent = `Достигнут лимит для выбранного бокса: ${limit} позиций.`;
    return;
  }

  const product = products.find((item) => item.id === productId);
  if (!product) {
    return;
  }

  state.cart.push(product);
  renderCart();
  renderSummary();
  statusEl.textContent = `Добавлено: ${product.name}`;
}

function getOrderPayload() {
  const form = document.getElementById("customization-form");
  const data = new FormData(form);
  return {
    boxSize: data.get("boxSize"),
    boxColor: data.get("boxColor"),
    ribbon: data.get("ribbon"),
    recipient: data.get("recipient") || "Без имени",
    message: data.get("message") || "Без открытки",
    items: state.cart.map((item) => item.name),
    total: state.cart.reduce((sum, item) => sum + item.price, 0),
  };
}

boxSizeEl.addEventListener("change", () => {
  const limit = boxLimits[boxSizeEl.value];
  while (state.cart.length > limit) {
    state.cart.pop();
  }

  renderCart();
  renderSummary();
  statusEl.textContent = "Размер бокса обновлен, состав синхронизирован с лимитом.";
});

checkoutButtonEl.addEventListener("click", () => {
  if (state.cart.length === 0) {
    statusEl.textContent = "Добавьте хотя бы один товар, чтобы оформить набор.";
    return;
  }

  const order = getOrderPayload();
  console.log("Создан подарочный набор:", order);

  statusEl.textContent = `Набор для «${order.recipient}» сформирован. Итог: ${formatPrice(order.total)}.`;
});

renderProducts();
renderCart();
renderSummary();
