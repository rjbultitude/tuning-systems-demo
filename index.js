'use strict';
const freqi = require('freqi');

const intervals = [0, 3, 5, 7, 11, 12];
const startFreq = 440;
const noteLength = 1000;

const scaleConfigEqTemp = {
  startFreq,
  intervals
};

const scaleConfigFiveLimit = {
  startFreq,
  intervals,
  mode: 'fiveLimit'
};

const scaleConfigPythag = {
    startFreq,
    intervals,
    mode: 'pythagorean'
  };

const scaleFreqsEqTemp = freqi.getFreqs(scaleConfigEqTemp);
const scaleFreqsFiveLimit = freqi.getFreqs(scaleConfigFiveLimit);
const scaleFreqsPythag = freqi.getFreqs(scaleConfigPythag);

const playBtn = document.getElementById('play');
const stopBtn = document.getElementById('stop');
let connected = false;
let setup = false;
let context;
const oscillators = [];
const gains = [];
let oscillatorEqTemp;
let oscillatorFiveLimit;
let oscillatorPythag;
// set interval var
let myInterval;

// global counter for playback
let globalIndex = 0;

// depends on global intervals
function incrementIndex() {
  if (globalIndex >= intervals.length - 1) {
    globalIndex = 0;
  } else {
    globalIndex += 1;
  }
}

function setOscType(oscillators) {
  for (let index = 0; index < oscillators.length; index++) {
    oscillators[index].type = 'triangle';
  }
}

function startOscs(oscillators) {
  for (let index = 0; index < oscillators.length; index++) {
    oscillators[index].start();
  }
}

function setUpAudio() {
  // define audio context
  context = new (window.AudioContext || window.webkitAudioContext)();
  oscillatorEqTemp = context.createOscillator();
  oscillatorFiveLimit = context.createOscillator();
  oscillatorPythag = context.createOscillator();
  // For batch operations only
  oscillators.push(oscillatorEqTemp, oscillatorFiveLimit, oscillatorPythag);
  for (let index = 0; index < oscillators.length; index++) {
    gains.push(context.createGain());
  }
  // configure all oscillators
  setOscType(oscillators);
  startOscs(oscillators);
  setup = true;
}

function connectOscs(oscillators) {
  for (let index = 0; index < oscillators.length; index++) {
    oscillators[index].connect(gains[index]);
    gains[index].connect(context.destination);
  }
}

function setAllOscFreqs() {
  const eqTempFreq = scaleFreqsEqTemp[globalIndex];
  oscillatorEqTemp.frequency.value = eqTempFreq;
  const diatonicFreq = scaleFreqsFiveLimit[globalIndex];
  oscillatorFiveLimit.frequency.value = diatonicFreq;
  const pythagFreq = scaleFreqsPythag[globalIndex];
  oscillatorPythag.frequency.value = pythagFreq;
  for (let index = 0; index < gains.length; index++) {
    gains[index].gain.value = 0.4 - index / 10;
  }
  if (!connected) {
    connectOscs(oscillators);
    connected = true;
  }
  incrementIndex();
}

function stop() {
  for (let index = 0; index < oscillators.length; index++) {
    oscillators[index].disconnect(gains[index]);
    connected = false;
  }
  clearInterval(myInterval);
}

playBtn.addEventListener('click', function(e) {
  e.preventDefault();
  if (!setup) {
    setUpAudio();
  }
  // Set the osc freqs
  setAllOscFreqs();
  // Create loop in time
  myInterval = setInterval(function() {
    setAllOscFreqs();
  }, noteLength || 300);
});

stopBtn.addEventListener('click', function(e) {
  e.preventDefault();
  if (connected) {
    stop();
  }
});
