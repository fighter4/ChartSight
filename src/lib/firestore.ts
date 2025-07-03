'use server';

import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp, orderBy, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import type { AnalyzeChartImageOutput } from '@/ai/flows/analyze-chart-image';

export type AnalysisRecord = {
  id?: string;
  userId: string;
  createdAt: any; // serverTimestamp
  imageDataUri: string;
  analysis: AnalyzeChartImageOutput | null;
  qa: { question: string, answer: string }[];
  feedback?: 'helpful' | 'unhelpful';
};

export async function saveNewAnalysis(data: { userId: string, imageDataUri: string, analysis: AnalyzeChartImageOutput | null }) {
    const docRef = await addDoc(collection(db, 'user_analyses'), {
        ...data,
        qa: [],
        createdAt: serverTimestamp()
    });
    return docRef.id;
}

export async function addQuestionAnswer(docId: string, qa: { question: string, answer: string }) {
    const docRef = doc(db, 'user_analyses', docId);
    await updateDoc(docRef, {
        qa: arrayUnion(qa)
    });
}

export async function saveAnalysisFeedback(docId: string, feedback: 'helpful' | 'unhelpful') {
    const docRef = doc(db, 'user_analyses', docId);
    await updateDoc(docRef, {
        feedback: feedback
    });
}

export async function getUserAnalyses(userId: string): Promise<AnalysisRecord[]> {
    const q = query(collection(db, 'user_analyses'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const analyses: AnalysisRecord[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        analyses.push({ 
            id: doc.id, 
            ...data,
            // Convert Firestore Timestamp to JSON-serializable format for client component
            createdAt: data.createdAt?.toDate().toISOString() ?? new Date().toISOString()
        } as AnalysisRecord);
    });
    return analyses;
}
