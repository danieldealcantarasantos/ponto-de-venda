// leitor.js - com melhorias e notificações toast sem emojis

let scannerAtivo = false;
let ultimoCodigoDetectado = null;
const beep = new Audio();
let currentTrack = null;
let flashAtivo = false;

// Compatibilidade com múltiplos formatos de áudio
beep.src = beep.canPlayType('audio/ogg') ? '/frontend/system-ui/sounds/beep.ogg' : '/frontend/system-ui/sounds/beep.mp3';
beep.load();

const showToast = (icon, title, position = 'top-end') => {
  Swal.fire({
    toast: true,
    icon,
    title,
    position,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    showClass: {
      popup:
        position === 'top' ? 'swal2-show swal2-slide-in-down' :
        position === 'top-start' ? 'swal2-show swal2-slide-in-left' :
        'swal2-show swal2-slide-in-right'
    },
    hideClass: {
      popup:
        position === 'top' ? 'swal2-hide swal2-slide-out-up' :
        position === 'top-start' ? 'swal2-hide swal2-slide-out-left' :
        'swal2-hide swal2-slide-out-right'
    }
  });
};

beep.addEventListener("error", () => {
  showToast('error', 'Erro ao carregar o áudio do beep', 'top');
});

document.addEventListener("DOMContentLoaded", () => {
  const botaoCamera = document.getElementById("botaoCamera");
  const botaoFlash = document.getElementById("botaoFlash");
  const containerCamera = document.getElementById("interactive");

  botaoCamera.addEventListener("click", () => {
    if (!scannerAtivo) {
      Quagga.init({
  inputStream: {
    name: "Live",
    type: "LiveStream",
    target: containerCamera,
    constraints: {
      width: 1000,
      height: 800,
      facingMode: "environment",
      deviceId: "8d2b7620f81f6b49ddc29bfb8a2ead72ce82ee9e6559d0ede5570a67f9d92019",
      advanced: [
        { focusMode: "continuous" },
        { focusPointX: 0.5 },
        { focusPointY: 0.5 }
      ]
    }
  },
  locator: {
    patchSize: "medium",
    halfSample: true
  },
  numOfWorkers: navigator.hardwareConcurrency || 4,
  decoder: {
    readers: ["ean_reader", "ean_8_reader", "code_128_reader", "upc_reader"]
  },
  locate: true
}, async (err) => {
  if (err) {
    console.error(err);
    showToast('error', 'Erro ao iniciar a câmera', 'top');
    return;
  }
  
  Quagga.start();
  scannerAtivo = true;
  containerCamera.style.display = "block";
  botaoCamera.innerHTML = '<i class="fas fa-circle-xmark"></i>';
  
  const video = containerCamera.querySelector("video");
if (video && video.srcObject) {
  const tracks = video.srcObject.getVideoTracks();
  if (tracks.length > 0) {
    currentTrack = tracks[0];
    
      // Aplica o foco contínuo no centro logo que inicia
      try {
        await currentTrack.applyConstraints({
          advanced: [
            { focusMode: "continuous" },
            { focusPointX: 0.5 },
            { focusPointY: 0.5 }
          ]
        });
      } catch (e) {
        console.warn("Não foi possível aplicar foco automático:", e);
      }
    }
  }
  
  
  
  const capabilities = currentTrack?.getCapabilities?.();
  botaoFlash.style.display = capabilities?.torch ? "block" : "none";
});
    } else {
      Quagga.stop();
      scannerAtivo = false;
      flashAtivo = false;
      containerCamera.style.display = "none";
      botaoCamera.innerHTML = '<i class="fas fa-barcode"></i>';
      botaoFlash.style.display = "none";
    }
  });

  botaoFlash.addEventListener("click", async () => {
    if (!currentTrack) {
      showToast('warning', 'Câmera ainda não está pronta');
      return;
    }

    const capabilities = currentTrack.getCapabilities?.();
    if (!capabilities?.torch) {
      showToast('info', 'Este dispositivo não suporta flash', 'top');
      return;
    }

    try {
      flashAtivo = !flashAtivo;

      await currentTrack.applyConstraints({
        advanced: [{
          torch: flashAtivo,
          focusMode: "continuous",
          focusPointX: 0.5,
          focusPointY: 0.5
        }]
      });

      botaoFlash.innerHTML = '<i class="fas fa-bolt"></i>';
      botaoFlash.style.backgroundColor = flashAtivo ? "#FFBE00" : "#9E9E9E";
    } catch (e) {
      console.error("Erro ao alternar flash:", e);
      showToast('error', 'Erro ao ligar/desligar o flash', 'top');
    }
  });

  Quagga.onDetected(function (result) {
  const code = result.codeResult.code;

  if (code && code.length === 13 && code !== ultimoCodigoDetectado) {
    ultimoCodigoDetectado = code;

    const input = document.getElementById('codigoBarras');
    input.value = code;

    beep.currentTime = 0;
    beep.play().catch(() => {
      showToast('warning', 'Beep não pôde ser reproduzido');
    });

    input.dispatchEvent(new Event('input'));
  }
});

  containerCamera.style.display = "none";
  botaoFlash.style.display = "none";
});