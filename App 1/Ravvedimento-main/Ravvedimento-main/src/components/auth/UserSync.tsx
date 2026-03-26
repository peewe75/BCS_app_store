"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { getFirestoreDB } from "@/lib/firebase/client";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export function UserSync() {
    const { user, isLoaded } = useUser();

    useEffect(() => {
        async function syncUser() {
            if (isLoaded && user) {
                const db = getFirestoreDB();
                const userDocRef = doc(db, "users", user.id);
                const userDoc = await getDoc(userDocRef);

                if (!userDoc.exists()) {
                    // New user: Start 14-day trial
                    await setDoc(userDocRef, {
                        email: user.primaryEmailAddress?.emailAddress,
                        name: user.fullName,
                        trialStartDate: serverTimestamp(),
                        trialDays: 14,
                        plan: "trial",
                        createdAt: serverTimestamp(),
                    });
                }
            }
        }

        syncUser();
    }, [user, isLoaded]);

    return null;
}
