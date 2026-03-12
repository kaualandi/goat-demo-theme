/* eslint-disable */

window.addEventListener('DOMContentLoaded', () => {
  console.log('===========> Loaded goat-checkout snippet v1.5.1');

  // If user navigated back via browser (bfcache), reload to reflect the cleared cart
  window.addEventListener('pageshow', function (event) {
    if (event.persisted && sessionStorage.getItem('goat-cart-cleared')) {
      sessionStorage.removeItem('goat-cart-cleared');
      window.location.reload();
    }
  });

  const $forms = document.querySelectorAll('form[action="/cart"]');
  if (!$forms.length) {
    console.log('===========> Form not found');
    return;
  }

  $forms.forEach(($form) => {
    // remove current action
    $form.removeAttribute('action');
    // add goat submission
    $form.addEventListener('submit', function (event) {
      event.preventDefault();
      showGoatLoading();
      downloadCartItems();
    });
  });
});

function showGoatLoading() {
  const overlay = document.createElement('div');
  overlay.id = 'goat-loading-overlay';
  overlay.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;' +
    'background:rgba(255,255,255,0.85);z-index:2147483647;' +
    'display:flex;align-items:center;justify-content:center;';
  overlay.innerHTML =
    '<div style="text-align:center;font-family:sans-serif;color:#333">' +
    '<p style="margin:0;font-size:16px">Aguarde, redirecionando...</p>' +
    '</div>';
  document.body.appendChild(overlay);
}

function downloadCartItems() {
  fetch(window.Shopify.routes.root + 'cart.js', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((cartData) => {
      console.log('===========> CART DATA', cartData);
      redirectToGoatCheckout(cartData);
    })
    .catch((error) => {
      console.error('Error:', error);
      removeGoatLoading();
      alert('Erro ao obter o carrinho.');
    });
}

function redirectToGoatCheckout(cartData) {
  const $form = document.createElement('form');
  $form.method = 'POST';
  $form.action = 'https://api.goatcom.io/cart/shopify/';
  $form.style.display = 'none';

  const $input = document.createElement('input');
  $input.type = 'hidden';
  $input.name = 'cart';
  $input.value = JSON.stringify(cartData);
  $form.appendChild($input);
  document.body.appendChild($form);
  cleanCart($form);
}

function cleanCart($form) {
  fetch(window.Shopify.routes.root + 'cart/clear.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((cartData) => {
      console.log('===========> CLEANRED DATA', cartData);
      // Mark that the cart was cleared so we can handle the bfcache back-navigation
      sessionStorage.setItem('goat-cart-cleared', '1');
      $form.submit();
    })
    .catch((error) => {
      console.error('Error:', error);
      removeGoatLoading();
      alert('Erro ao limpar o carrinho.');
    });
}

function removeGoatLoading() {
  const overlay = document.getElementById('goat-loading-overlay');
  if (overlay) overlay.remove();
}
