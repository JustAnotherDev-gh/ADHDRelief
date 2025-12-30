// Service Worker for ADHD Relief
// Manages state, timer, and offscreen document lifecycle

const OFFSCREEN_DOCUMENT_PATH = 'offscreen/offscreen.html';
const TIMER_ALARM = 'adhdrelief-timer';

// Default state
const DEFAULT_STATE = {
  isPlaying: false,
  mode: 'constant', // 'constant' (continuous) or 'break'
  noiseType: 'forestwaterfall', // 'brown', 'pink', 'grey', 'rain', 'oceansurf', 'forestwaterfall', 'lofiloop'
  volume: 50,
  timerState: {
    preset: '25/5', // '25/5', '50/10', 'custom'
    focusDuration: 25, // minutes
    breakDuration: 5, // minutes
    currentPhase: 'focus', // 'focus' or 'break'
    timeRemaining: 25 * 60, // seconds
    isActive: false
  }
};

let currentState = { ...DEFAULT_STATE };
let offscreenCreated = false;

// Initialize extension
async function initialize(resumeAudio = false) {
  console.log('[ADHD Relief] Service worker initializing... (resumeAudio:', resumeAudio, ')');

  // Load saved state
  const stored = await chrome.storage.local.get(null);
  if (stored && Object.keys(stored).length > 0) {
    currentState = { ...DEFAULT_STATE, ...stored };

    // Always set isPlaying to false on initialization unless explicitly resuming
    // This prevents auto-play on browser startup
    const wasPlaying = currentState.isPlaying;
    if (!resumeAudio) {
      currentState.isPlaying = false;
      // Save the updated state immediately to persist isPlaying: false
      await saveState();
    }

    console.log('[ADHD Relief] Loaded state:', currentState);

    // Resume audio only if resumeAudio is true AND it was playing
    if (resumeAudio && wasPlaying) {
      await ensureOffscreenDocument();
      await sendToOffscreen({ type: 'PLAY', volume: currentState.volume, noiseType: currentState.noiseType });
    }

    // Resume timer if it was active
    if (currentState.timerState.isActive) {
      startTimerAlarm();
    }
  } else {
    // First run - save default state
    await saveState();
  }
}

// Save current state to storage
async function saveState() {
  await chrome.storage.local.set(currentState);
  console.log('[ADHD Relief] State saved:', currentState);
}

// Ensure offscreen document exists
async function ensureOffscreenDocument() {
  try {
    // Always check if offscreen document already exists (flag can be lost on service worker restart)
    const existingContexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT'],
      documentUrls: [chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH)]
    });

    if (existingContexts.length > 0) {
      offscreenCreated = true;
      console.log('[ADHD Relief] Offscreen document already exists');
      return;
    }

    // Create offscreen document if it doesn't exist
    await chrome.offscreen.createDocument({
      url: OFFSCREEN_DOCUMENT_PATH,
      reasons: ['AUDIO_PLAYBACK'],
      justification: 'Generate brown noise for focus assistance'
    });

    offscreenCreated = true;
    console.log('[ADHD Relief] Offscreen document created');
  } catch (error) {
    // If document already exists, just set the flag
    if (error.message.includes('Only a single offscreen document')) {
      offscreenCreated = true;
      console.log('[ADHD Relief] Offscreen document already exists (caught error)');
    } else {
      console.error('[ADHD Relief] Error creating offscreen document:', error);
    }
  }
}

// Send message to offscreen document
async function sendToOffscreen(message) {
  await ensureOffscreenDocument();

  // Add small delay to ensure offscreen document is fully loaded and ready
  await new Promise(resolve => setTimeout(resolve, 100));

  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        console.warn('[ADHD Relief] Message send failed:', chrome.runtime.lastError.message);
        resolve({ success: false, error: chrome.runtime.lastError.message });
        return;
      }
      resolve(response);
    });
  });
}

// Close offscreen document
async function closeOffscreenDocument() {
  if (!offscreenCreated) return;

  try {
    await chrome.offscreen.closeDocument();
    offscreenCreated = false;
    console.log('[ADHD Relief] Offscreen document closed');
  } catch (error) {
    console.error('[ADHD Relief] Error closing offscreen document:', error);
  }
}

