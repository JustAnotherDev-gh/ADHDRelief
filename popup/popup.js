// Popup UI Controller for ADHD Relief

// Internationalization helper
function i18n(key) {
  return chrome.i18n.getMessage(key);
}

// Initialize i18n for all elements with data-i18n attributes
function initializeI18n() {
  // Translate all elements with data-i18n attribute
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    element.textContent = i18n(key);
  });

  // Translate placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    element.placeholder = i18n(key);
  });

  // Translate titles (tooltips)
  document.querySelectorAll('[data-i18n-title]').forEach(element => {
    const key = element.getAttribute('data-i18n-title');
    element.title = i18n(key);
  });

  // Translate aria-labels
  document.querySelectorAll('[data-i18n-aria-label]').forEach(element => {
    const key = element.getAttribute('data-i18n-aria-label');
    element.setAttribute('aria-label', i18n(key));
  });
}

// Call i18n initialization as soon as DOM is ready
initializeI18n();

let currentState = null;
let pendingAudioFile = null; // Store selected audio file temporarily

// Built-in sounds configuration
const BUILTIN_SOUNDS = [
  { id: 'forestwaterfall', name: i18n('soundForestWaterfall'), builtin: true },
  { id: 'rain', name: i18n('soundRain'), builtin: true },
  { id: 'oceansurf', name: i18n('soundOceanSurf'), builtin: true },
  { id: 'lofiloop', name: i18n('soundLofiLoop'), builtin: true },
  { id: 'brown', name: i18n('soundBrown'), builtin: true },
  { id: 'pink', name: i18n('soundPink'), builtin: true },
  { id: 'grey', name: i18n('soundGrey'), builtin: true }
];

// DOM Elements
const elements = {
  // Mode buttons
  modeConstantBtn: document.getElementById('mode-constant'),
  modeBreakBtn: document.getElementById('mode-break'),

  // Noise selector
  noiseSelector: document.getElementById('noise-selector'),

  // My Vibe (myVibeBtn is now created dynamically)
  audioFileInput: document.getElementById('audio-file-input'),
  nameDialog: document.getElementById('name-dialog'),
  vibeNameInput: document.getElementById('vibe-name-input'),
  nameSaveBtn: document.getElementById('name-save-btn'),
  nameCancelBtn: document.getElementById('name-cancel-btn'),

  // Play controls
  playBtn: document.getElementById('play-btn'),
  playIcon: document.querySelector('.play-icon'),
  pauseIcon: document.querySelector('.pause-icon'),
  playStatus: document.getElementById('play-status'),

  // Volume
  volumeSlider: document.getElementById('volume-slider'),
  volumeValue: document.getElementById('volume-value'),

  // Timer section
  timerSection: document.getElementById('timer-section'),
  currentPhase: document.getElementById('current-phase'),
  timerValue: document.getElementById('timer-value'),
  startTimerBtn: document.getElementById('start-timer-btn'),
  stopTimerBtn: document.getElementById('stop-timer-btn'),

  // Preset
  presetBtns: document.querySelectorAll('.preset-btn'),
  customSettings: document.getElementById('custom-settings'),
  focusDuration: document.getElementById('focus-duration'),
  breakDuration: document.getElementById('break-duration')
};

// Send message to service worker
async function sendMessage(message) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      resolve(response);
    });
  });
}

