'use strict';
const freqi = require('freqi');

const intervals = [0,2,5];
const startFreq = 440;

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

const scaleConfigTwentyTwoS = {
  startFreq,
  intervals,
  mode: 'twentyTwoShrutis'
};

const scaleFreqsEqTemp = freqi.getFreqs(scaleConfigEqTemp);
const scaleFreqsFiveLimit = freqi.getFreqs(scaleConfigFiveLimit);
const scaleFreqsPythag = freqi.getFreqs(scaleConfigPythag);
const scaleFreqsTwentyTwoS = freqi.getFreqs(scaleConfigTwentyTwoS);
const sequence = scaleFreqsEqTemp.concat(scaleFreqsFiveLimit, scaleFreqsPythag);

const playBtn = document.getElementById('play');
const stopBtn = document.getElementById('stop');
let connected = false;
let setup = false;
let context;
const oscillators = [];
const gains = [];
// set interval var
let myInterval;

// global counter for playback
let globalIndex = 0;

function setOscType(oscillators) {
  for (let index = 0; index < oscillators.length; index++) {
    oscillators[index].type = 'sine';
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
  for (let index = 0; index < intervals.length; index++) {
    oscillators.push(context.createOscillator());
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

function setAllOscFreqs(oscillators, intervals) {
  for (let index = 0; index < oscillators.length; index++) {
    oscillators[index].frequency.value = intervals[index];
    gains[index].gain.value = 0.4 - index / 10;
  }
  if (!connected) {
    connectOscs(oscillators);
    connected = true;
  }
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
  setAllOscFreqs(oscillators, scaleFreqsTwentyTwoS);
});

stopBtn.addEventListener('click', function(e) {
  e.preventDefault();
  if (connected) {
    stop();
  }
});
