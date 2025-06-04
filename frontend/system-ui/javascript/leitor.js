document.addEventListener("DOMContentLoaded", () => {  
  const beep = new Audio('ponto-de-venda/frontend/system-ui/sounds/beep.mp3');
  
  Quagga.init({
  inputStream: {
    name: "Live",
    type: "LiveStream",
    target: document.querySelector('#interactive'),
    constraints: {
      width: 1000,
      height: 800,
      facingMode: "environment", // Usa a câmera traseira
      deviceId: "8d2b7620f81f6b49ddc29bfb8a2ead72ce82ee9e6559d0ede5570a67f9d92019"  
    }
  },
  locator: {
    patchSize: "medium",
    halfSample: true
  },
  numOfWorkers: navigator.hardwareConcurrency || 4,
  decoder: {
    readers: [
      "ean_reader", // Leitor de código de barras padrão EAN-13
      "ean_8_reader",
      "code_128_reader",
      "upc_reader"
    ]
  },
  locate: true
}, function (err) {
  if (err) {
    console.error(err);
    return;
  }
  Quagga.start();
});
  
  Quagga.onDetected(function(result) {
  const code = result.codeResult.code;

  // Verifica se o código é válido e insere no input
  if (code && code.length === 13) {
  const input = document.querySelector('#codigoBarras');
  input.value = code;
  beep.play();
  
  // Dispara o evento 'input' para acionar a verificação
  input.dispatchEvent(new Event('input'));
  
  // Opcional: parar o scanner se quiser evitar leitura múltipla
  // Quagga.stop();
}
});
});