// Play audio
async function play() {
  await ensureOffscreenDocument();
  await sendToOffscreen({
    type: 'PLAY',
    volume: currentState.volume,
    noiseType: currentState.noiseType
  });
  currentState.isPlaying = true;
  await saveState();
  broadcastStateUpdate();
}

// Play audio with timer fade (5 seconds gradual increase)
async function playWithTimerFade() {
  await ensureOffscreenDocument();
  await sendToOffscreen({
    type: 'PLAY',
    volume: currentState.volume,
    noiseType: currentState.noiseType,
    timerFade: true // Flag for 5-second gradual fade
  });
  currentState.isPlaying = true;
  await saveState();
  broadcastStateUpdate();
}

// Stop audio
async function stop() {
  if (!offscreenCreated) return;

  await sendToOffscreen({ type: 'STOP' });
  currentState.isPlaying = false;
  await saveState();
  broadcastStateUpdate();

  // Close offscreen document after a delay (in case user restarts quickly)
  setTimeout(async () => {
    if (!currentState.isPlaying) {
      await closeOffscreenDocument();
    }
  }, 5000);
}

// Toggle play/pause
async function togglePlay() {
  if (currentState.isPlaying) {
    await stop();
  } else {
    await play();
  }
}

// Set volume
async function setVolume(volume) {
  currentState.volume = Math.max(0, Math.min(100, volume));

  if (currentState.isPlaying) {
    await sendToOffscreen({ type: 'SET_VOLUME', volume: currentState.volume });
  }

  await saveState();
  broadcastStateUpdate();
}

// Switch mode
async function switchMode(mode) {
  const oldMode = currentState.mode;
  currentState.mode = mode;
  await saveState();
  broadcastStateUpdate();

  console.log(`[ADHD Relief] Mode switched from ${oldMode} to ${mode}`);

  // Handle mode-specific logic
  if (mode === 'break') {
    // In break mode, audio should be on during breaks, off during focus
    if (currentState.timerState.isActive) {
      const shouldPlay = currentState.timerState.currentPhase === 'break';
      if (shouldPlay && !currentState.isPlaying) {
        await play();
      } else if (!shouldPlay && currentState.isPlaying) {
        await stop();
      }
    }
  } else if (mode === 'constant') {
    // In continuous mode, respect the current playing state
    // (don't automatically change it)
  }
}

// Switch noise type
async function switchNoiseType(noiseType) {
  const oldType = currentState.noiseType;
  currentState.noiseType = noiseType;
  await saveState();
  broadcastStateUpdate();

  console.log(`[ADHD Relief] Noise type switched from ${oldType} to ${noiseType}`);

  // If audio is playing, update the noise type in offscreen document
  if (currentState.isPlaying && offscreenCreated) {
    await sendToOffscreen({
      type: 'CHANGE_NOISE_TYPE',
      noiseType: noiseType,
      volume: currentState.volume
    });
  }
}

// Start timer
async function startTimer() {
  currentState.timerState.isActive = true;
  currentState.timerState.currentPhase = 'focus';
  currentState.timerState.timeRemaining = currentState.timerState.focusDuration * 60;

  await saveState();
  startTimerAlarm();
  broadcastStateUpdate();

  // In break mode, stop audio during focus
  if (currentState.mode === 'break' && currentState.isPlaying) {
    await stop();
  }
}

// Stop timer
async function stopTimer() {
  currentState.timerState.isActive = false;
  await chrome.alarms.clear(TIMER_ALARM);
  await saveState();
  broadcastStateUpdate();
}

// Start timer alarm (ticks every second)
function startTimerAlarm() {
  chrome.alarms.create(TIMER_ALARM, {
    periodInMinutes: 1 / 60 // Every second
  });
}

// Handle timer tick
async function handleTimerTick() {
  if (!currentState.timerState.isActive) return;

  currentState.timerState.timeRemaining--;

  // Check if phase is complete
  if (currentState.timerState.timeRemaining <= 0) {
    await switchTimerPhase();
  }

  await saveState();
  broadcastStateUpdate();
}

