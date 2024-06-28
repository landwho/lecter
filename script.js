//***************************************//
//**       RICARDO UBICO BROOKS        **//
//**              2024                 **//
//** APLICATIVO PARA LEER TEXTOS A VOZ **//
//***************************************//

document.addEventListener('DOMContentLoaded', function() {

  if ('speechSynthesis' in window) {

    const synth = window.speechSynthesis;
  
    const readButton = document.getElementById('read-button');
    const pauseButton = document.getElementById('pause-button');
    const resumeButton = document.getElementById('resume-button');
    const stopButton = document.getElementById('stop-button');
    const textToRead = document.getElementById('text-to-read');
    const voiceSelect = document.getElementById('voice-select');
    
    let voices = [];
    let utterance = null;
    let isPaused = false;
    let isStopped = false;
    let currentText = '';
    let currentIndex = 0;
    let textFragments = [];
  
    const getVoices = () => {

      voices = synth.getVoices();
      voiceSelect.innerHTML = '';
      voices.forEach((voice, i) => {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
        if (voice.lang === 'es-ES') {
          voiceSelect.value = i.toString();
        }
      });

    };
  
    getVoices();

    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = getVoices;
    }
  
    const splitText = (text) => {
      const maxLength = 200; 
      const regex = new RegExp(`.{1,${maxLength}}`, 'g');
      return text.match(regex);
    };
  
    const speakFragment = (index) => {

      if (index >= textFragments.length || isStopped) {
        return;
      }

      utterance = new SpeechSynthesisUtterance(textFragments[index]);
      const selectedVoice = voices[voiceSelect.value];
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
  
      utterance.pitch = 1; 
      utterance.rate = 1;  
  
      utterance.onend = () => {
        if (!isPaused && !isStopped) {
          speakFragment(index + 1);
        }
      };

      synth.speak(utterance);

    };
  
    readButton.addEventListener('click', () => {

      let text = textToRead.value;

      if (text !== '') {
        text = text.replace(/\//g, ' slash ');
        textFragments = splitText(text);
        currentIndex = 0;
        isPaused = false;
        isStopped = false;
        speakFragment(currentIndex);
      } 
      // else {
      //   alert('Por favor, escribe algún texto para leer.');
      // }
      else {
        // Mostrar mensaje de alerta en un div
        const alertDiv = document.createElement('div');
        alertDiv.classList.add('flex', 'items-center', 'p-4', 'mb-4', 'text-sm', 'text-blue-800', 'border', 'border-blue-300', 'rounded-lg', 'bg-blue-50', 'dark:bg-gray-800', 'dark:text-blue-400', 'dark:border-blue-800');
        alertDiv.setAttribute('role', 'alert');
        alertDiv.innerHTML = `

          <svg class="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
          </svg>
          <span class="sr-only">Info</span>
          <div>
            <span class="font-medium">👾</span> Por favor, escribe algún texto para leer. 👾
          </div>
        `;

        const textArea = document.getElementById('text-to-read');
        textArea.parentNode.insertBefore(alertDiv, textArea);
        
        setTimeout(() => {
          alertDiv.remove();
        }, 5000); 

      document.body.appendChild(alertDiv);
      alertDiv.classList.add('-translate-y-full');

      }
    });
  
    pauseButton.addEventListener('click', () => {
      if (synth.speaking && !synth.paused) {
        synth.pause();
        isPaused = true;
      }
    });
  
    resumeButton.addEventListener('click', () => {
      if (isPaused) {
        synth.resume();
        isPaused = false;
      }
    });
  
    stopButton.addEventListener('click', () => {
      if (synth.speaking || synth.paused) {
        synth.cancel();
        isPaused = false;
        isStopped = true;
      }
    });

    window.addEventListener('beforeunload', () => {
      if (synth.speaking || synth.paused) {
        synth.cancel();
      }
    });

  } else {
    alert('La API de síntesis de voz no es soportada en este navegador.');
  }
});