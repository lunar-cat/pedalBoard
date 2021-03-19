/* Workflow =>

1.- Create audio context
2.- Inside context, create sources (such as <audio>)
3.- Create effects nodes
4.- Choose final destination of the audio, normally system speakers
5.- Connect the sources to the effects, and the effects to the destination
*/

const audioElement = document.getElementById('audio-sample');
const playBtn = document.getElementById('play-btn');
const volumenInput = document.getElementById('vol-range');
const labelVolumeValue = document.getElementById('label-vol-value');

const audioContext = new AudioContext(); // crea un BaseAudioContext
/* Si quisiéramos procesar audio-data pero offline como buffer, es mejor crear
un OfflineAudioContext() */

// Ahora necesitamos darle audio al contexto, para eso tomamos le audioElement
// Si el audio es de otro dominio, el <audio> element necesita el "crossorigin" attribute

const track = audioContext.createMediaElementSource(audioElement); // Acá pasamos el audio

/* Acá creamos y conectamos un nodo de ganancia */
const gainNode = audioContext.createGain(); // también se puede crear con new GainNode(audioContext, options)
const panner = new StereoPannerNode(audioContext, { pan: 0 }); // acepta valores desde -1(izq) a 1(derecha). Siendo 0 el medio


const distortion = audioContext.createWaveShaper();

function makeDistortionCurve(amount) {
    var k = typeof amount === 'number' ? amount : 50,
        n_samples = 44100,
        curve = new Float32Array(n_samples),
        deg = Math.PI / 180,
        i = 0,
        x;
    for (; i < n_samples; ++i) {
        x = i * 2 / n_samples - 1;
        curve[i] = (3 + k) * x * 20 * deg / (Math.PI + k * Math.abs(x));
    }
    return curve;
};
distortion.curve = makeDistortionCurve(400);
distortion.oversample = '4x';

const biquadFilter = new BiquadFilterNode(audioContext);
biquadFilter.type = "lowpass";
biquadFilter.frequency.setValueAtTime(700, audioContext.currentTime);



// Se conecta el audio graph del audio souce/input al nodo de ganancia, y luego al de salida
track.connect(gainNode).connect(biquadFilter).connect(distortion).connect(audioContext.destination);

playBtn.addEventListener('click', function () {
    let arrProps = [['on', 'off'], ['true', 'false']];
    let option = (playBtn.dataset.play === 'off') ? 0 : 1;
    playBtn.dataset.play = arrProps[0][option];
    playBtn.setAttribute('aria-pressed', arrProps[1][option]);
});
playBtn.addEventListener('click', function () {
    if (audioContext.state === 'suspended') audioElement.resume();
    if (playBtn.dataset.play === 'on') audioElement.play();
    else audioElement.pause();
});
audioElement.addEventListener('ended', () => {
    playBtn.dataset.play = 'off';
    playBtn.setAttribute('aria-pressed', 'false');
});
volumenInput.addEventListener('input', function () {
    gainNode.gain.value = this.value;
    labelVolumeValue.textContent = this.value;
});