// Switch between focus and break phases
async function switchTimerPhase() {
  const wasInFocus = currentState.timerState.currentPhase === 'focus';

  if (wasInFocus) {
    // Switch to break
    currentState.timerState.currentPhase = 'break';
    currentState.timerState.timeRemaining = currentState.timerState.breakDuration * 60;

    // In break mode, turn on audio during break with gradual 5-second fade
    if (currentState.mode === 'break' && !currentState.isPlaying) {
      await playWithTimerFade();
    }

    console.log('[ADHD Relief] Switched to break phase');
  } else {
    // Switch to focus
    currentState.timerState.currentPhase = 'focus';
    currentState.timerState.timeRemaining = currentState.timerState.focusDuration * 60;

    // In break mode, turn off audio during focus
    if (currentState.mode === 'break' && currentState.isPlaying) {
      await stop();
    }

    console.log('[ADHD Relief] Switched to focus phase');
  }

  await saveState();
  broadcastStateUpdate();
}

// Update timer settings
async function updateTimerSettings(settings) {
  Object.assign(currentState.timerState, settings);

  // Update timeRemaining if not currently active
  if (!currentState.timerState.isActive) {
    currentState.timerState.timeRemaining = currentState.timerState.focusDuration * 60;
  }

  await saveState();
  broadcastStateUpdate();
}

// Broadcast state update to all connected clients (popup)
function broadcastStateUpdate() {
  chrome.runtime.sendMessage({
    type: 'STATE_UPDATE',
    state: currentState
  }, () => {
    // Check and ignore lastError (popup might not be open)
    if (chrome.runtime.lastError) {
      // Silently ignore - this is expected when popup is closed
    }
  });
}

// Handle messages from popup and keyboard shortcuts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[ADHD Relief] Service worker received message:', message);

  (async () => {
    switch (message.type) {
      case 'GET_STATE':
        sendResponse({ success: true, state: currentState });
        break;

      case 'PLAY':
        await play();
        sendResponse({ success: true });
        break;

      case 'STOP':
        await stop();
        sendResponse({ success: true });
        break;

      case 'TOGGLE_PLAY':
        await togglePlay();
        sendResponse({ success: true });
        break;

      case 'SET_VOLUME':
        await setVolume(message.volume);
        sendResponse({ success: true });
        break;

      case 'SWITCH_MODE':
        await switchMode(message.mode);
        sendResponse({ success: true });
        break;

      case 'SWITCH_NOISE_TYPE':
        await switchNoiseType(message.noiseType);
        sendResponse({ success: true });
        break;

      case 'START_TIMER':
        await startTimer();
        sendResponse({ success: true });
        break;

      case 'STOP_TIMER':
        await stopTimer();
        sendResponse({ success: true });
        break;

      case 'UPDATE_TIMER_SETTINGS':
        await updateTimerSettings(message.settings);
        sendResponse({ success: true });
        break;

      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  })();

  return true; // Keep message channel open for async response
});

// Handle keyboard shortcuts
chrome.commands.onCommand.addListener(async (command) => {
  console.log('[ADHD Relief] Keyboard command:', command);

  switch (command) {
    case 'toggle-play':
      await togglePlay();
      break;

    case 'switch-mode':
      const newMode = currentState.mode === 'constant' ? 'break' : 'constant';
      await switchMode(newMode);
      break;

    case 'volume-up':
      await setVolume(currentState.volume + 10);
      break;

    case 'volume-down':
      await setVolume(currentState.volume - 10);
      break;
  }
});

// Handle alarms (timer ticks)
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === TIMER_ALARM) {
    await handleTimerTick();
  }
});

// Initialize on install/update
chrome.runtime.onInstalled.addListener(() => {
  console.log('[ADHD Relief] Extension installed/updated');
  initialize(false); // Don't resume audio on install/update
});

// Initialize on startup - NEVER resume audio on browser startup
chrome.runtime.onStartup.addListener(() => {
  console.log('[ADHD Relief] Browser started');
  initialize(false); // Don't resume audio on browser startup
});

// Initialize immediately (service worker restart) - don't resume audio
initialize(false);
