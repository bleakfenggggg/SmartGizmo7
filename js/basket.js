"use strict";
//==========================================
import { ERROR_SERVER, NO_ITEMS_CART } from './constants.js';
import { 
    showErrorMessage,
    setBasketLocalStorage,
    getBasketLocalStorage,
    checkingRelevanceValueBasket
} from './utils.js';

const cart = document.querySelector('.cart');
let productsData = [];

getProducts();
cart.addEventListener('click', delProductBasket);
cart.addEventListener('click', updateProductCount);

async function getProducts() {
    try {
        if (!productsData.length) {
            const res = await fetch('../data/products.json');
            if (!res.ok) {
                throw new Error(res.statusText);
            }
            productsData = await res.json();
        }
        
        loadProductBasket(productsData);
    } catch (err) {
        showErrorMessage(ERROR_SERVER);
        console.log(err.message);
    }
}

function loadProductBasket(data) {
    cart.textContent = '';

    if (!data || !data.length) {
        showErrorMessage(ERROR_SERVER);
        return;
    }

    checkingRelevanceValueBasket(data);
    const basket = getBasketLocalStorage();

    if(!basket || !basket.length) {
        showErrorMessage(NO_ITEMS_CART);
        return;
    }

    const findProducts = data.filter(item => basket.includes(String(item.id)));

    if(!findProducts.length) {
        showErrorMessage(NO_ITEMS_CART);
        return;
    }

    renderProductsBasket(findProducts);
}

function delProductBasket(event) {
    const targetButton = event.target.closest('.cart__del-card');
    if (!targetButton) return;

    const card = targetButton.closest('.cart__product');
    const id = card.dataset.productId;
    const basket = getBasketLocalStorage();

    const newBasket = basket.filter(item => item !== id);
    setBasketLocalStorage(newBasket);

    getProducts();
}

function renderProductsBasket(arr) {
    arr.forEach(card => {
        const { id, img, title, price, discount } = card;
        const priceDiscount = price - ((price * discount) / 100);

        const cardItem = 
        `
        <div class="cart__product" data-product-id="${id}">
            <div class="cart__img">
                <img src="./images/${img}" alt="${title}">
            </div>
            <div class="cart__title">${title}</div>
            <div class="cart__block-btns">
                <div class="cart__minus">-</div>
                <div class="cart__count">1</div>
                <div class="cart__plus">+</div>
            </div>
            <div class="cart__price">
                <span class="price" data-base-price="${price}">${price}</span> грн
            </div>
            <div class="cart__price-discount">
                <span class="price-discount" data-base-discount-price="${priceDiscount}">${priceDiscount.toFixed(2)}</span> грн
            </div>
            <div class="cart__del-card">X</div>
        </div>
        `;

        cart.insertAdjacentHTML('beforeend', cardItem);
    });
}

function updateProductCount(event) {
    const targetButton = event.target.closest('.cart__minus, .cart__plus');
    if (!targetButton) return;

    const card = targetButton.closest('.cart__product');
    const countDisplay = card.querySelector('.cart__count');
    let count = parseInt(countDisplay.textContent);

    const priceElement = card.querySelector('.cart__price .price');
    const priceDiscountElement = card.querySelector('.cart__price-discount .price-discount');
    const basePrice = parseFloat(priceElement.getAttribute('data-base-price'));
    const baseDiscountPrice = parseFloat(priceDiscountElement.getAttribute('data-base-discount-price'));

    if (targetButton.classList.contains('cart__minus')) {
        if (count > 1) {
            count--;
        }
    } else if (targetButton.classList.contains('cart__plus')) {
        count++;
    }

    countDisplay.textContent = count;

    // Оновлення ціни товару відповідно до кількості
    priceElement.textContent = (basePrice * count).toFixed(2);
    priceDiscountElement.textContent = (baseDiscountPrice * count).toFixed(2);
}
