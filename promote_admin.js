import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBVBLxCJXyawi9zoWWkvorOECIlaHiXif0",
    authDomain: "bcs-ai-suite-2026-v1.firebaseapp.com",
    projectId: "bcs-ai-suite-2026-v1",
    storageBucket: "bcs-ai-suite-2026-v1.firebasestorage.app",
    messagingSenderId: "198311773097",
    appId: "1:198311773097:web:4df48fe2de7ad21c6f7ab8"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function promoteToAdmin(email) {
    console.log(`Searching for user with email: ${email}...`);
    try {
        const q = query(collection(db, 'users'), where('email', '==', email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log(`No user found with email: ${email}. Ensure the user has actually registered on the signup page.`);
            return;
        }

        const userDoc = querySnapshot.docs[0];
        const uid = userDoc.id;
        console.log(`Found user! UID: ${uid}. Promoting to admin...`);

        await updateDoc(doc(db, 'users', uid), {
            role: 'admin'
        });

        console.log(`Success! ${email} is now an ADMIN.`);
    } catch (error) {
        console.error("Error promoting user:", error);
    }
    process.exit(0);
}

promoteToAdmin('avv.sapone@hotmail.it');
