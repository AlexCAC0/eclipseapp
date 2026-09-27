/**
 * ==============================================================================
 * ECLIPSE STUDIO APP - Configuración de Firebase Realtime Database
 * ==============================================================================
 * Pega aquí las credenciales que obtienes de la consola de Firebase:
 * https://console.firebase.google.com/
 *
 * Pasos:
 * 1. Crea un proyecto en Firebase.
 * 2. Ve a Realtime Database -> Crear base de datos (Modo de prueba).
 * 3. Ve a Configuración de Proyecto (⚙️) -> Tus apps -> Web (</>).
 * 4. Copia el objeto firebaseConfig y pégalo abajo.
 * ==============================================================================
 */

const firebaseConfig = {
  apiKey: "PEGA_AQUI_TU_API_KEY",
  authDomain: "TU_PROYECTO.firebaseapp.com",
  databaseURL: "https://TU_PROYECTO-default-rtdb.firebaseio.com",
  projectId: "TU_PROYECTO",
  storageBucket: "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

// Indica si el usuario ya configuró sus claves de Firebase
function isFirebaseConfigured() {
  return firebaseConfig && 
         firebaseConfig.apiKey && 
         !firebaseConfig.apiKey.includes("PEGA_AQUI") &&
         firebaseConfig.databaseURL &&
         !firebaseConfig.databaseURL.includes("TU_PROYECTO");
}
