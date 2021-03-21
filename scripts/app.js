const audioElement = document.getElementById('audio-sample');
const playBtn = document.getElementById('play-btn');
const volumenInput = document.getElementById('vol-range');
const labelVolumeValue = document.getElementById('label-vol-value');
let audioContext, track, gainNode;

function playSample() {
    if (audioContext === undefined) audioContext = new AudioContext();
    else if (audioContext?.state === 'suspended') audioContext.resume();
    if (track === undefined) {
        track = audioContext.createMediaElementSource(audioElement);
        gainNode = audioContext.createGain();
        track.connect(audioContext.destination);
    }
};
playBtn.addEventListener('click', function () {
    let arrProps = [['on', 'off'], ['true', 'false']];
    let option = (playBtn.dataset.play === 'off') ? 0 : 1;
    playBtn.dataset.play = arrProps[0][option];
    playBtn.setAttribute('aria-pressed', arrProps[1][option]);
});
playBtn.addEventListener('click', function () {
    playSample();
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

// Effects UI
const effectsButtons = document.getElementsByClassName('effect-btn');
Array.from(effectsButtons).forEach(btn => {
    btn.addEventListener('click', function () {
        btn.dataset.on = (btn.dataset.on === 'true')
            ? 'false'
            : 'true';
    });
});
const filterType = document.getElementById('filter-type');
const filterFreqInput = document.getElementById('filter-freq-input');
const filterFreqInputValue = document.getElementById('filter-freq-value');
const filterQInput = document.getElementById('filter-q-input');
const filterQInputValue = document.getElementById('filter-q-value');
const filterGainInput = document.getElementById('filter-gain-input');
const filterGainInputValue = document.getElementById('filter-gain-value');

filterType.addEventListener('input', function () {
    if (audioContext === undefined) return;
    biquadFilter.type = this.value
});
filterFreqInput.addEventListener('input', function () {
    if (audioContext === undefined) return;
    filterFreqInputValue.textContent = this.value;
    biquadFilter.frequency.setValueAtTime(+this.value, audioContext.currentTime);
});
filterQInput.addEventListener('input', function () {
    if (audioContext === undefined) return;
    filterQInputValue.textContent = this.value;
    biquadFilter.Q.setValueAtTime(+this.value, audioContext.currentTime);
});
filterGainInput.addEventListener('input', function () {
    if (audioContext === undefined) return;
    filterGainInputValue.textContent = this.value;
    biquadFilter.gain.setValueAtTime(+this.value, audioContext.currentTime);
});

// Connect & Disconnect Effects

// Filter Fx
const filterBtn = document.getElementById('filter-button');
let biquadFilter;
filterBtn.addEventListener('click', function () {
    if (audioContext === undefined) return;
    if (biquadFilter === undefined) {
        biquadFilter = new BiquadFilterNode(audioContext);
    }
    if (this.dataset.on === "true") {
        connectEffects();
    } else {
        track.disconnect();
        track.connect(audioContext.destination);
    }
});
function connectEffects() {
    let effectsOn = [];
    Array.from(effectsButtons).forEach(btn => {
        if (btn.dataset.on === 'true') {    
            let btnType = (btn.dataset.name === 'filter')
                 ? biquadFilter
                 : biquadFilter;
            let effectObject = { 'btnOrder': +btn.dataset.order, 'btnType' : btnType};
            effectsOn.push(effectObject);
        }
    });
    effectsOn.sort((a, b) => b.btnOrder - a.btnOrder);
    track.disconnect();
    let lastObject = track;
    for (let index = 0; index < effectsOn.length; index++) {
        let fx = effectsOn[index].btnType;
        lastObject.connect(fx);
        lastObject = fx;
        if (index + 1 ===  effectsOn.length) lastObject.connect(audioContext.destination);
    };
    
}
/* Quizá lo más correcto, sería tener estas funciones que creen los nodos de filtros y efectos
pero otra que detecte cuáles de los pedales tienen el valor del data-set-on y que según ello
pues vaya conectando */
/* podría agregar un dataset con el valor del orden en que debería ser conectado ese pedal al track
meterlos al array de effectson hacer un sort por ese valor, y luego ir conectando forEach
y una vez termine conectar al audiocontext.destination */
/*

const distortion = audioContext.createWaveShaper();

function makeDistortionCurve(amount) {
    let k = (typeof amount === 'number')
        ? amount
        : 50;
    let n_samples = 44100;
    let curve = new Float32Array(n_samples);
    const DEG = Math.PI / 180
    let x = 0;
    for (let i = 0; i < n_samples; ++i) {
        x = i * 2 / n_samples - 1;
        curve[i] = (3 + k) * x * 20 * DEG / (Math.PI + k * Math.abs(x));
    }
    return curve;
};
distortion.curve = makeDistortionCurve(0);
distortion.oversample = '4x'; */