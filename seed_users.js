import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
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
const auth = getAuth(app);
const db = getFirestore(app);

async function seedUsers() {
    console.log("Starting seed process...");

    const users = [
        {
            email: 'test@bcs-suite.com',
            password: 'password123',
            name: 'Test',
            surname: 'User',
            role: 'user'
        },
        {
            email: 'admin@bcs-suite.com',
            password: 'admin123',
            name: 'Admin',
            surname: 'Super',
            role: 'admin'
        }
    ];

    for (const user of users) {
        try {
            console.log(`Creating user: ${user.email}...`);
            let userCredential;
            try {
                userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
            } catch (e) {
                if (e.code === 'auth/email-already-in-use') {
                    console.log(`User ${user.email} already exists, signing in to update role/data...`);
                    userCredential = await signInWithEmailAndPassword(auth, user.email, user.password);
                } else {
                    throw e;
                }
            }

            const uid = userCredential.user.uid;

            console.log(`Setting Firestore data for ${user.email} (${uid})...`);
            await setDoc(doc(db, 'users', uid), {
                uid: uid,
                email: user.email,
                name: user.name,
                surname: user.surname,
                role: user.role,
                createdAt: serverTimestamp(),
                credits: user.role === 'admin' ? 999 : 6,
                subscriptionStatus: user.role === 'admin' ? 'active' : 'trial',
                trialEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year for these test users
            }, { merge: true });

            console.log(`Success: ${user.email}`);

        } catch (error) {
            console.error(`Failed to create ${user.email}:`, error);
        }
    }

    console.log("Seed process completed. Press Ctrl+C to exit if script doesn't terminate.");
    process.exit(0);
}

seedUsers();
