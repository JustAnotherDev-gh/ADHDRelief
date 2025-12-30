// Custom Sounds Manager for ADHDRelief
// Handles IndexedDB storage and retrieval of custom audio files

const DB_NAME = 'ADHDReliefDB';
const DB_VERSION = 1;
const STORE_NAME = 'customSounds';

let db = null;

// Initialize IndexedDB
async function initDB() {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // Create object store if it doesn't exist
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = database.createObjectStore(STORE_NAME, { keyPath: 'id' });
        objectStore.createIndex('name', 'name', { unique: false });
        objectStore.createIndex('order', 'order', { unique: false });
      }
    };
  });
}

// Save custom sound to IndexedDB
async function saveCustomSound(id, name, audioBlob, order) {
  await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const sound = {
      id,
      name,
      audioData: audioBlob,
      order,
      createdAt: Date.now()
    };

    const request = store.put(sound);

    request.onsuccess = () => resolve(sound);
    request.onerror = () => reject(request.error);
  });
}

// Get all custom sounds
async function getAllCustomSounds() {
  await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const sounds = request.result;
      // Sort by order
      sounds.sort((a, b) => a.order - b.order);
      resolve(sounds);
    };
    request.onerror = () => reject(request.error);
  });
}

// Get custom sound by ID
async function getCustomSound(id) {
  await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Delete custom sound
async function deleteCustomSound(id) {
  await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Update sound order
async function updateSoundOrder(sounds) {
  await initDB();

  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);

  const promises = sounds.map((sound, index) => {
    return new Promise((resolve, reject) => {
      sound.order = index;
      const request = store.put(sound);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });

  return Promise.all(promises);
}

// Export functions
window.customSoundsDB = {
  saveCustomSound,
  getAllCustomSounds,
  getCustomSound,
  deleteCustomSound,
  updateSoundOrder
};
