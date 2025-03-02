document.addEventListener("DOMContentLoaded", function() {
  const receivedInput = document.getElementById("received");
  const changeInput = document.getElementById("change");
  const subtotalElement = document.querySelector(".subtotal span");
  
  receivedInput.addEventListener("input", function() {
    let receivedValue = parseFloat(receivedInput.value) || 0; // Garante que seja um número válido
    let subtotalValue = parseFloat(subtotalElement.textContent.replace("R$", "").trim().replace(",", ".")) || 0;
    
    if (receivedValue >= subtotalValue) {
      let change = receivedValue - subtotalValue;
      changeInput.value = change.toFixed(2); // Define o troco formatado com 2 casas decimais
    } else {
      changeInput.value = ""; // Limpa o campo se o valor recebido for menor que o subtotal
    }
  });
});