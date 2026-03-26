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

        const [tassiSnap, sanzioniSnap, calcoliSnap, utentiSnap] = await Promise.all([
            getDocs(collection(db, "tassi")),
            getDocs(collection(db, "sanzioni")),
            getDocs(collection(db, "calcoli")),
            getDocs(collection(db, "users")),
        ]);

        // Tasso corrente (anno in corso)
        const currentYear = new Date().getFullYear();
        const tassiData = tassiSnap.docs.map(d => d.data());
        const tassoCorrente = tassiData.find((t: any) => t.anno === currentYear);

        // Calcoli recenti (ultimi 5)
        const calcoli = calcoliSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        calcoli.sort((a: any, b: any) => {
            const dateA = a.createdAt?.toDate?.() || new Date(0);
            const dateB = b.createdAt?.toDate?.() || new Date(0);
            return dateB.getTime() - dateA.getTime();
        });

        return NextResponse.json({
            totaleTassi: tassiSnap.size,
            totaleSanzioni: sanzioniSnap.size,
            totaleCalcoli: calcoliSnap.size,
            totaleUtenti: utentiSnap.size,
            tassoCorrente: tassoCorrente || null,
            calcoliRecenti: calcoli.slice(0, 5),
        });
    } catch (error) {
        console.error("Stats error:", error);
        return NextResponse.json({ error: "Errore lettura statistiche" }, { status: 500 });
    }
}
