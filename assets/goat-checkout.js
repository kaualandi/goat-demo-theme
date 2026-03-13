/* eslint-disable */

var goatSubmitting = false;

window.addEventListener('DOMContentLoaded', () => {
  console.log('===========> Loaded goat-checkout snippet v1.6.0');

  // Safari desktop may restore from disk cache (not bfcache), so DOMContentLoaded fires —
  // check the flag here to handle that case.
  if (sessionStorage.getItem('goat-cart-cleared')) {
    console.log(
      '===========> Detected goat-cart-cleared flag on DOMContentLoaded, reloading page'
    );
    sessionStorage.removeItem('goat-cart-cleared');
    window.location.reload();
    return;
  }

  // If user navigated back via browser (bfcache — iOS/other browsers), reload to reflect the cleared cart
  window.addEventListener('pageshow', function (event) {
    if (event.persisted && sessionStorage.getItem('goat-cart-cleared')) {
      console.log(
        '===========> Detected goat-cart-cleared flag on pageshow, reloading page'
      );
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
      if (goatSubmitting) return;
      goatSubmitting = true;
      setSubmitButtonsDisabled($forms, true);
      // showGoatLoading();
      downloadCartItems();
    });
  });
});

function setSubmitButtonsDisabled($forms, disabled) {
  $forms.forEach(function ($form) {
    var buttons = $form.querySelectorAll(
      'button[type="submit"], input[type="submit"]'
    );
    buttons.forEach(function (btn) {
      btn.disabled = disabled;
    });
  });
}

function showGoatLoading() {
  var overlay = document.createElement('div');
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

function resetGoatSubmission() {
  goatSubmitting = false;
  var $forms = document.querySelectorAll('form:not([action])');
  setSubmitButtonsDisabled($forms, false);
  // removeGoatLoading();
}

function downloadCartItems() {
  fetch(window.Shopify.routes.root + 'cart.js', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (cartData) {
      console.log('===========> CART DATA', cartData);
      if (!cartData.items || !cartData.items.length) {
        console.log('===========> Cart is empty, reloading page');
        window.location.reload();
        return;
      }
      redirectToGoatCheckout(cartData);
    })
    .catch(function (error) {
      console.error('Error:', error);
      resetGoatSubmission();
      alert('Erro ao obter o carrinho.');
    });
}

function redirectToGoatCheckout(cartData) {
  var $form = document.createElement('form');
  $form.method = 'POST';
  $form.action = 'https://api.goatcom.io/cart/shopify/';
  $form.style.display = 'none';

  var $input = document.createElement('input');
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
    .then(function (response) {
      return response.json();
    })
    .then(function (cartData) {
      console.log('===========> CLEANED DATA', cartData);
      // Mark that the cart was cleared so we can handle the bfcache back-navigation
      sessionStorage.setItem('goat-cart-cleared', '1');
      $form.submit();
    })
    .catch(function (error) {
      console.error('Error:', error);
      resetGoatSubmission();
      alert('Erro ao limpar o carrinho.');
    });
}

function removeGoatLoading() {
  var overlay = document.getElementById('goat-loading-overlay');
  if (overlay) overlay.remove();
}
