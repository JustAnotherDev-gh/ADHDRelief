// Noise Generator for ADHD Relief
// Runs in offscreen document to provide audio context
// Supports: Brown, Pink, Grey noise, Rain, Ocean Surf, Forest Waterfall, and Lofi Loop

// Audio state
let audioContext = null;
let noiseSource = null;
let gainNode = null;
let isPlaying = false;
let currentVolume = 50; // 0-100
let currentNoiseType = 'brown'; // 'brown', 'pink', 'grey', 'rain', 'oceansurf', 'forestwaterfall', 'lofiloop'
let fadeTimeout = null;

// Lofi loop state
let lofiBuffers = []; // Array to store all 6 lofi track buffers
let currentLofiIndex = 0; // Track which lofi track is currently playing

const FADE_DURATION = 0.5; // 500ms - default fade
const TIMER_FADE_DURATION = 5.0; // 5 seconds - gradual fade for timer breaks
const BUFFER_SIZE = 2; // 2 seconds of audio
const SAMPLE_RATE = 44100;

// Generate brown noise using random walk algorithm
function generateBrownNoise(bufferSize) {
  const output = new Float32Array(bufferSize);
  let lastOut = 0.0;

  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    output[i] = (lastOut + (0.02 * white)) / 1.02;
    lastOut = output[i];
    output[i] *= 3.5; // Compensate for quieter brown noise
  }

  return output;
}

// Generate pink noise using Voss-McCartney algorithm
function generatePinkNoise(bufferSize) {
  const output = new Float32Array(bufferSize);
  const numGenerators = 16; // More generators = better pink noise quality
  const generators = new Float32Array(numGenerators);

  // Initialize generators
  for (let i = 0; i < numGenerators; i++) {
    generators[i] = Math.random() * 2 - 1;
  }

  for (let i = 0; i < bufferSize; i++) {
    // Update random generators at different rates (powers of 2)
    for (let j = 0; j < numGenerators; j++) {
      if (i % (1 << j) === 0) {
        generators[j] = Math.random() * 2 - 1;
      }
    }

    // Sum all generators
    let sum = 0;
    for (let j = 0; j < numGenerators; j++) {
      sum += generators[j];
    }

    output[i] = sum / numGenerators;
  }

  // Normalize to prevent clipping
  let max = 0;
  for (let i = 0; i < bufferSize; i++) {
    const abs = Math.abs(output[i]);
    if (abs > max) max = abs;
  }

  if (max > 0) {
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (output[i] / max) * 0.5; // Scale to 50% to prevent clipping
    }
  }

  return output;
}

// Generate grey noise (psychoacoustically balanced)
function generateGreyNoise(bufferSize) {
  // Start with pink noise
  const pink = generatePinkNoise(bufferSize);
  const output = new Float32Array(bufferSize);

  // Apply simple high-shelf filter to approximate equal-loudness
  let lastOut = 0;
  for (let i = 0; i < bufferSize; i++) {
    const filtered = pink[i] + 0.3 * lastOut;
    output[i] = filtered;
    lastOut = filtered;
  }

  // Normalize
  let max = 0;
  for (let i = 0; i < bufferSize; i++) {
    const abs = Math.abs(output[i]);
    if (abs > max) max = abs;
  }

  if (max > 0) {
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (output[i] / max) * 0.5;
    }
  }

  return output;
}

// Load audio file from sounds directory
async function loadAudioFile(filename) {
  const audioUrl = chrome.runtime.getURL(`sounds/${filename}`);
  const response = await fetch(audioUrl);
  const arrayBuffer = await response.arrayBuffer();

  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  return await audioContext.decodeAudioData(arrayBuffer);
}

// Load custom audio file from IndexedDB
async function loadCustomAudioFile(customId) {
  console.log('[ADHD Relief] Loading custom audio:', customId);

  try {
    // Get custom sound from IndexedDB
    const customSound = await window.customSoundsDB.getCustomSound(customId);

    if (!customSound || !customSound.audioData) {
      console.error('[ADHD Relief] Custom audio not found:', customId);
      throw new Error(`Custom audio not found: ${customId}`);
    }

    // Convert blob to ArrayBuffer
    const arrayBuffer = await customSound.audioData.arrayBuffer();

    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    console.log('[ADHD Relief] Custom audio loaded successfully');
    return await audioContext.decodeAudioData(arrayBuffer);
  } catch (error) {
    console.error('[ADHD Relief] Error loading custom audio, will fall back to brown noise:', error);
    throw error;
  }
}

