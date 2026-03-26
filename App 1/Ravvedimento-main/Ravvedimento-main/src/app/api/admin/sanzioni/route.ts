import { NextRequest, NextResponse } from "next/server";
import { initFirebase } from "@/lib/firebase/client";
import { getFirestore, collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";

function getDB() {
    const { app } = initFirebase();
    return getFirestore(app);
}

export async function GET() {
    try {
        const db = getDB();
        const snapshot = await getDocs(collection(db, "sanzioni"));
        const sanzioni = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        sanzioni.sort((a: any, b: any) => a.giorniDa - b.giorniDa);
        return NextResponse.json(sanzioni);
    } catch (error) {
        console.error("Error fetching sanzioni:", error);
        return NextResponse.json({ error: "Errore lettura sanzioni" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const db = getDB();
        const docRef = await addDoc(collection(db, "sanzioni"), data);
        return NextResponse.json({ id: docRef.id, ...data });
    } catch (error) {
        console.error("Error creating sanzione:", error);
        return NextResponse.json({ error: "Errore creazione sanzione" }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { id, ...data } = await request.json();
        const db = getDB();
        await updateDoc(doc(db, "sanzioni", id), data);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating sanzione:", error);
        return NextResponse.json({ error: "Errore aggiornamento sanzione" }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json();
        const db = getDB();
        await deleteDoc(doc(db, "sanzioni", id));
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting sanzione:", error);
        return NextResponse.json({ error: "Errore eliminazione sanzione" }, { status: 500 });
    }
}
