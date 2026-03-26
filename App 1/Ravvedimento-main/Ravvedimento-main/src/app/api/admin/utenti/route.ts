import { NextResponse } from "next/server";
import { initFirebase } from "@/lib/firebase/client";
import { getFirestore, collection, getDocs } from "firebase/firestore";

function getDB() {
    const { app } = initFirebase();
    return getFirestore(app);
}

export async function GET() {
    try {
        const db = getDB();
        const snapshot = await getDocs(collection(db, "users"));
        const utenti = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        utenti.sort((a: any, b: any) => {
            const da = a.createdAt?.toDate?.() || new Date(0);
            const db2 = b.createdAt?.toDate?.() || new Date(0);
            return db2.getTime() - da.getTime();
        });
        return NextResponse.json(utenti);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Errore lettura utenti" }, { status: 500 });
    }
}
