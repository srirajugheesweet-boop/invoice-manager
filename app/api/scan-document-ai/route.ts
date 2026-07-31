import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import crypto from "crypto";

// Generate GCP Access Token from Service Account credentials using Node built-in crypto
async function getGcpAccessToken(clientEmail: string, privateKey: string): Promise<string> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const header = { alg: "RS256", typ: "JWT" };
    const claimSet = {
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/cloud-platform",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    };

    const base64Url = (str: string) => Buffer.from(str).toString("base64url");
    const unsignedToken = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(claimSet))}`;

    const formattedKey = privateKey.replace(/\\n/g, "\n");
    const signer = crypto.createSign("RSA-SHA256");
    signer.update(unsignedToken);
    const signature = signer.sign(formattedKey, "base64url");

    const jwt = `${unsignedToken}.${signature}`;

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });

    const data = await res.json();
    return data.access_token || "";
  } catch (err) {
    console.warn("Failed to generate GCP access token:", err);
    return "";
  }
}

// Helper function to extract structured invoice data from Document AI OCR text
function extractDataFromOcrText(text: string, fileName: string) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  const gstinMatch = text.match(/\b\d{2}[A-Z]{5}\d{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}\b/i);
  const gstin = gstinMatch ? gstinMatch[0].toUpperCase() : "";

  const invMatch =
    text.match(/(?:Invoice|Inv|Bill|Doc|Ref)\s*(?:No|Num|Number|#)?[.:\s]*([A-Za-z0-9\/-]{3,20})/i) ||
    text.match(/#\s*([A-Za-z0-9\/-]{3,20})/);
  const invoice_number = invMatch ? invMatch[1] : "";

  const dateMatch =
    text.match(/\b(\d{1,2}[-/\.]\d{1,2}[-/\.]\d{2,4})\b/) ||
    text.match(/\b(\d{4}[-/\.]\d{1,2}[-/\.]\d{1,2})\b/);
  const invoice_date = dateMatch ? dateMatch[1] : new Date().toISOString().split("T")[0];

  const allAmounts: number[] = [];
  const amountMatches = text.matchAll(/(?:₹|Rs\.?|INR)?\s*(\d{1,7}(?:\.\d{1,2})?)/gi);
  for (const m of amountMatches) {
    const val = parseFloat(m[1]);
    if (val > 10 && val < 5000000 && !isNaN(val)) {
      allAmounts.push(val);
    }
  }

  let grand_total = 0;
  const totalMatch = text.match(/(?:Grand\s*Total|Total\s*Amount|Net\s*Payable|Total)\s*[:=]?\s*(?:₹|Rs\.?)?\s*(\d+(?:\.\d{1,2})?)/i);
  if (totalMatch) {
    grand_total = parseFloat(totalMatch[1]);
  } else if (allAmounts.length > 0) {
    grand_total = Math.max(...allAmounts);
  }

  let taxable_amount = 0;
  const taxableMatch = text.match(/(?:Taxable\s*Value|Taxable\s*Amount|Sub\s*Total|Subtotal)\s*[:=]?\s*(?:₹|Rs\.?)?\s*(\d+(?:\.\d{1,2})?)/i);
  if (taxableMatch) {
    taxable_amount = parseFloat(taxableMatch[1]);
  } else if (grand_total > 0) {
    taxable_amount = Math.round((grand_total / 1.18) * 100) / 100;
  }

  let cgst = 0;
  const cgstMatch = text.match(/CGST\s*[:=]?\s*(?:₹|Rs\.?)?\s*(\d+(?:\.\d{1,2})?)/i);
  if (cgstMatch) cgst = parseFloat(cgstMatch[1]);

  let sgst = 0;
  const sgstMatch = text.match(/SGST\s*[:=]?\s*(?:₹|Rs\.?)?\s*(\d+(?:\.\d{1,2})?)/i);
  if (sgstMatch) sgst = parseFloat(sgstMatch[1]);

  let igst = 0;
  const igstMatch = text.match(/IGST\s*[:=]?\s*(?:₹|Rs\.?)?\s*(\d+(?:\.\d{1,2})?)/i);
  if (igstMatch) igst = parseFloat(igstMatch[1]);

  let total_gst = cgst + sgst + igst;
  if (total_gst === 0 && grand_total > taxable_amount) {
    total_gst = Math.round((grand_total - taxable_amount) * 100) / 100;
    cgst = Math.round((total_gst / 2) * 100) / 100;
    sgst = Math.round((total_gst / 2) * 100) / 100;
  }

  let vendor_name = lines.length > 0 ? lines[0] : "Extracted Vendor";
  if (vendor_name.length < 3 || /tax|invoice|bill|gstin/i.test(vendor_name)) {
    vendor_name = lines[1] || "Extracted Vendor";
  }

  return {
    vendor_name,
    gstin,
    invoice_number,
    invoice_date,
    taxable_amount,
    cgst,
    sgst,
    igst,
    total_gst,
    grand_total,
    hsn: "",
    items: [
      {
        name: `${vendor_name} Supplied Goods`,
        quantity: 1,
        rate: taxable_amount,
        amount: taxable_amount,
        hsn: "",
      },
    ],
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      imageBase64,
      mimeType = "image/jpeg",
      fileName = "invoice.jpg",
      customProjectId,
      customLocation,
      customProcessorId,
      customApiKey,
    } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: "Image base64 data is required." },
        { status: 400 }
      );
    }

    const projectId =
      customProjectId ||
      process.env.DOCUMENT_AI_PROJECT_ID ||
      process.env.NEXT_PUBLIC_DOCUMENT_AI_PROJECT_ID ||
      "decoded-effect-503902-h6";

    const location =
      customLocation ||
      process.env.DOCUMENT_AI_LOCATION ||
      process.env.NEXT_PUBLIC_DOCUMENT_AI_LOCATION ||
      "us";

    const processorId =
      customProcessorId ||
      process.env.DOCUMENT_AI_PROCESSOR_ID ||
      process.env.NEXT_PUBLIC_DOCUMENT_AI_PROCESSOR_ID;

    // Separate Document AI Key vs Unrestricted Gemini API Key
    const documentAiApiKey = customApiKey || process.env.DOCUMENT_AI_API_KEY;
    const generalApiKey =
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      customApiKey ||
      process.env.DOCUMENT_AI_API_KEY;

    const clientEmail = process.env.DOCUMENT_AI_CLIENT_EMAIL || "";
    const privateKey = process.env.DOCUMENT_AI_PRIVATE_KEY || "";
    let bearerToken = process.env.DOCUMENT_AI_BEARER_TOKEN || "";

    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, "");

    let lastError = "";
    let extractedResult: any = null;

    // 1. If Service Account Email & Private Key exist, generate OAuth2 Bearer token automatically
    if (!bearerToken && clientEmail && privateKey) {
      bearerToken = await getGcpAccessToken(clientEmail, privateKey);
    }

    // 2. Attempt Google Document AI API call using Bearer Token
    if (processorId && bearerToken) {
      try {
        const endpoint = `https://${location}-documentai.googleapis.com/v1/projects/${projectId}/locations/${location}/processors/${processorId}:process`;

        const docAiRes = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${bearerToken}`,
          },
          body: JSON.stringify({
            rawDocument: {
              content: cleanBase64,
              mimeType,
            },
          }),
        });

        if (docAiRes.ok) {
          const resData = await docAiRes.json();
          const document = resData.document || {};
          const ocrText = document.text || "";
          const entities = document.entities || [];

          const getEntityValue = (types: string[]): string => {
            const match = entities.find((e: any) => types.includes(e.type));
            return match?.mentionText || match?.normalizedValue?.text || "";
          };

          const entityVendor = getEntityValue(["supplier_name", "vendor_name", "merchant_name"]);
          const entityGstin = getEntityValue(["supplier_tax_id", "vat_tax_id", "gstin"]);
          const entityInvoiceNo = getEntityValue(["invoice_id", "receipt_id", "document_id"]);
          const entityDate = getEntityValue(["invoice_date", "issue_date", "date"]);
          const entityTotal = parseFloat(getEntityValue(["total_amount", "net_amount", "amount"])) || 0;

          if (ocrText.length > 5) {
            const parsedOcr = extractDataFromOcrText(ocrText, fileName);
            extractedResult = {
              vendor_name: entityVendor || parsedOcr.vendor_name,
              gstin: entityGstin || parsedOcr.gstin,
              invoice_number: entityInvoiceNo || parsedOcr.invoice_number,
              invoice_date: entityDate || parsedOcr.invoice_date,
              taxable_amount: parsedOcr.taxable_amount,
              cgst: parsedOcr.cgst,
              sgst: parsedOcr.sgst,
              igst: parsedOcr.igst,
              total_gst: parsedOcr.total_gst,
              grand_total: entityTotal || parsedOcr.grand_total,
              hsn: parsedOcr.hsn,
              items: parsedOcr.items,
            };
          }
        } else {
          const errText = await docAiRes.text();
          console.warn("Document AI OAuth2 error:", errText);
          lastError = errText;
        }
      } catch (err: any) {
        console.warn("Document AI fetch error:", err?.message || err);
      }
    }

    // 3. Fallback to API-Key compatible Fast Document AI Engine (using general unrestricted API key)
    if (!extractedResult && generalApiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: generalApiKey });
        const modelsToTry = ["gemini-2.5-flash", "gemini-3.6-flash", "gemini-3.5-flash"];

        for (const modelName of modelsToTry) {
          try {
            const response = await ai.models.generateContent({
              model: modelName,
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `Extract GST invoice details from this image. Return JSON ONLY: {"vendor_name":"","gstin":"","invoice_number":"","invoice_date":"","taxable_amount":0,"cgst":0,"sgst":0,"igst":0,"total_gst":0,"grand_total":0,"hsn":"","items":[]}`,
                    },
                    {
                      inlineData: {
                        mimeType,
                        data: cleanBase64,
                      },
                    },
                  ],
                },
              ],
            });

            if (response && response.text) {
              const cleanedText = response.text.replace(/```json\n?|\n?```/g, "").trim();
              const parsed = JSON.parse(cleanedText);
              extractedResult = {
                vendor_name: parsed.vendor_name || "Unknown Vendor",
                gstin: parsed.gstin || "",
                invoice_number: parsed.invoice_number || "",
                invoice_date: parsed.invoice_date || new Date().toISOString().split("T")[0],
                taxable_amount: Number(parsed.taxable_amount) || 0,
                cgst: Number(parsed.cgst) || 0,
                sgst: Number(parsed.sgst) || 0,
                igst: Number(parsed.igst) || 0,
                total_gst: Number(parsed.total_gst) || (Number(parsed.cgst || 0) + Number(parsed.sgst || 0) + Number(parsed.igst || 0)),
                grand_total: Number(parsed.grand_total) || 0,
                hsn: parsed.hsn || "",
                items: Array.isArray(parsed.items) ? parsed.items : [],
              };
              break;
            }
          } catch (mErr: any) {
            console.warn(`Model ${modelName} error:`, mErr?.message || mErr);
            lastError = mErr?.message || String(mErr);
          }
        }
      } catch (err: any) {
        console.warn("Low cost fallback error:", err?.message || err);
        lastError = err?.message || String(err);
      }
    }

    if (!extractedResult) {
      return NextResponse.json(
        {
          error: `Document processing failed: ${lastError || "Could not process image."}`,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      provider: bearerToken ? "Google Document AI" : "Google Document AI Engine",
      fileName,
      data: extractedResult,
    });
  } catch (error: any) {
    console.error("Document AI Scan API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error during Document AI processing." },
      { status: 500 }
    );
  }
}
