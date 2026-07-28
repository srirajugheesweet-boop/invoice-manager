import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const PROMPT = `Extract the following information from this GST invoice.

Return JSON only.

{
  "vendor_name":"",
  "gstin":"",
  "invoice_number":"",
  "invoice_date":"",
  "taxable_amount":0,
  "cgst":0,
  "sgst":0,
  "igst":0,
  "total_gst":0,
  "grand_total":0,
  "hsn":"",
  "items":[]
}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType = "image/jpeg", customApiKey, fileName = "invoice.jpg" } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: "Image base64 data is required." },
        { status: 400 }
      );
    }

    const apiKey =
      customApiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Gemini API key is missing. Please set GEMINI_API_KEY in .env or provide your key in the UI.",
          isMissingKey: true,
        },
        { status: 400 }
      );
    }

    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, "");

    let responseText = "";
    let lastError = "";

    // Solution 2: Official @google/genai SDK with model "gemini-2.5-flash"
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: PROMPT },
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
        responseText = response.text;
      }
    } catch (sdkErr: any) {
      console.warn("@google/genai SDK with gemini-2.5-flash error:", sdkErr?.message || sdkErr);
      lastError = sdkErr?.message || String(sdkErr);
    }

    // Solution 3: Fallback using v1 REST API endpoint for gemini-2.5-flash / gemini-2.5-pro
    if (!responseText) {
      const modelsToTry = ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash"];
      const apiEndpoints = [
        "https://generativelanguage.googleapis.com/v1/models",
        "https://generativelanguage.googleapis.com/v1beta/models",
      ];

      for (const baseEndpoint of apiEndpoints) {
        if (responseText) break;

        for (const modelName of modelsToTry) {
          try {
            const url = `${baseEndpoint}/${modelName}:generateContent?key=${apiKey}`;
            const res = await fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      { text: PROMPT },
                      {
                        inline_data: {
                          mime_type: mimeType,
                          data: cleanBase64,
                        },
                      },
                    ],
                  },
                ],
                generationConfig: {
                  temperature: 0.1,
                  response_mime_type: "application/json",
                },
              }),
            });

            if (res.ok) {
              const resData = await res.json();
              const text = resData.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                responseText = text;
                break;
              }
            } else {
              const errText = await res.text();
              console.warn(`REST ${url} failed:`, errText);
              lastError = errText;
            }
          } catch (fetchErr: any) {
            console.warn(`Fetch error for ${modelName}:`, fetchErr.message);
            lastError = fetchErr.message;
          }
        }
      }
    }

    if (!responseText) {
      return NextResponse.json(
        { error: `Gemini AI Scan failed. Details: ${lastError || "Could not process image"}` },
        { status: 500 }
      );
    }

    // Strip Markdown code block formatting if present
    const cleanedText = responseText.replace(/```json\n?|\n?```/g, "").trim();
    let extractedData;
    try {
      extractedData = JSON.parse(cleanedText);
    } catch (parseErr) {
      return NextResponse.json(
        { error: "Failed to parse JSON output from Gemini AI", rawResponse: responseText },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      fileName,
      data: {
        vendor_name: extractedData.vendor_name || "Unknown Vendor",
        gstin: extractedData.gstin || "",
        invoice_number: extractedData.invoice_number || "",
        invoice_date: extractedData.invoice_date || new Date().toISOString().split("T")[0],
        taxable_amount: Number(extractedData.taxable_amount) || 0,
        cgst: Number(extractedData.cgst) || 0,
        sgst: Number(extractedData.sgst) || 0,
        igst: Number(extractedData.igst) || 0,
        total_gst: Number(extractedData.total_gst) || (Number(extractedData.cgst || 0) + Number(extractedData.sgst || 0) + Number(extractedData.igst || 0)),
        grand_total: Number(extractedData.grand_total) || 0,
        hsn: extractedData.hsn || "",
        items: Array.isArray(extractedData.items) ? extractedData.items : [],
      },
    });
  } catch (error: any) {
    console.error("Scan Invoice API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error during invoice scanning." },
      { status: 500 }
    );
  }
}
