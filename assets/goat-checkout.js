/* eslint-disable */

window.addEventListener('DOMContentLoaded', () => {
  console.log('===========> Loaded goat-checkout snippet v1.4.0');
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
      downloadCartItems();
    });
  });
});

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
      alert('Erro ao obter o carrinho.');
    });
}

function redirectToGoatCheckout(cartData) {
  const $form = document.createElement('form');
  $form.method = 'POST';
  $form.action = 'https://apidev.goatcom.io/cart/shopify/';
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
      $form.submit();
    })
    .catch((error) => {
      console.error('Error:', error);
      alert('Erro ao limpar o carrinho.');
    });
}
