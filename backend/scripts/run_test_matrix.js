// scripts/run_test_matrix.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Jimp, loadFont } from "jimp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "http://localhost:5000";
const SCREENING_URL = `${BASE_URL}/api/screening/analyze`;
const FONT_PATH = path.join(
  __dirname,
  "../node_modules/@jimp/plugin-print/fonts/open-sans/open-sans-32-black/open-sans-32-black.fnt"
);

async function createPassportImage({ nameLine, mrzLine1, mrzLine2, metadataMarker = null }) {
  const font = await loadFont(FONT_PATH);
  const img = new Jimp({ width: 1200, height: 600, color: 0xffffffff });

  // Draw simulated document header & text
  img.print({ font, x: 50, y: 50, text: "PASSPORT - REPUBLIC OF VERIGATE" });
  img.print({ font, x: 50, y: 120, text: `NAME: ${nameLine}` });
  img.print({ font, x: 50, y: 190, text: "NATIONALITY: UTO" });

  // Draw simulated face portrait
  for (let x = 850; x < 1100; x++) {
    for (let y = 50; y < 350; y++) {
      if (x === 850 || x === 1099 || y === 50 || y === 349) {
        img.setPixelColor(0x000000ff, x, y);
      } else {
        // Inner face tone
        img.setPixelColor(0xdda0ddff, x, y);
      }
    }
  }

  // Draw MRZ Lines
  if (mrzLine1) {
    img.print({ font, x: 50, y: 430, text: mrzLine1 });
  }
  if (mrzLine2) {
    img.print({ font, x: 50, y: 500, text: mrzLine2 });
  }

  let buffer = await img.getBuffer("image/jpeg", { quality: 95 });

  // If metadata marker requested (e.g. Photoshop or Canva marker)
  if (metadataMarker) {
    buffer = Buffer.concat([buffer, Buffer.from(`\n${metadataMarker}\n`, "utf-8")]);
  }

  return buffer;
}

async function createFaceImage(color = 0xdda0ddff) {
  const img = new Jimp({ width: 300, height: 300, color });
  return await img.getBuffer("image/jpeg", { quality: 95 });
}

