import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBVBLxCJXyawi9zoWWkvorOECIlaHiXif0",
    authDomain: "bcs-ai-suite-2026-v1.firebaseapp.com",
    projectId: "bcs-ai-suite-2026-v1",
    storageBucket: "bcs-ai-suite-2026-v1.firebasestorage.app",
    messagingSenderId: "198311773097",
    appId: "1:198311773097:web:4df48fe2de7ad21c6f7ab8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, 'default'); // Database name is 'default' for this project

async function promoteToAdminDirectly(uid, email) {
    console.log(`Setting admin role for UID: ${uid} (${email})...`);
    try {
        await setDoc(doc(db, 'users', uid), {
            email: email,
            name: "Avv.",
            surname: "Sapone",
            role: 'admin',
            credits: 100,
            subscriptionStatus: 'premium',
            createdAt: serverTimestamp()
        }, { merge: true });

        console.log(`Success! User ${email} is now an ADMIN in Firestore database 'default'.`);
    } catch (error) {
        console.error("Error promoting user:", error);
    }
    process.exit(0);
}

// UID found from browser session
promoteToAdminDirectly('9kaH17K9ShNgJ3Iwijca2ci1XGT2', 'avv.sapone@hotmail.it');
