import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCTI2dSZFclP_pwjhVtsQVogPqLsL-lMnI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "mokshith-lab.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "mokshith-lab",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "mokshith-lab.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "64417266444",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:64417266444:web:d45b4a0fd26988af102729",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-XFKQ54CYXB",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

export interface InvoiceItem {
  name?: string;
  quantity?: number;
  rate?: number;
  amount?: number;
  hsn?: string;
  [key: string]: any;
}

export interface ExtractedInvoice {
  id?: string;
  vendor_name: string;
  gstin: string;
  invoice_number: string;
  invoice_date: string;
  taxable_amount: number;
  cgst: number;
  sgst: number;
  igst: number;
  total_gst: number;
  grand_total: number;
  hsn: string;
  items: InvoiceItem[] | any[];
  status?: string;
  createdAt?: any;
  fileName?: string;
  imagePreviewUrl?: string;
}

const INVOICES_COLLECTION = "invoices";

// Save invoice to Firestore
export async function saveInvoiceToFirebase(invoice: ExtractedInvoice): Promise<string> {
  try {
    const cleanData = {
      vendor_name: invoice.vendor_name || "",
      gstin: invoice.gstin || "",
      invoice_number: invoice.invoice_number || "",
      invoice_date: invoice.invoice_date || new Date().toISOString().split("T")[0],
      taxable_amount: Number(invoice.taxable_amount) || 0,
      cgst: Number(invoice.cgst) || 0,
      sgst: Number(invoice.sgst) || 0,
      igst: Number(invoice.igst) || 0,
      total_gst: Number(invoice.total_gst) || 0,
      grand_total: Number(invoice.grand_total) || 0,
      hsn: invoice.hsn || "",
      items: Array.isArray(invoice.items) ? invoice.items : [],
      status: "Accepted",
      createdAt: Timestamp.now(),
      fileName: invoice.fileName || "scanned_invoice.jpg",
    };

    const docRef = await addDoc(collection(db, INVOICES_COLLECTION), cleanData);
    return docRef.id;
  } catch (error) {
    console.error("Error saving invoice to Firestore:", error);
    throw error;
  }
}

// Fetch all invoices from Firestore
export async function getInvoicesFromFirebase(): Promise<ExtractedInvoice[]> {
  try {
    const q = query(collection(db, INVOICES_COLLECTION), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const invoices: ExtractedInvoice[] = [];

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      invoices.push({
        id: docSnap.id,
        vendor_name: data.vendor_name || "",
        gstin: data.gstin || "",
        invoice_number: data.invoice_number || "",
        invoice_date: data.invoice_date || "",
        taxable_amount: data.taxable_amount || 0,
        cgst: data.cgst || 0,
        sgst: data.sgst || 0,
        igst: data.igst || 0,
        total_gst: data.total_gst || 0,
        grand_total: data.grand_total || 0,
        hsn: data.hsn || "",
        items: data.items || [],
        status: data.status || "Accepted",
        createdAt: data.createdAt,
        fileName: data.fileName || "",
      });
    });

    return invoices;
  } catch (error) {
    console.error("Error getting invoices from Firestore:", error);
    // Fallback: try unordered if index issue
    try {
      const querySnapshot = await getDocs(collection(db, INVOICES_COLLECTION));
      const invoices: ExtractedInvoice[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        invoices.push({
          id: docSnap.id,
          vendor_name: data.vendor_name || "",
          gstin: data.gstin || "",
          invoice_number: data.invoice_number || "",
          invoice_date: data.invoice_date || "",
          taxable_amount: data.taxable_amount || 0,
          cgst: data.cgst || 0,
          sgst: data.sgst || 0,
          igst: data.igst || 0,
          total_gst: data.total_gst || 0,
          grand_total: data.grand_total || 0,
          hsn: data.hsn || "",
          items: data.items || [],
          status: data.status || "Accepted",
          createdAt: data.createdAt,
          fileName: data.fileName || "",
        });
      });
      return invoices;
    } catch (e) {
      console.error("Fallback fetch error:", e);
      return [];
    }
  }
}

// Delete invoice from Firestore
export async function deleteInvoiceFromFirebase(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, INVOICES_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting invoice:", error);
    throw error;
  }
}

// Update invoice in Firestore
export async function updateInvoiceInFirebase(id: string, invoice: Partial<ExtractedInvoice>): Promise<void> {
  try {
    const docRef = doc(db, INVOICES_COLLECTION, id);
    await updateDoc(docRef, invoice);
  } catch (error) {
    console.error("Error updating invoice:", error);
    throw error;
  }
}
