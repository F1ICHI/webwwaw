const boxSizes = [
  { id: 'small', label: 'Маленький (до 4 позиций)', capacity: 4, basePrice: 490 },
  { id: 'medium', label: 'Средний (до 7 позиций)', capacity: 7, basePrice: 790 },
  { id: 'large', label: 'Большой (до 10 позиций)', capacity: 10, basePrice: 1190 }
];

const boxColors = ['Крафт', 'Пудровый', 'Бордовый', 'Темно-зеленый'];
const ribbonColors = ['Золотая', 'Белая', 'Красная', 'Синяя'];

const products = [
  { id: 1, name: 'Фисташковая паста', weight: 180, price: 540, category: 'Сладкое' },
  { id: 2, name: 'Мед цветочный', weight: 250, price: 320, category: 'Натуральное' },
  { id: 3, name: 'Чай авторский "Ягодный сад"', weight: 90, price: 280, category: 'Напитки' },
  { id: 4, name: 'Печенье миндальное', weight: 140, price: 370, category: 'Сладкое' },
  { id: 5, name: 'Шоколад с апельсином', weight: 100, price: 350, category: 'Сладкое' },
  { id: 6, name: 'Кофе в дрип-пакетах', weight: 120, price: 460, category: 'Напитки' },
  { id: 7, name: 'Сырная закуска', weight: 160, price: 590, category: 'Закуски' },
  { id: 8, name: 'Ореховый микс', weight: 130, price: 410, category: 'Закуски' },
  { id: 9, name: 'Яблочные чипсы', weight: 80, price: 260, category: 'Закуски' },
  { id: 10, name: 'Мармелад ручной работы', weight: 110, price: 330, category: 'Сладкое' }
];

const state = {
  selectedSizeId: boxSizes[1].id,
  boxColor: boxColors[0],
  ribbonColor: ribbonColors[0],
  cardText: '',
  items: []
};

const refs = {
  boxSize: document.getElementById('boxSize'),
  boxColor: document.getElementById('boxColor'),
  ribbonColor: document.getElementById('ribbonColor'),
  cardText: document.getElementById('cardText'),
  products: document.getElementById('products'),
  selectedItems: document.getElementById('selectedItems'),
  totalItems: document.getElementById('totalItems'),
  totalWeight: document.getElementById('totalWeight'),
  totalPrice: document.getElementById('totalPrice'),
  remainingSlots: document.getElementById('remainingSlots'),
  search: document.getElementById('search'),
  resetBtn: document.getElementById('resetBtn'),
  checkoutBtn: document.getElementById('checkoutBtn'),
  orderDialog: document.getElementById('orderDialog'),
  orderText: document.getElementById('orderText'),
  closeDialogBtn: document.getElementById('closeDialogBtn')
};

const money = (value) => `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;

function saveState() {
  localStorage.setItem('giftBoxState', JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem('giftBoxState');
  if (!raw) return;

  try {
    const saved = JSON.parse(raw);
    if (saved.selectedSizeId) state.selectedSizeId = saved.selectedSizeId;
    if (saved.boxColor) state.boxColor = saved.boxColor;
    if (saved.ribbonColor) state.ribbonColor = saved.ribbonColor;
    if (typeof saved.cardText === 'string') state.cardText = saved.cardText;
    if (Array.isArray(saved.items)) {
      state.items = saved.items.filter((id) => products.some((item) => item.id === id));
    }
  } catch {
    localStorage.removeItem('giftBoxState');
  }
}

function fillSelect(select, values, current, formatter = (v) => v) {
  select.innerHTML = '';
  values.forEach((value) => {
    const option = document.createElement('option');
    option.value = typeof value === 'object' ? value.id : value;
    option.textContent = formatter(value);
    option.selected = option.value === current;
    select.appendChild(option);
  });
}

function getSelectedSize() {
  return boxSizes.find((size) => size.id === state.selectedSizeId) ?? boxSizes[0];
}

function renderProducts(filter = '') {
  const normalized = filter.trim().toLowerCase();
  const visible = products.filter((item) => item.name.toLowerCase().includes(normalized));
  const size = getSelectedSize();
  const isFull = state.items.length >= size.capacity;

  refs.products.innerHTML = '';

  visible.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'product';
    card.innerHTML = `
      <h3>${item.name}</h3>
      <div class="meta">
        <span>${item.category}</span>
        <span>${item.weight} г</span>
      </div>
      <div class="meta">
        <strong>${money(item.price)}</strong>
        <span>${state.items.includes(item.id) ? 'Добавлено' : 'Можно добавить'}</span>
      </div>
    `;

    const btn = document.createElement('button');
    const alreadyAdded = state.items.includes(item.id);
    btn.disabled = alreadyAdded || isFull;
    btn.textContent = alreadyAdded ? 'В наборе' : isFull ? 'Бокс заполнен' : 'Добавить';
    btn.addEventListener('click', () => {
      state.items.push(item.id);
      saveState();
      renderAll(refs.search.value);
    });

    card.appendChild(btn);
    refs.products.appendChild(card);
  });

  if (visible.length === 0) {
    refs.products.innerHTML = '<p>Ничего не найдено. Попробуйте другой запрос.</p>';
  }
}

function renderSelectedItems() {
  refs.selectedItems.innerHTML = '';
  const items = state.items.map((id) => products.find((item) => item.id === id)).filter(Boolean);

  if (items.length === 0) {
    refs.selectedItems.innerHTML = '<li><small>Вы еще не добавили ни одного продукта.</small></li>';
    return;
  }

  items.forEach((item, index) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div>
        <div>${item.name}</div>
        <small>${item.weight} г · ${money(item.price)}</small>
      </div>
    `;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-item';
    removeBtn.textContent = 'Убрать';
    removeBtn.addEventListener('click', () => {
      state.items.splice(index, 1);
      saveState();
      renderAll(refs.search.value);
    });

    li.appendChild(removeBtn);
    refs.selectedItems.appendChild(li);
  });
}