async function runTests() {
  console.log("==================================================");
  console.log("🚀 STARTING VERIGATE END-TO-END TEST MATRIX");
  console.log("==================================================");

  const results = [];

  // Health Check
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = await res.json();
    console.log(`\n[HEALTH CHECK] Status: ${data.status} | Platform: ${data.platform}`);
    results.push({ test: "System Health", passed: data.status === "operational" });
  } catch (err) {
    console.error("[HEALTH CHECK] FAILED:", err.message);
    results.push({ test: "System Health", passed: false, error: err.message });
  }

  // TEST H: Scenarios 1-4 Preservation
  console.log("\n--------------------------------------------------");
  console.log("TEST H: Preserved SIH Demo Scenarios (1 through 4)");
  console.log("--------------------------------------------------");
  for (let s = 1; s <= 4; s++) {
    const scenarioId = `scenario-${s}`;
    const formData = new FormData();
    formData.append("scenario", scenarioId);

    try {
      const res = await fetch(SCREENING_URL, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      const sData = data.data;
      console.log(
        `[Scenario ${s}] Score: ${sData.riskScore} | Recommendation: ${sData.recommendation} | RiskLevel: ${sData.riskLevel}`
      );
      const passed =
        (s === 1 && sData.riskScore === 18 && sData.recommendation === "PROCEED") ||
        (s === 2 && sData.riskScore === 47 && sData.recommendation === "MANUAL REVIEW") ||
        (s === 3 && sData.riskScore === 74 && sData.recommendation === "HOLD FOR SECONDARY VERIFICATION") ||
        (s === 4 && sData.riskScore === 92 && sData.recommendation === "ESCALATE");
      results.push({ test: `Test H (Scenario ${s})`, passed, score: sData.riskScore, rec: sData.recommendation });
    } catch (err) {
      console.error(`[Scenario ${s}] FAILED:`, err.message);
      results.push({ test: `Test H (Scenario ${s})`, passed: false, error: err.message });
    }
  }

  // TEST E: Missing Live Photo (Real document upload without live photo)
  console.log("\n--------------------------------------------------");
  console.log("TEST E: Missing Live Photo (Document only)");
  console.log("--------------------------------------------------");
  try {
    const docBuffer = await createPassportImage({
      nameLine: "ANNA MARIA ERIKSSON",
      mrzLine1: "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<",
      mrzLine2: "L898902C36UTO7408122F3001019<<<<<<<<<<<<<<08",
    });

    const formData = new FormData();
    formData.append("document", new Blob([docBuffer], { type: "image/jpeg" }), "passport.jpg");

    const res = await fetch(SCREENING_URL, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    const sData = data.data;
    console.log(`[Test E Result] Biometric Status: ${sData.faceVerification.status}`);
    console.log(`[Test E Result] Biometric Similarity: ${sData.faceVerification.similarity}`);
    console.log(`[Test E Result] Risk Score: ${sData.riskScore} | Recommendation: ${sData.recommendation}`);
    
    const faceCheck = sData.checks.find(c => c.id === "face");
    console.log(`[Test E Result] Biometric Check Score: ${faceCheck?.score}`);

    const passed =
      sData.faceVerification.status === "NOT PROVIDED" &&
      sData.faceVerification.similarity === null &&
      faceCheck?.score === "UNVERIFIED";

    results.push({ test: "Test E (Missing Live Photo)", passed, faceStatus: sData.faceVerification.status });
  } catch (err) {
    console.error("[Test E] FAILED:", err.message);
    results.push({ test: "Test E (Missing Live Photo)", passed: false, error: err.message });
  }

  // TEST D: Face Mismatch (Real Document + Completely Different Live Photo)
  console.log("\n--------------------------------------------------");
  console.log("TEST D: Face Mismatch (Doc photo vs Different Live Photo)");
  console.log("--------------------------------------------------");
  try {
    const docBuffer = await createPassportImage({
      nameLine: "ANNA MARIA ERIKSSON",
      mrzLine1: "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<",
      mrzLine2: "L898902C36UTO7408122F3001019<<<<<<<<<<<<<<08",
    });
    const faceBuffer = await createFaceImage(0x00ff00ff); // Vibrant green face vs purple doc face

    const formData = new FormData();
    formData.append("document", new Blob([docBuffer], { type: "image/jpeg" }), "passport.jpg");
    formData.append("livePhoto", new Blob([faceBuffer], { type: "image/jpeg" }), "live.jpg");

    const res = await fetch(SCREENING_URL, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    const sData = data.data;
    console.log(`[Test D Result] Biometric Status: ${sData.faceVerification.status}`);
    console.log(`[Test D Result] Match Score: ${sData.faceVerification.similarity}%`);
    console.log(`[Test D Result] Recommendation: ${sData.recommendation}`);

    const passed =
      sData.faceVerification.status !== "NOT PROVIDED" &&
      typeof sData.faceVerification.similarity === "number" &&
      sData.faceVerification.similarity < 60;

    results.push({ test: "Test D (Face Verification Executed)", passed, similarity: sData.faceVerification.similarity });
  } catch (err) {
    console.error("[Test D] FAILED:", err.message);
    results.push({ test: "Test D (Face Verification Executed)", passed: false, error: err.message });
  }

  // TEST C: Tampered Document (Image with Photoshop Signature Marker)
  console.log("\n--------------------------------------------------");
  console.log("TEST C: Tampered Document Forensics (Photoshop Signature)");
  console.log("--------------------------------------------------");
  try {
    const tamperedBuffer = await createPassportImage({
      nameLine: "ANNA MARIA ERIKSSON",
      mrzLine1: "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<",
      mrzLine2: "L898902C36UTO7408122F3001019<<<<<<<<<<<<<<08",
      metadataMarker: "Adobe Photoshop 24.1 (Windows)",
    });

    const formData = new FormData();
    formData.append("document", new Blob([tamperedBuffer], { type: "image/jpeg" }), "tampered.jpg");

    const res = await fetch(SCREENING_URL, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    const sData = data.data;
    console.log(`[Test C Result] Tampering Score: ${sData.tampering.tamperingScore}`);
    console.log(`[Test C Result] Tampering Risk: ${sData.tampering.tamperingRisk}`);
    console.log(`[Test C Result] Indicators:`, sData.tampering.indicators);

    const hasPhotoshopIndicator = sData.tampering.indicators.some(i =>
      i.toLowerCase().includes("photoshop")
    );

    results.push({ test: "Test C (Forensic Tampering Detection)", passed: hasPhotoshopIndicator, indicators: sData.tampering.indicators });
  } catch (err) {
    console.error("[Test C] FAILED:", err.message);
    results.push({ test: "Test C (Forensic Tampering Detection)", passed: false, error: err.message });
  }

  // TEST B: Expired Document
  console.log("\n--------------------------------------------------");
  console.log("TEST B: Expired Document Validation");
  console.log("--------------------------------------------------");
  try {
    // Expiration date in MRZ: 210101 = Jan 1, 2021 (expired), check digit 5
    const expiredBuffer = await createPassportImage({
      nameLine: "ANNA MARIA ERIKSSON",
      mrzLine1: "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<",
      mrzLine2: "L898902C36UTO7408122F2101015<<<<<<<<<<<<<<08",
    });

    const formData = new FormData();
    formData.append("document", new Blob([expiredBuffer], { type: "image/jpeg" }), "expired.jpg");

    const res = await fetch(SCREENING_URL, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    const sData = data.data;
    console.log(`[Test B Result] Validation Status: ${sData.validation.passed ? "VALID" : "INVALID"}`);
    console.log(`[Test B Result] Validation Issues:`, sData.validation.issues?.map(i => i.rule));
    console.log(`[Test B Result] Risk Score: ${sData.riskScore} | Recommendation: ${sData.recommendation}`);

    const hasExpiredAnomaly = sData.validation.issues?.some(i =>
      i.rule?.includes("EXPIRED") || i.message?.toLowerCase().includes("expired")
    );

    results.push({ test: "Test B (Expired Document Detection)", passed: hasExpiredAnomaly || !sData.validation.passed, issues: sData.validation.issues });
  } catch (err) {
    console.error("[Test B] FAILED:", err.message);
    results.push({ test: "Test B (Expired Document Detection)", passed: false, error: err.message });
  }

  // TEST F: Watchlist Match
  console.log("\n--------------------------------------------------");
  console.log("TEST F: Dynamic Watchlist Matching");
  console.log("--------------------------------------------------");
  try {
    // Watchlist entry: "Tariq Al-Mansoor", document "M90124881"
    const watchlistBuffer = await createPassportImage({
      nameLine: "TARIQ AL-MANSOOR",
      mrzLine1: "P<UTOAL<MANSOOR<<TARIQ<<<<<<<<<<<<<<<<<<<<<<",
      mrzLine2: "M901248819UTO8503158M2801014<<<<<<<<<<<<<<08",
    });

    const formData = new FormData();
    formData.append("document", new Blob([watchlistBuffer], { type: "image/jpeg" }), "watchlist.jpg");

    const res = await fetch(SCREENING_URL, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    const sData = data.data;
    console.log(`[Test F Result] Watchlist Match: ${sData.watchlist.matched}`);
    console.log(`[Test F Result] Matched Record:`, sData.watchlist.matches?.[0]?.name);
    console.log(`[Test F Result] Risk Level: ${sData.riskLevel} | Recommendation: ${sData.recommendation}`);

    const passed = sData.watchlist.matched === true || (sData.watchlist.matches && sData.watchlist.matches.length > 0);
    results.push({ test: "Test F (Watchlist Screening)", passed, matched: sData.watchlist.matched });
  } catch (err) {
    console.error("[Test F] FAILED:", err.message);
    results.push({ test: "Test F (Watchlist Screening)", passed: false, error: err.message });
  }

  // TEST G: Blank / Noise Image
  console.log("\n--------------------------------------------------");
  console.log("TEST G: Blank / Noise Image (OCR Failure Graceful Handling)");
  console.log("--------------------------------------------------");
  try {
    // Plain blank white image
    const blankImg = new Jimp({ width: 500, height: 300, color: 0xffffffff });
    const blankBuffer = await blankImg.getBuffer("image/jpeg", { quality: 80 });

    const formData = new FormData();
    formData.append("document", new Blob([blankBuffer], { type: "image/jpeg" }), "blank.jpg");

    const res = await fetch(SCREENING_URL, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    const sData = data.data;
    console.log(`[Test G Result] OCR Confidence: ${sData.ocr.confidence}`);
    console.log(`[Test G Result] Extracted Name: "${sData.ocr.fullName}"`);
    console.log(`[Test G Result] Recommendation: ${sData.recommendation}`);

    // Must NOT fabricate "Rahul Sharma"
    const passed = sData.ocr.fullName !== "Rahul Sharma" && (!sData.ocr.fullName || sData.ocr.confidence < 0.5);
    results.push({ test: "Test G (Blank Image Graceful Handling)", passed, confidence: sData.ocr.confidence });
  } catch (err) {
    console.error("[Test G] FAILED:", err.message);
    results.push({ test: "Test G (Blank Image Graceful Handling)", passed: false, error: err.message });
  }

  // TEST A: Genuine Document
  console.log("\n--------------------------------------------------");
  console.log("TEST A: Genuine Document Processing");
  console.log("--------------------------------------------------");
  try {
    // Valid passport with future expiry (2030)
    const genuineBuffer = await createPassportImage({
      nameLine: "ANNA MARIA ERIKSSON",
      mrzLine1: "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<",
      mrzLine2: "L898902C36UTO7408122F3001019<<<<<<<<<<<<<<08",
    });

    const formData = new FormData();
    formData.append("document", new Blob([genuineBuffer], { type: "image/jpeg" }), "genuine.jpg");

    const res = await fetch(SCREENING_URL, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    const sData = data.data;
    console.log(`[Test A Result] Extracted Name: ${sData.ocr.fullName}`);
    console.log(`[Test A Result] Document No: ${sData.ocr.documentNumber}`);
    console.log(`[Test A Result] Validation Status: ${sData.validation.passed ? "VALID" : "INVALID"}`);
    console.log(`[Test A Result] Tampering Score: ${sData.tampering.tamperingScore}`);
    console.log(`[Test A Result] Risk Score: ${sData.riskScore} | Recommendation: ${sData.recommendation}`);

    const passed = sData.ocr.fullName && sData.ocr.documentNumber && sData.tampering.tamperingScore < 50;
    results.push({ test: "Test A (Genuine Document)", passed, riskScore: sData.riskScore, recommendation: sData.recommendation });
  } catch (err) {
    console.error("[Test A] FAILED:", err.message);
    results.push({ test: "Test A (Genuine Document)", passed: false, error: err.message });
  }

  console.log("\n==================================================");
  console.log("📊 TEST MATRIX EXECUTION SUMMARY");
  console.log("==================================================");
  let allPassed = true;
  for (const r of results) {
    console.log(`- ${r.test}: ${r.passed ? "✅ PASSED" : "❌ FAILED"}`);
    if (!r.passed) allPassed = false;
  }
  console.log("==================================================");
  console.log(`Overall Result: ${allPassed ? "🎉 ALL TESTS PASSED!" : "⚠️ SOME TESTS FAILED"}`);
}

runTests();