// Load all lofi tracks for sequential playback
async function loadLofiTracks() {
  if (lofiBuffers.length > 0) {
    console.log('[ADHD Relief] Lofi tracks already loaded');
    return lofiBuffers; // Already loaded
  }

  try {
    console.log('[ADHD Relief] Loading lofi tracks (MP3)...');
    // Load in playback order: lofi_3 -> lofi_1 -> lofi_5 -> lofi_2 -> lofi_6 -> lofi_4
    lofiBuffers = await Promise.all([
      loadAudioFile('lofi_3.mp3'),
      loadAudioFile('lofi_1.mp3'),
      loadAudioFile('lofi_5.mp3'),
      loadAudioFile('lofi_2.mp3'),
      loadAudioFile('lofi_6.mp3'),
      loadAudioFile('lofi_4.mp3')
    ]);
    console.log('[ADHD Relief] Successfully loaded all 6 lofi tracks');
    return lofiBuffers;
  } catch (error) {
    console.error('[ADHD Relief] Error loading lofi tracks:', error);
    lofiBuffers = []; // Reset on error
    throw error;
  }
}

// Create noise buffer based on type
async function createNoiseBuffer(type) {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  // Handle custom sounds (from IndexedDB)
  if (type.startsWith('custom_')) {
    return await loadCustomAudioFile(type);
  }

  // Handle built-in audio files
  if (type === 'rain') {
    return await loadAudioFile('rain.wav');
  }
  if (type === 'oceansurf') {
    return await loadAudioFile('ocean_surf.wav');
  }
  if (type === 'forestwaterfall') {
    return await loadAudioFile('forest-waterfall.wav');
  }

  // Generate synthetic noise
  const bufferSize = SAMPLE_RATE * BUFFER_SIZE;
  const buffer = audioContext.createBuffer(1, bufferSize, SAMPLE_RATE);
  const output = buffer.getChannelData(0);

  // Generate noise based on type
  let samples;
  switch (type) {
    case 'pink':
      samples = generatePinkNoise(bufferSize);
      break;
    case 'grey':
      samples = generateGreyNoise(bufferSize);
      break;
    case 'brown':
    default:
      samples = generateBrownNoise(bufferSize);
      break;
  }

  // Copy samples to buffer
  output.set(samples);

  return buffer;
}

// Initialize audio nodes
function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  // Resume context if suspended (required by browser autoplay policies)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  // Create gain node for volume and fade control
  if (!gainNode) {
    gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);
    gainNode.gain.value = 0; // Start at 0 for fade-in
  }
}

// Play next lofi track in sequence
function playNextLofiTrack(volume) {
  if (!isPlaying || currentNoiseType !== 'lofiloop') return;

  // Stop current source if exists
  if (noiseSource) {
    try {
      noiseSource.stop();
      noiseSource.disconnect();
    } catch (e) {
      // Ignore if already stopped
    }
  }

  // Create new source for next track
  noiseSource = audioContext.createBufferSource();
  noiseSource.buffer = lofiBuffers[currentLofiIndex];
  noiseSource.connect(gainNode);

  // Set up event to play next track when this one ends
  noiseSource.onended = () => {
    if (isPlaying && currentNoiseType === 'lofiloop') {
      currentLofiIndex = (currentLofiIndex + 1) % 6; // Loop: 0->1->2->3->4->5->0...
      const trackNames = ['lofi_3', 'lofi_1', 'lofi_5', 'lofi_2', 'lofi_6', 'lofi_4'];
      console.log(`[ADHD Relief] Playing ${trackNames[currentLofiIndex]}`);
      playNextLofiTrack(volume);
    }
  };

  noiseSource.start(0);
  const trackNames = ['lofi_3', 'lofi_1', 'lofi_5', 'lofi_2', 'lofi_6', 'lofi_4'];
  console.log(`[ADHD Relief] Started ${trackNames[currentLofiIndex]} (${currentLofiIndex + 1}/6)`);
}

