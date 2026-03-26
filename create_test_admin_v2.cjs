
const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

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

async function createTestAdmin() {
    const email = 'admin@bcs.com';
    const password = 'password123';

    try {
        console.log(`Creating ADMIN user ${email}...`);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log('User created in Auth:', user.uid);

        await setDoc(doc(db, 'users', user.uid), {
            email: email,
            role: 'admin', // ADMIN user
            name: 'Super Admin',
            createdAt: new Date(),
            credits: 9999,
            subscription: 'pro'
        });
        console.log('Admin document created in Firestore.');
        console.log('------------------------------------------------');
        console.log('CREDENZIALI ADMIN VALIDE:');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log('------------------------------------------------');
        process.exit(0);
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            console.log('Admin already exists. Can reuse:');
            console.log(`Email: ${email}`);
            console.log(`Password: ${password}`);
        } else {
            console.error('Error creating admin:', error);
        }
        process.exit(1);
    }
}

createTestAdmin();
