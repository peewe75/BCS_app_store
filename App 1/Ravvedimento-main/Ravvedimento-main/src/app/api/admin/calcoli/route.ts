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
        const snapshot = await getDocs(collection(db, "calcoli"));
        const calcoli = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        calcoli.sort((a: any, b: any) => {
            const da = a.createdAt?.toDate?.() || new Date(0);
            const db2 = b.createdAt?.toDate?.() || new Date(0);
            return db2.getTime() - da.getTime();
        });
        return NextResponse.json(calcoli);
    } catch (error) {
        console.error("Error fetching calcoli:", error);
        return NextResponse.json({ error: "Errore lettura calcoli" }, { status: 500 });
    }
}
