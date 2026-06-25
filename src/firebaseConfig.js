const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_APIKEY || process.env.VITE_APIKEY,
  authDomain:
    process.env.NEXT_PUBLIC_AUTHDOMAIN || process.env.VITE_AUTHDOMAIN,
  projectId:
    process.env.NEXT_PUBLIC_PROJECT_ID || process.env.VITE_PROJECT_ID,
  messagingSenderId:
    process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID ||
    process.env.VITE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_APP_ID || process.env.VITE_APP_ID,
};

export default firebaseConfig;
