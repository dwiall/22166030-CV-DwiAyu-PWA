const TokenElem = document.getElementById("token");
const ErrElem = document.getElementById("err");
const notificationButton = document.getElementById("notificationButton");
let swRegistration = null;

const config = {
  apiKey: "AIzaSyAU8vV7e4u20Nw7_trh-2EHHCWrAQ1IE1Q",
  authDomain: "dwi-pwa.firebaseapp.com",
  projectId: "dwi-pwa",
  storageBucket: "dwi-pwa.firebasestorage.app",
  messagingSenderId: "862981066547",
  appId: "1:862981066547:web:8802a50e46cc34dabd3846",
  measurementId: "G-FWDTGLP9EW",
};

firebase.initializeApp(config);
const messaging = firebase.messaging();

// IndexedDB
function initDB() {
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open("tokensDB", 1);

    dbRequest.onerror = () => {
      reject("Error membuka database");
    };

    dbRequest.onsuccess = () => {
      resolve(dbRequest.result);
    };

    dbRequest.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("tokens")) {
        db.createObjectStore("tokens", { keyPath: "id" });
      }
    };
  });
}

// Save token ke IndexedDB
async function saveTokenToIndexedDB(token) {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["tokens"], "readwrite");
      const store = transaction.objectStore("tokens");

      const request = store.put({ id: "fcmToken", token: token });

      request.onsuccess = () => {
        console.log("Token saved successfully");
        resolve();
      };
    });
  } catch (error) {
    console.error("Error di saveTokenToIndexedDB:", error);
    throw error;
  }
}

// ambil token ke IndexedDB
async function getTokenFromIndexedDB() {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["tokens"], "readonly");
      const store = transaction.objectStore("tokens");
      const request = store.get("fcmToken");

      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.token);
        } else {
          reject("Token tidak ada");
        }
      };
    });
  } catch (error) {
    console.error("Error di getTokenFromIndexedDB:", error);
    throw error;
  }
}

// Initialize UI
function initializeUi() {
  notificationButton.addEventListener("click", async () => {
    try {
      await displayNotification();
      await requestToken();
    } catch (error) {
      console.error("Error inisialisasi notifications:", error);
    }
  });
}

// Display a notification
async function displayNotification() {
  if (Notification.permission === "granted") {
    // Show a sample notification
    const notificationOptions = {
      body: "Welcome, Notification Successfully!",
      icon: "/dist/img/pp fix.png",
    };
    swRegistration.showNotification(
      "Portofolio | Dwi Ayu",
      notificationOptions
    );
  } else if (Notification.permission !== "denied") {
    await Notification.requestPermission();
  }
}

// Request token and handle IndexedDB
async function requestToken() {
  try {
    const token = await messaging.getToken();
    if (token) {
      await saveTokenToIndexedDB(token);
      TokenElem.textContent = "Token FCM: " + token;
      console.log("Token FCM:", token);
    } else {
      console.warn("Tidak ada token");
    }
  } catch (error) {
    if (Notification.permission === "denied") {
      alert("Izin notifikasi ditolak, silahkan cek kembali!");
    } else {
      console.error("Error mengambil token:", error);
    }
  }
}

// Initialize FCM and UI
navigator.serviceWorker
  .register("/firebase-messaging-sw.js")
  .then((registration) => {
    swRegistration = registration;
    initializeUi();
  })
  .catch((error) => {
    console.error("Service worker registration failed:", error);
  });