function renderTotals() {
  const size = getSelectedSize();
  const selected = state.items.map((id) => products.find((item) => item.id === id)).filter(Boolean);
  const totalWeight = selected.reduce((acc, item) => acc + item.weight, 0);
  const totalPrice = selected.reduce((acc, item) => acc + item.price, 0) + size.basePrice;

  refs.totalItems.textContent = String(selected.length);
  refs.totalWeight.textContent = `${totalWeight} г`;
  refs.totalPrice.textContent = money(totalPrice);
  refs.remainingSlots.textContent = String(size.capacity - selected.length);

  refs.checkoutBtn.disabled = selected.length === 0;
}

function renderAll(filter = '') {
  renderProducts(filter);
  renderSelectedItems();
  renderTotals();
}

function bindEvents() {
  refs.boxSize.addEventListener('change', (event) => {
    state.selectedSizeId = event.target.value;
    const size = getSelectedSize();
    if (state.items.length > size.capacity) {
      state.items = state.items.slice(0, size.capacity);
    }
    saveState();
    renderAll(refs.search.value);
  });

  refs.boxColor.addEventListener('change', (event) => {
    state.boxColor = event.target.value;
    saveState();
  });

  refs.ribbonColor.addEventListener('change', (event) => {
    state.ribbonColor = event.target.value;
    saveState();
  });

  refs.cardText.addEventListener('input', (event) => {
    state.cardText = event.target.value;
    saveState();
  });

  refs.search.addEventListener('input', (event) => {
    renderProducts(event.target.value);
  });

  refs.resetBtn.addEventListener('click', () => {
    state.items = [];
    state.cardText = '';
    refs.cardText.value = '';
    saveState();
    renderAll(refs.search.value);
  });

  refs.checkoutBtn.addEventListener('click', () => {
    const size = getSelectedSize();
    const selected = state.items.map((id) => products.find((item) => item.id === id)).filter(Boolean);
    const names = selected.map((item) => `• ${item.name}`).join('\n');
    refs.orderText.textContent = `Спасибо! Вы выбрали: ${size.label}, цвет бокса "${state.boxColor}", лента "${state.ribbonColor}".\n\nСостав:\n${names}\n\nОткрытка: ${state.cardText || 'без текста'}.`;
    refs.orderDialog.showModal();
  });

  refs.closeDialogBtn.addEventListener('click', () => {
    refs.orderDialog.close();
  });
}

function init() {
  loadState();

  fillSelect(refs.boxSize, boxSizes, state.selectedSizeId, (item) => `${item.label} — ${money(item.basePrice)}`);
  fillSelect(refs.boxColor, boxColors, state.boxColor);
  fillSelect(refs.ribbonColor, ribbonColors, state.ribbonColor);
  refs.cardText.value = state.cardText;

  bindEvents();
  renderAll();
}

init();