// Format seconds to MM:SS
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Update UI from state
function updateUI(state) {
  // Guard against undefined state
  if (!state) {
    console.warn('[ADHD Relief] updateUI called with undefined state');
    return;
  }

  currentState = state;

  // Update mode buttons and body class
  if (state.mode === 'constant') {
    elements.modeConstantBtn.classList.add('active');
    elements.modeBreakBtn.classList.remove('active');
    elements.timerSection.classList.add('hidden');
    document.body.classList.remove('break-mode');
  } else {
    elements.modeConstantBtn.classList.remove('active');
    elements.modeBreakBtn.classList.add('active');
    elements.timerSection.classList.remove('hidden');
    document.body.classList.add('break-mode');
  }

  // Update noise type buttons (now dynamic)
  if (state.noiseType) {
    document.querySelectorAll('.noise-btn').forEach(btn => {
      if (btn.dataset.noise === state.noiseType) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Update play/pause button
  if (state.isPlaying) {
    elements.playIcon.classList.add('hidden');
    elements.pauseIcon.classList.remove('hidden');
    elements.playStatus.textContent = i18n('statusPlaying');
  } else {
    elements.playIcon.classList.remove('hidden');
    elements.pauseIcon.classList.add('hidden');
    elements.playStatus.textContent = i18n('statusStopped');
  }

  // Update volume
  elements.volumeSlider.value = state.volume;
  elements.volumeValue.textContent = state.volume;

  // Update timer display
  if (state.timerState) {
    const { currentPhase, timeRemaining, isActive, focusDuration, breakDuration, preset } = state.timerState;

    // Update phase indicator
    elements.currentPhase.textContent = currentPhase === 'focus' ? i18n('phaseFocus') : i18n('phaseBreak');
    if (currentPhase === 'break') {
      elements.currentPhase.classList.add('break');
    } else {
      elements.currentPhase.classList.remove('break');
    }

    // Update timer display
    elements.timerValue.textContent = formatTime(timeRemaining);

    // Update timer buttons
    if (isActive) {
      elements.startTimerBtn.classList.add('hidden');
      elements.stopTimerBtn.classList.remove('hidden');
    } else {
      elements.startTimerBtn.classList.remove('hidden');
      elements.stopTimerBtn.classList.add('hidden');
    }

    // Update preset buttons
    elements.presetBtns.forEach(btn => {
      if (btn.dataset.preset === preset) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Show/hide custom settings
    if (preset === 'custom') {
      elements.customSettings.classList.remove('hidden');
    } else {
      elements.customSettings.classList.add('hidden');
    }

    // Update custom input values
    elements.focusDuration.value = focusDuration;
    elements.breakDuration.value = breakDuration;
  }
}

// Load initial state
async function loadState() {
  try {
    const response = await sendMessage({ type: 'GET_STATE' });

    if (response && response.success && response.state) {
      updateUI(response.state);
    } else {
      console.error('[ADHD Relief] Failed to load initial state. Response:', JSON.stringify(response));
      console.warn('[ADHD Relief] Service worker may not be ready. Extension UI will update when state is available.');
    }
  } catch (error) {
    console.error('[ADHD Relief] Error loading initial state:', error);
  }
}

// Mode switching
elements.modeConstantBtn.addEventListener('click', async () => {
  await sendMessage({ type: 'SWITCH_MODE', mode: 'constant' });
});

elements.modeBreakBtn.addEventListener('click', async () => {
  await sendMessage({ type: 'SWITCH_MODE', mode: 'break' });
});

// Noise type switching is now handled in renderSoundButtons()

// Play/Pause
elements.playBtn.addEventListener('click', async () => {
  await sendMessage({ type: 'TOGGLE_PLAY' });
});

// Volume control
elements.volumeSlider.addEventListener('input', async (e) => {
  const volume = parseInt(e.target.value);
  elements.volumeValue.textContent = volume;
  await sendMessage({ type: 'SET_VOLUME', volume });
});

// Timer controls
elements.startTimerBtn.addEventListener('click', async () => {
  await sendMessage({ type: 'START_TIMER' });
});

elements.stopTimerBtn.addEventListener('click', async () => {
  await sendMessage({ type: 'STOP_TIMER' });
});

// Preset selection
elements.presetBtns.forEach(btn => {
  btn.addEventListener('click', async () => {
    const preset = btn.dataset.preset;
    let settings = { preset };

    // Set durations based on preset
    switch (preset) {
      case '25/5':
        settings.focusDuration = 25;
        settings.breakDuration = 5;
        break;
      case '50/10':
        settings.focusDuration = 50;
        settings.breakDuration = 10;
        break;
      case 'custom':
        // Keep current values
        settings.focusDuration = parseInt(elements.focusDuration.value) || 25;
        settings.breakDuration = parseInt(elements.breakDuration.value) || 5;
        break;
    }

    await sendMessage({ type: 'UPDATE_TIMER_SETTINGS', settings });
  });
});

// Custom duration inputs
elements.focusDuration.addEventListener('change', async (e) => {
  const focusDuration = parseInt(e.target.value) || 25;
  await sendMessage({
    type: 'UPDATE_TIMER_SETTINGS',
    settings: { focusDuration, preset: 'custom' }
  });
});

elements.breakDuration.addEventListener('change', async (e) => {
  const breakDuration = parseInt(e.target.value) || 5;
  await sendMessage({
    type: 'UPDATE_TIMER_SETTINGS',
    settings: { breakDuration, preset: 'custom' }
  });
});

// Listen for state updates from service worker
chrome.runtime.onMessage.addListener((message) => {
  if (message && message.type === 'STATE_UPDATE' && message.state) {
    updateUI(message.state);
  }
});

// ========== CUSTOM SOUNDS (MY VIBE) ==========

// Render all sound buttons (built-in + custom) with drag-and-drop
async function renderSoundButtons() {
  try {
    const customSounds = await window.customSoundsDB.getAllCustomSounds();
    const allSounds = [...BUILTIN_SOUNDS, ...customSounds];

    elements.noiseSelector.innerHTML = '';

    allSounds.forEach((sound, index) => {
    const btn = document.createElement('button');
    btn.className = 'noise-btn';
    btn.dataset.noise = sound.id;
    btn.draggable = true;
    btn.dataset.index = index;

    // Add delete button for custom sounds
    if (!sound.builtin) {
      btn.innerHTML = `
        <span class="noise-btn-text">${sound.name}</span>
        <button class="delete-vibe-btn" data-id="${sound.id}" title="Delete">×</button>
      `;
    } else {
      btn.textContent = sound.name;
    }

    // Check if this is the active sound
    if (currentState && currentState.noiseType === sound.id) {
      btn.classList.add('active');
    }

    // Click handler
    btn.addEventListener('click', async (e) => {
      // Don't trigger if clicking delete button
      if (e.target.classList.contains('delete-vibe-btn')) {
        return;
      }
      await sendMessage({ type: 'SWITCH_NOISE_TYPE', noiseType: sound.id });
    });

    // Drag and drop handlers
    btn.addEventListener('dragstart', handleDragStart);
    btn.addEventListener('dragend', handleDragEnd);
    btn.addEventListener('dragover', handleDragOver);
    btn.addEventListener('drop', handleDrop);

    elements.noiseSelector.appendChild(btn);
  });

  // Add My Vibe button at the end
  const myVibeBtn = document.createElement('button');
  myVibeBtn.id = 'my-vibe-btn';
  myVibeBtn.className = 'my-vibe-btn';
  myVibeBtn.setAttribute('data-i18n-title', 'tooltipMyVibe');
  myVibeBtn.innerHTML = `
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
    <span data-i18n="btnMyVibe">My Vibe</span>
  `;
  myVibeBtn.addEventListener('click', () => {
    elements.audioFileInput.click();
  });
  elements.noiseSelector.appendChild(myVibeBtn);

  // Add delete event listeners
  document.querySelectorAll('.delete-vibe-btn').forEach(deleteBtn => {
    deleteBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = e.target.dataset.id;

      // Check if this sound is currently playing
      const isCurrentlyPlaying = currentState && currentState.noiseType === id;

      // Delete the custom sound
      await window.customSoundsDB.deleteCustomSound(id);

      // If it was playing, switch to forestwaterfall
      if (isCurrentlyPlaying) {
        await sendMessage({ type: 'SWITCH_NOISE_TYPE', noiseType: 'forestwaterfall' });
      }

      // Re-render buttons
      await renderSoundButtons();
    });
  });
  } catch (error) {
    console.error('[ADHD Relief] Error rendering sound buttons:', error);
  }
}

// Drag and drop state
let draggedElement = null;

function handleDragStart(e) {
  draggedElement = e.target;
  e.target.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging');
  draggedElement = null;
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';

  const afterElement = getDragAfterElement(elements.noiseSelector, e.clientY);
  if (afterElement == null) {
    elements.noiseSelector.appendChild(draggedElement);
  } else {
    elements.noiseSelector.insertBefore(draggedElement, afterElement);
  }
}

function handleDrop(e) {
  e.preventDefault();
  // Save new order
  saveButtonOrder();
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.noise-btn:not(.dragging)')];

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;

    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

async function saveButtonOrder() {
  const buttons = elements.noiseSelector.querySelectorAll('.noise-btn');
  const customSounds = await window.customSoundsDB.getAllCustomSounds();

  // Update order for custom sounds only
  const reorderedCustomSounds = [];
  buttons.forEach((btn, index) => {
    const soundId = btn.dataset.noise;
    const customSound = customSounds.find(s => s.id === soundId);
    if (customSound) {
      customSound.order = index;
      reorderedCustomSounds.push(customSound);
    }
  });

  if (reorderedCustomSounds.length > 0) {
    await window.customSoundsDB.updateSoundOrder(reorderedCustomSounds);
  }
}

// File selection handler (My Vibe button is now rendered dynamically)
elements.audioFileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Validate file type
  if (!file.type.startsWith('audio/')) {
    alert(i18n('errorInvalidFile'));
    return;
  }

  // Store file temporarily
  pendingAudioFile = file;

  // Show naming dialog
  elements.nameDialog.classList.remove('hidden');
  elements.vibeNameInput.value = '';
  elements.vibeNameInput.focus();

  // Clear file input for next time
  e.target.value = '';
});

// Name dialog - Save button
elements.nameSaveBtn.addEventListener('click', async () => {
  const name = elements.vibeNameInput.value.trim();

  if (!name) {
    alert(i18n('errorNameRequired'));
    return;
  }

  if (!pendingAudioFile) {
    return;
  }

  // Generate unique ID
  const id = `custom_${Date.now()}`;

  // Get next order number
  const customSounds = await window.customSoundsDB.getAllCustomSounds();
  const nextOrder = BUILTIN_SOUNDS.length + customSounds.length;

  // Save to IndexedDB
  try {
    await window.customSoundsDB.saveCustomSound(id, name, pendingAudioFile, nextOrder);
    console.log('[ADHD Relief] Custom sound saved:', name);

    // Re-render buttons
    await renderSoundButtons();

    // Hide dialog
    elements.nameDialog.classList.add('hidden');
    pendingAudioFile = null;
  } catch (error) {
    console.error('[ADHD Relief] Error saving custom sound:', error);
    alert(i18n('errorSaveFailed'));
  }
});

// Name dialog - Cancel button
elements.nameCancelBtn.addEventListener('click', () => {
  elements.nameDialog.classList.add('hidden');
  pendingAudioFile = null;
});

// Handle Enter key in name input
elements.vibeNameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    elements.nameSaveBtn.click();
  }
});

// ========== INITIALIZATION ==========

// Initialize popup
async function initialize() {
  await renderSoundButtons();
  await loadState();
}

initialize();