// Start playing noise with fade-in
async function play(volume = currentVolume, noiseType = currentNoiseType, timerFade = false) {
  if (isPlaying) return;

  // Determine fade duration - use 5 seconds for timer breaks, otherwise use default
  const fadeDuration = timerFade ? TIMER_FADE_DURATION : FADE_DURATION;

  initAudio();

  // Update current noise type
  currentNoiseType = noiseType;

  // Handle lofi loop differently (sequential playback)
  if (noiseType === 'lofiloop') {
    try {
      await loadLofiTracks();
      currentLofiIndex = 0; // Start from first track

      // Set volume with fade-in
      const targetVolume = volume / 200;
      gainNode.gain.cancelScheduledValues(audioContext.currentTime);
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(targetVolume, audioContext.currentTime + fadeDuration);

      isPlaying = true;
      currentVolume = volume;

      // Start playing first lofi track
      playNextLofiTrack(volume);

      const fadeMsg = timerFade ? `with ${fadeDuration}s timer fade` : 'with fade-in';
      console.log(`[ADHD Relief] Lofi loop started ${fadeMsg}`);
      return;
    } catch (error) {
      console.error('[ADHD Relief] Failed to start lofi loop, falling back to forest waterfall:', error);
      // Fall through to standard playback with forest waterfall
      noiseType = 'forestwaterfall';
      currentNoiseType = 'forestwaterfall';
    }
  }

  // Standard playback for other sounds
  try {
    noiseSource = audioContext.createBufferSource();
    noiseSource.buffer = await createNoiseBuffer(noiseType);
    noiseSource.loop = true; // Seamless looping
    noiseSource.connect(gainNode);
    noiseSource.start(0);

    // Fade in (volume scaled: 100% = 0.5 for 2x quieter max volume)
    const targetVolume = volume / 200;
    gainNode.gain.cancelScheduledValues(audioContext.currentTime);
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(targetVolume, audioContext.currentTime + fadeDuration);

    isPlaying = true;
    currentVolume = volume;

    const fadeMsg = timerFade ? `with ${fadeDuration}s timer fade` : 'with fade-in';
    console.log(`[ADHD Relief] Audio started ${fadeMsg} (${noiseType} noise)`);
  } catch (error) {
    console.error('[ADHD Relief] Error playing sound, falling back to brown noise:', error);

    // If custom sound failed, fall back to brown noise
    if (noiseType.startsWith('custom_')) {
      currentNoiseType = 'brown';

      // Try again with brown noise
      noiseSource = audioContext.createBufferSource();
      noiseSource.buffer = await createNoiseBuffer('brown');
      noiseSource.loop = true;
      noiseSource.connect(gainNode);
      noiseSource.start(0);

      const targetVolume = volume / 200;
      gainNode.gain.cancelScheduledValues(audioContext.currentTime);
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(targetVolume, audioContext.currentTime + fadeDuration);

      isPlaying = true;
      currentVolume = volume;

      console.log('[ADHD Relief] Fallback to brown noise successful');
    } else {
      // Re-throw if it's not a custom sound issue
      throw error;
    }
  }
}

// Stop playing with fade-out
function stop() {
  if (!isPlaying) return;

  if (noiseSource) {
    // Fade out
    gainNode.gain.cancelScheduledValues(audioContext.currentTime);
    gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + FADE_DURATION);

    // Stop source after fade completes
    if (fadeTimeout) clearTimeout(fadeTimeout);
    fadeTimeout = setTimeout(() => {
      if (noiseSource) {
        noiseSource.stop();
        noiseSource.disconnect();
        noiseSource = null;
      }
      isPlaying = false;
      console.log('[ADHD Relief] Audio stopped with fade-out');
    }, FADE_DURATION * 1000);
  }
}

// Update volume with smooth transition
function setVolume(volume) {
  currentVolume = volume;

  if (isPlaying && gainNode) {
    const targetVolume = volume / 200; // Scaled: 100% = 0.5 for 2x quieter max volume
    gainNode.gain.cancelScheduledValues(audioContext.currentTime);
    gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(targetVolume, audioContext.currentTime + 0.1);
  }
}

// Change noise type (switches noise while playing or stopped)
async function changeNoiseType(noiseType) {
  currentNoiseType = noiseType;

  // If playing, restart with new noise type
  if (isPlaying) {
    const volume = currentVolume;
    stop();

    // Wait for fade-out to complete before starting new noise
    await new Promise(resolve => setTimeout(resolve, FADE_DURATION * 1000));

    // Start new noise type
    await play(volume, noiseType);
  }

  console.log(`[ADHD Relief] Noise type changed to ${noiseType}`);
}

// Message handler for communication with service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Only handle messages meant for offscreen document
  const handledTypes = [
    'PLAY', 'STOP', 'SET_VOLUME', 'CHANGE_NOISE_TYPE', 'GET_STATE'
  ];

  if (!handledTypes.includes(message.type)) {
    // Silently ignore messages meant for other parts of the extension
    return false;
  }

  console.log('[ADHD Relief] Offscreen received message:', message);

  // Handle async operations properly
  (async () => {
    try {
      switch (message.type) {
        case 'PLAY':
          await play(
            message.volume || currentVolume,
            message.noiseType || currentNoiseType,
            message.timerFade || false
          );
          sendResponse({ success: true, isPlaying: true });
          break;

        case 'STOP':
          stop();
          sendResponse({ success: true, isPlaying: false });
          break;

        case 'SET_VOLUME':
          setVolume(message.volume);
          sendResponse({ success: true, volume: currentVolume });
          break;

        case 'CHANGE_NOISE_TYPE':
          await changeNoiseType(message.noiseType);
          sendResponse({ success: true, noiseType: currentNoiseType });
          break;

        case 'GET_STATE':
          sendResponse({
            success: true,
            isPlaying,
            volume: currentVolume,
            noiseType: currentNoiseType
          });
          break;
      }
    } catch (error) {
      console.error('[ADHD Relief] Error handling message:', error);
      sendResponse({ success: false, error: error.message });
    }
  })();

  return true; // Keep message channel open for async response
});

console.log('[ADHD Relief] Audio generator initialized');
