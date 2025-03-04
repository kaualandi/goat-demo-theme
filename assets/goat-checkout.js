window.addEventListener('DOMContentLoaded', () => {
    console.log('===========> Loaded goat-checkout snippet 1.0');
    const $form = document.querySelector('form#cart');
    if (!$form) {
        console.log('===========> Form not found');
        return;
    }

    console.log('===========> Form:', $form);
    console.log('===========> Form:', $form.action);
    $form.action = 'https://goat.noclaf.com.br/cart/shopify/';
    console.log('===========> Form:', $form.action);
});