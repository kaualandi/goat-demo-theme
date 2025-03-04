window.addEventListener('DOMContentLoaded', () => {
    console.log('===========> Loaded goat-checkout snippet 1.1');
    const $form = document.querySelector('form#cart');
    if (!$form) {
        console.log('===========> Form not found');
        return;
    }

    const $inputCart = document.createElement("input");
    $inputCart.type = "hidden";
    $inputCart.name = "cart";
    console.log('===========> Form:', $form);
    console.log('===========> Form:', $form.action);
    $form.action = 'https://goat.noclaf.com.br/cart/shopify/';
    console.log('===========> Form:', $form.action);

    $form.addEventListener("submit", function (event) {
        event.preventDefault(); // Impede o envio imediato do formulário
    
        fetch(window.Shopify.routes.root + "cart.js", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then((response) => response.json()) // Converte a resposta em JSON
          .then((cartData) => {
            console.log(cartData);
            $inputCart.value = JSON.stringify(cartData);
            $inputCart.appendChild($inputCart);
            fetch(window.Shopify.routes.root + "cart/clear.js", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
            })
              .then((response) => response.json())
              .then((cartData) => {
                console.log(cartData);
                $form.submit();
              })
              .catch((error) => {
                console.error("Error:", error);
                alert("Erro ao limpar o carrinho.");
              });
          })
          .catch((error) => {
            console.error("Error:", error);
            alert("Erro ao obter o carrinho.");
          });
      });
});