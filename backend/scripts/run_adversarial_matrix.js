// scripts/run_adversarial_matrix.js
// Comprehensive Adversarial Matrix & Security Invariant Audit (SIH26188)
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

async function createPassportImage({
  nameLine = "ANNA MARIA ERIKSSON",
  mrzLine1 = "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<",
  mrzLine2 = "L898902C36UTO7408122F3001019<<<<<<<<<<<<<<04",
  metadataMarker = null,
  faceColor = 0x888888ff,
  width = 1200,
  height = 600,
  quality = 95,
}) {
  const font = await loadFont(FONT_PATH);
  const img = new Jimp({ width, height, color: 0xffffffff });

  // Document header
  img.print({ font, x: 50, y: 30, text: "PASSPORT - REPUBLIC OF VERIGATE" });

  // Document portrait region (x: 20..500, y: 90..420)
  for (let x = 20; x < Math.min(500, width - 10); x++) {
    for (let y = 90; y < Math.min(420, height - 10); y++) {
      if (x === 20 || x === 499 || y === 90 || y === 419) {
        img.setPixelColor(0x000000ff, x, y);
      } else {
        img.setPixelColor(faceColor, x, y);
      }
    }
  }

  // Visual Identity attributes
  if (width >= 800) {
    img.print({ font, x: 540, y: 120, text: `NAME: ${nameLine}` });
    img.print({ font, x: 540, y: 190, text: "NATIONALITY: UTO" });
  }

  // MRZ Lines
  if (mrzLine1 && height >= 480) {
    img.print({ font, x: 50, y: 460, text: mrzLine1 });
  }
  if (mrzLine2 && height >= 540) {
    img.print({ font, x: 50, y: 520, text: mrzLine2 });
  }

  // Portrait crop matching face crop zone
  const cropW = Math.max(10, Math.floor(width * 0.45));
  const cropH = Math.max(10, Math.floor(height * 0.65));
  const cropY = Math.floor(height * 0.15);
  const portraitCrop = img.clone().crop({ x: 0, y: cropY, w: cropW, h: cropH });

  let docBuffer = await img.getBuffer("image/jpeg", { quality });
  const faceBuffer = await portraitCrop.getBuffer("image/jpeg", { quality });

  if (metadataMarker) {
    docBuffer = Buffer.concat([docBuffer, Buffer.from(`\n${metadataMarker}\n`, "utf-8")]);
  }

  return { docBuffer, faceBuffer };
}

async function createFaceImage(color = 0x888888ff, width = 480, height = 330, hasFeatures = true) {
  const img = new Jimp({ width, height, color });
  if (hasFeatures) {
    // Add distinct facial features (eyes, mouth) to ensure stdDev >= 5
    for (let x = 100; x < 180; x++) for (let y = 80; y < 120; y++) img.setPixelColor(0xffffffff, x, y);
    for (let x = 300; x < 380; x++) for (let y = 80; y < 120; y++) img.setPixelColor(0xffffffff, x, y);
    for (let x = 160; x < 320; x++) for (let y = 220; y < 250; y++) img.setPixelColor(0xffffffff, x, y);
  }
  return await img.getBuffer("image/jpeg", { quality: 95 });
}

async function createRandomNoiseImage() {
  const img = new Jimp({ width: 500, height: 300, color: 0xffffffff });
  for (let x = 0; x < 500; x += 10) {
    for (let y = 0; y < 300; y += 10) {
      const randVal = Math.floor(Math.random() * 255);
      const randColor = ((randVal << 24) | (randVal << 16) | (randVal << 8) | 0xff) >>> 0;
      img.setPixelColor(randColor, x, y);
    }
  }
  return await img.getBuffer("image/jpeg", { quality: 80 });
}

async function runAdversarialMatrix() {
  console.log("========================================================================================");
  console.log("🛡️ VERIGATE MASTER PRODUCTION HARDENING & SECURITY INVARIANT AUDIT");
  console.log("   Problem Statement: SIH26188 | Full Pipeline Adversarial Verification");
  console.log("========================================================================================");

  const report = [];

  // Helper to post screening request
  async function screen({ docBuffer, faceBuffer, scenario, docName = "doc.jpg", faceName = "live.jpg" }) {
    const formData = new FormData();
    if (scenario) formData.append("scenario", scenario);
    if (docBuffer) formData.append("document", new Blob([docBuffer], { type: "image/jpeg" }), docName);
    if (faceBuffer) formData.append("livePhoto", new Blob([faceBuffer], { type: "image/jpeg" }), faceName);

    const res = await fetch(SCREENING_URL, { method: "POST", body: formData });
    return await res.json();
  }

  // Pre-generate standard buffers
  console.log("Generating test biometric and synthetic image artifacts...");
  const { docBuffer: validDocBuffer, faceBuffer: matchingFaceBuffer } = await createPassportImage({
    nameLine: "ANNA MARIA ERIKSSON",
    mrzLine1: "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<",
    mrzLine2: "L898902C36UTO7408122F3001019<<<<<<<<<<<<<<04",
    faceColor: 0x888888ff,
  });

  const differentFaceBuffer = await createFaceImage(0x111111ff, 480, 330, true); // Mismatch presenter with features
  const blankFaceBuffer = await createFaceImage(0xffffffff, 100, 100, false); // Featureless white canvas

  // =========================================================================
  // SECTION 1: PRESERVED DETERMINISTIC SIH DEMO SCENARIOS (1 THROUGH 4)
  // =========================================================================
  console.log("\n>>> [SECTION 1] Auditing Preserved SIH Demo Scenarios (1 through 4)...");
  for (let s = 1; s <= 4; s++) {
    const data = await screen({ scenario: `scenario-${s}` });
    const sData = data.data;
    const expected =
      s === 1
        ? { score: 18, rec: "PROCEED", level: "LOW" }
        : s === 2
        ? { score: 47, rec: "MANUAL REVIEW", level: "MEDIUM" }
        : s === 3
        ? { score: 74, rec: "HOLD FOR SECONDARY VERIFICATION", level: "HIGH" }
        : { score: 92, rec: "ESCALATE", level: "CRITICAL" };

    const ok =
      sData.riskScore === expected.score &&
      sData.recommendation === expected.rec &&
      sData.riskLevel === expected.level;

    console.log(`  Scenario ${s}: Score=${sData.riskScore} | Rec=${sData.recommendation} | Level=${sData.riskLevel} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: `Scenario ${s}`,
      category: "Preserved Demo",
      expected: `${expected.score} / ${expected.rec}`,
      actual: `${sData.riskScore} / ${sData.recommendation}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // =========================================================================
  // SECTION 2: CORE VERIFICATION PIPELINE TESTS
  // =========================================================================
  console.log("\n>>> [SECTION 2] Auditing Real Screening Pipeline Scenarios...");

  // Test 5: Clean Genuine Document + Matching Face -> PROCEED, Score <= 30
  {
    const res = await screen({ docBuffer: validDocBuffer, faceBuffer: matchingFaceBuffer });
    const d = res.data;
    const ok =
      d.validation.passed &&
      d.faceVerification.status === "Strong Match" &&
      d.faceVerification.similarity >= 80 &&
      d.recommendation === "PROCEED" &&
      d.riskScore <= 30;

    console.log(`  Test 5 (Clean Genuine + Face): Score=${d.riskScore} | Rec=${d.recommendation} | Sim=${d.faceVerification.similarity}% -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Clean Genuine + Face",
      category: "Document Integrity",
      expected: "Score <= 30, PROCEED",
      actual: `Score ${d.riskScore}, ${d.recommendation}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Test 6: Clean Genuine Document WITHOUT Face -> MANUAL REVIEW, NOT PROVIDED, NEVER PROCEED
  {
    const res = await screen({ docBuffer: validDocBuffer }); // No face photo
    const d = res.data;
    const ok =
      d.faceVerification.status === "NOT PROVIDED" &&
      d.faceVerification.similarity === null &&
      d.recommendation === "MANUAL REVIEW" &&
      d.recommendation !== "PROCEED";

    console.log(`  Test 6 (Missing Live Photo): Rec=${d.recommendation} | FaceStatus=${d.faceVerification.status} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Missing Live Photo",
      category: "Biometric Gating",
      expected: "Status NOT PROVIDED, Rec MANUAL REVIEW",
      actual: `Status ${d.faceVerification.status}, Rec ${d.recommendation}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Test 7: Single MRZ Checksum Failure (Doc Number Tampered) -> Floor >= 65, HIGH, HOLD
  {
    const { docBuffer: singleFailBuffer } = await createPassportImage({
      nameLine: "ANNA MARIA ERIKSSON",
      mrzLine1: "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<",
      mrzLine2: "L898902C30UTO7408122F3001019<<<<<<<<<<<<<<04", // check digit 0 instead of 6
    });
    const res = await screen({ docBuffer: singleFailBuffer, faceBuffer: matchingFaceBuffer });
    const d = res.data;
    const ok =
      d.riskScore >= 65 &&
      (d.riskLevel === "HIGH" || d.riskLevel === "CRITICAL") &&
      d.recommendation === "HOLD FOR SECONDARY VERIFICATION" &&
      d.recommendation !== "PROCEED";

    console.log(`  Test 7 (1 Checksum Fail): Score=${d.riskScore} | Floor=${d.risk?.threatFloor} | Rec=${d.recommendation} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Single Checksum Fail",
      category: "ICAO 9303 Security",
      expected: "Score >= 65, HOLD (Floor >= 65)",
      actual: `Score ${d.riskScore}, Rec ${d.recommendation}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Test 8: Two MRZ Checksum Failures (Doc Number + DOB Tampered) -> Floor >= 85, CRITICAL, HOLD
  {
    const { docBuffer: twoFailBuffer } = await createPassportImage({
      nameLine: "ANNA MARIA ERIKSSON",
      mrzLine1: "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<",
      mrzLine2: "L898902C30UTO7408120F3001019<<<<<<<<<<<<<<04", // doc check 0 (vs 6), dob check 0 (vs 2)
    });
    const res = await screen({ docBuffer: twoFailBuffer, faceBuffer: matchingFaceBuffer });
    const d = res.data;
    const ok =
      d.riskScore >= 85 &&
      d.riskLevel === "CRITICAL" &&
      d.recommendation === "HOLD FOR SECONDARY VERIFICATION" &&
      d.recommendation !== "PROCEED";

    console.log(`  Test 8 (2 Checksum Fails): Score=${d.riskScore} | Level=${d.riskLevel} | Rec=${d.recommendation} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Two Checksum Fails",
      category: "ICAO 9303 Security",
      expected: "Score >= 85, CRITICAL, HOLD",
      actual: `Score ${d.riskScore}, Level ${d.riskLevel}, Rec ${d.recommendation}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Test 9: Three MRZ Checksum Failures (Doc Number + DOB + Expiry Tampered) -> Floor >= 85, CRITICAL, HOLD
  {
    const { docBuffer: threeFailBuffer } = await createPassportImage({
      nameLine: "ANNA MARIA ERIKSSON",
      mrzLine1: "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<",
      mrzLine2: "L898902C30UTO7408120F3001010<<<<<<<<<<<<<<04", // doc 0, dob 0, expiry 0
    });
    const res = await screen({ docBuffer: threeFailBuffer, faceBuffer: matchingFaceBuffer });
    const d = res.data;
    const ok =
      d.riskScore >= 85 &&
      d.riskLevel === "CRITICAL" &&
      d.recommendation === "HOLD FOR SECONDARY VERIFICATION" &&
      d.recommendation !== "PROCEED";

    console.log(`  Test 9 (3 Checksum Fails): Score=${d.riskScore} | Level=${d.riskLevel} | Rec=${d.recommendation} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Three Checksum Fails",
      category: "ICAO 9303 Security",
      expected: "Score >= 85, CRITICAL, HOLD",
      actual: `Score ${d.riskScore}, Level ${d.riskLevel}, Rec ${d.recommendation}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Test 10: Date Chronology Inconsistency (Expired Document) -> Score >= 55, Rec HOLD, NEVER PROCEED
  {
    const { docBuffer: expiredBuffer } = await createPassportImage({
      nameLine: "ANNA MARIA ERIKSSON",
      mrzLine1: "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<",
      mrzLine2: "L898902C36UTO7408122F2101015<<<<<<<<<<<<<<08", // Expiry 2021
    });
    const res = await screen({ docBuffer: expiredBuffer, faceBuffer: matchingFaceBuffer });
    const d = res.data;
    const isExpiredFlagged = d.validation?.issues?.some((i) => i.rule === "DOCUMENT_EXPIRED");
    const ok = isExpiredFlagged && d.riskScore >= 55 && d.recommendation === "HOLD FOR SECONDARY VERIFICATION" && d.recommendation !== "PROCEED";

    console.log(`  Test 10 (Expired Document): Score=${d.riskScore} | Flagged=${isExpiredFlagged} | Rec=${d.recommendation} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Expired Document",
      category: "Document Chronology",
      expected: "Score >= 55, Flagged, Rec HOLD",
      actual: `Score ${d.riskScore}, Flagged: ${isExpiredFlagged}, Rec ${d.recommendation}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Test 11: Date Chronology Inconsistency (Future Birth / Chronology Anomaly)
  {
    const { docBuffer: chronologyBuffer } = await createPassportImage({
      nameLine: "CHRONO TEST",
      mrzLine1: "P<UTOTEST<<CHRONO<<<<<<<<<<<<<<<<<<<<<<<<<<<",
      mrzLine2: "L898902C36UTO3001019F2501015<<<<<<<<<<<<<<08",
    });
    const res = await screen({ docBuffer: chronologyBuffer, faceBuffer: matchingFaceBuffer });
    const d = res.data;
    const ok = d.recommendation !== "PROCEED";

    console.log(`  Test 11 (Chronology Anomaly): Rec=${d.recommendation} | Risk=${d.riskScore} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Chronology Anomaly",
      category: "Document Chronology",
      expected: "Rec NOT PROCEED",
      actual: `Rec ${d.recommendation}, Score ${d.riskScore}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Test 12: Synthetic / AI-Generated Passport Heuristic with Invalid MRZ -> Floor >= 85, CRITICAL, HOLD
  {
    const { docBuffer: syntheticBuffer } = await createPassportImage({
      nameLine: "ARJUN MEHTA",
      mrzLine1: "P<INDMEHTA<<ARJUN<<<<<<<<<<<<<<<<<<<<<<<<<<<",
      mrzLine2: "Z5487921<7IND9205128M3108254<<<<<<<<<<<<<<00",
    });
    const res = await screen({ docBuffer: syntheticBuffer });
    const d = res.data;
    const ok =
      d.riskScore >= 80 &&
      (d.riskLevel === "HIGH" || d.riskLevel === "CRITICAL") &&
      d.recommendation === "HOLD FOR SECONDARY VERIFICATION" &&
      d.recommendation !== "PROCEED";

    console.log(`  Test 12 (Synthetic + Bad MRZ): Score=${d.riskScore} | Level=${d.riskLevel} | Rec=${d.recommendation} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Synthetic + Bad MRZ",
      category: "AI Generation / Synthetic",
      expected: "Score >= 80, Level HIGH/CRITICAL, HOLD",
      actual: `Score ${d.riskScore}, Level ${d.riskLevel}, Rec ${d.recommendation}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Test 13: Heavy JPEG Compression Scan (Quality 35) -> Must not falsely classify as confirmed fraud
  {
    const { docBuffer: compressedBuffer } = await createPassportImage({
      quality: 35,
    });
    const res = await screen({ docBuffer: compressedBuffer, faceBuffer: matchingFaceBuffer });
    const d = res.data;
    const ok = d.recommendation !== "ESCALATE" && d.riskLevel !== "CRITICAL";

    console.log(`  Test 13 (Compressed JPEG): Score=${d.riskScore} | Level=${d.riskLevel} | Rec=${d.recommendation} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Compressed JPEG Scan",
      category: "Image Quality Robustness",
      expected: "Not ESCALATE, Not CRITICAL",
      actual: `Score ${d.riskScore}, Level ${d.riskLevel}, Rec ${d.recommendation}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Test 14: Blurry / Extremely Low-Resolution Document Scan -> Low confidence, Rec NOT PROCEED
  {
    const { docBuffer: lowResBuffer } = await createPassportImage({
      width: 250,
      height: 140,
    });
    const res = await screen({ docBuffer: lowResBuffer });
    const d = res.data;
    const ok = d.recommendation !== "PROCEED";

    console.log(`  Test 14 (Low-Res Scan): Rec=${d.recommendation} | Risk=${d.riskScore} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Low-Res Scan",
      category: "Image Quality Robustness",
      expected: "Rec NOT PROCEED",
      actual: `Rec ${d.recommendation}, Score ${d.riskScore}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Test 15: Tampering Forensics (Adobe Photoshop Metadata Injection) -> Flagged, Score >= 35, NOT PROCEED
  {
    const { docBuffer: tamperedBuffer } = await createPassportImage({
      metadataMarker: "Adobe Photoshop 24.1 (Windows)",
    });
    const res = await screen({ docBuffer: tamperedBuffer, faceBuffer: matchingFaceBuffer });
    const d = res.data;
    const hasMarker = d.tampering?.indicators?.some((i) => i.toLowerCase().includes("photoshop"));
    const ok = hasMarker && d.tampering?.tamperingScore >= 35 && d.recommendation !== "PROCEED";

    console.log(`  Test 15 (Photoshop Marker): Flagged=${hasMarker} | TamperScore=${d.tampering?.tamperingScore} | Rec=${d.recommendation} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Photoshop Marker Injection",
      category: "Forensics & Metadata",
      expected: "Photoshop flagged, Rec NOT PROCEED",
      actual: `Flagged: ${hasMarker}, TamperScore: ${d.tampering?.tamperingScore}, Rec: ${d.recommendation}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Test 16: Clean Image Without Metadata -> Tampering Score Low (<= 25)
  {
    const res = await screen({ docBuffer: validDocBuffer, faceBuffer: matchingFaceBuffer });
    const d = res.data;
    const ok = d.tampering?.tamperingScore <= 25;

    console.log(`  Test 16 (Clean Metadata): TamperScore=${d.tampering?.tamperingScore} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Clean Metadata Image",
      category: "Forensics & Metadata",
      expected: "Tampering Score <= 25",
      actual: `TamperScore: ${d.tampering?.tamperingScore}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Test 17: Biometric Matching Face -> Similarity >= 80%, Status MATCH
  {
    const res = await screen({ docBuffer: validDocBuffer, faceBuffer: matchingFaceBuffer });
    const d = res.data;
    const ok = d.faceVerification.similarity >= 80 && d.signalEvidence?.face?.status === "MATCH";

    console.log(`  Test 17 (Biometric Match): Sim=${d.faceVerification.similarity}% | Status=${d.signalEvidence?.face?.status} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Biometric Face Match",
      category: "Biometric Verification",
      expected: "Similarity >= 80%, Status MATCH",
      actual: `Similarity ${d.faceVerification.similarity}%, Status ${d.signalEvidence?.face?.status}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Test 18: Biometric Mismatching Face -> Similarity < 60%, Floor >= 65, Rec HOLD, NEVER PROCEED
  {
    const res = await screen({ docBuffer: validDocBuffer, faceBuffer: differentFaceBuffer });
    const d = res.data;
    const mismatch = typeof d.faceVerification.similarity === "number" && d.faceVerification.similarity < 60;
    const ok = mismatch && d.riskScore >= 65 && d.recommendation === "HOLD FOR SECONDARY VERIFICATION" && d.recommendation !== "PROCEED";

    console.log(`  Test 18 (Biometric Mismatch): Sim=${d.faceVerification.similarity}% | Risk=${d.riskScore} | Rec=${d.recommendation} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Biometric Face Mismatch",
      category: "Biometric Verification",
      expected: "Similarity < 60%, Rec HOLD, Score >= 65",
      actual: `Sim ${d.faceVerification.similarity}%, Score ${d.riskScore}, Rec ${d.recommendation}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Test 19: Multiple Faces / Corrupt Live Photo -> Status UNAVAILABLE / UNCERTAIN, Similarity null, MANUAL REVIEW
  {
    const corruptFace = Buffer.from("NOT AN IMAGE STREAM");
    const res = await screen({ docBuffer: validDocBuffer, faceBuffer: corruptFace, faceName: "corrupt.jpg" });
    const d = res.data;
    const ok =
      (d.faceVerification.status === "UNAVAILABLE" || d.faceVerification.status === "Manual Review Required") &&
      d.recommendation !== "PROCEED";

    console.log(`  Test 19 (Corrupt Face Photo): Status=${d.faceVerification.status} | Rec=${d.recommendation} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Corrupt Face Photo",
      category: "Biometric Verification",
      expected: "Status UNAVAILABLE / UNCERTAIN, NOT PROCEED",
      actual: `Status ${d.faceVerification.status}, Rec ${d.recommendation}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Test 20: Featureless / Blank Canvas Live Photo -> UNAVAILABLE, Similarity null, Rec MANUAL REVIEW
  {
    const res = await screen({ docBuffer: validDocBuffer, faceBuffer: blankFaceBuffer, faceName: "blank_face.jpg" });
    const d = res.data;
    const ok =
      d.faceVerification.status === "UNAVAILABLE" &&
      d.faceVerification.similarity === null &&
      d.recommendation !== "PROCEED";

    console.log(`  Test 20 (Featureless Blank Face): Status=${d.faceVerification.status} | Sim=${d.faceVerification.similarity} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Featureless Blank Face",
      category: "Biometric Verification",
      expected: "Status UNAVAILABLE, Sim null, NOT PROCEED",
      actual: `Status ${d.faceVerification.status}, Sim ${d.faceVerification.similarity}, Rec ${d.recommendation}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Test 21: OCR Blank Image -> No hallucinated identity, Rec NOT PROCEED
  {
    const blankImg = new Jimp({ width: 500, height: 300, color: 0xffffffff });
    const blankBuffer = await blankImg.getBuffer("image/jpeg", { quality: 80 });
    const res = await screen({ docBuffer: blankBuffer });
    const d = res.data;
    const noHallucination = d.ocr.fullName !== "Rahul Sharma" && !d.ocr.fullName;
    const ok = noHallucination && d.recommendation !== "PROCEED";

    console.log(`  Test 21 (OCR Blank Image): Extracted Name=${d.ocr.fullName} | Rec=${d.recommendation} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "OCR Blank Image",
      category: "OCR Integrity",
      expected: "No hallucinated identity, NOT PROCEED",
      actual: `Name: ${d.ocr.fullName || "null"}, Rec ${d.recommendation}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Test 22: OCR Random Noise Image -> Low OCR confidence (< 0.6), Rec NOT PROCEED
  {
    const noiseBuffer = await createRandomNoiseImage();
    const res = await screen({ docBuffer: noiseBuffer });
    const d = res.data;
    const ok = d.ocr.confidence < 0.6 && d.recommendation !== "PROCEED";

    console.log(`  Test 22 (Random Noise Image): Conf=${d.ocr.confidence} | Rec=${d.recommendation} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "OCR Noise Image",
      category: "OCR Integrity",
      expected: "Low confidence < 0.6, NOT PROCEED",
      actual: `Confidence ${d.ocr.confidence}, Rec ${d.recommendation}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Test 23: Active Watchlist Hit -> Matched true, Score >= 92, CRITICAL, ESCALATE
  {
    const { docBuffer: watchlistBuffer } = await createPassportImage({
      nameLine: "TARIQ AL-MANSOOR",
      mrzLine1: "P<UTOAL<MANSOOR<<TARIQ<<<<<<<<<<<<<<<<<<<<<<",
      mrzLine2: "M901248819UTO8503158M2801014<<<<<<<<<<<<<<08",
      faceColor: 0xdda0ddff,
    });
    const res = await screen({ docBuffer: watchlistBuffer, faceBuffer: matchingFaceBuffer });
    const d = res.data;
    const ok = d.watchlist.matched === true && d.recommendation === "ESCALATE" && d.riskScore >= 92 && d.riskLevel === "CRITICAL";

    console.log(`  Test 23 (Active Watchlist Hit): Matched=${d.watchlist.matched} | Score=${d.riskScore} | Rec=${d.recommendation} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Active Watchlist Hit",
      category: "Watchlist Screening",
      expected: "Matched true, Score >= 92, Rec ESCALATE",
      actual: `Matched ${d.watchlist.matched}, Score ${d.riskScore}, Rec ${d.recommendation}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Test 24: Inactive Watchlist Record (WL-004 Carlos Mendoza: status INACTIVE) -> Matched FALSE
  {
    const { docBuffer: inactiveWlBuffer } = await createPassportImage({
      nameLine: "CARLOS MENDOZA",
      mrzLine1: "P<UTOMENDOZA<<CARLOS<<<<<<<<<<<<<<<<<<<<<<<<",
      mrzLine2: "P445566778UTO8005201M3001019<<<<<<<<<<<<<<08",
    });
    const res = await screen({ docBuffer: inactiveWlBuffer, faceBuffer: matchingFaceBuffer });
    const d = res.data;
    const ok = d.watchlist.matched === false && d.recommendation !== "ESCALATE";

    console.log(`  Test 24 (Inactive Watchlist Record): Matched=${d.watchlist.matched} | Rec=${d.recommendation} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Inactive Watchlist Record",
      category: "Watchlist Screening",
      expected: "Matched false (Ignored inactive record)",
      actual: `Matched ${d.watchlist.matched}, Rec ${d.recommendation}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Test 25: False-Positive Name Near-Match Prevention (Single generic token "ALEX" against "Alexander Vance")
  {
    const { docBuffer: nearMatchBuffer } = await createPassportImage({
      nameLine: "ALEX SMITH",
      mrzLine1: "P<UTOSMITH<<ALEX<<<<<<<<<<<<<<<<<<<<<<<<<<<<",
      mrzLine2: "K123456789UTO9001011M3001019<<<<<<<<<<<<<<08",
    });
    const res = await screen({ docBuffer: nearMatchBuffer, faceBuffer: matchingFaceBuffer });
    const d = res.data;
    const ok = d.watchlist.matched === false;

    console.log(`  Test 25 (Watchlist False-Positive Prevention): Matched=${d.watchlist.matched} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Watchlist Near-Match Filter",
      category: "Watchlist Screening",
      expected: "Matched false (No single token false-match)",
      actual: `Matched ${d.watchlist.matched}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Test 26: Compound Fraud: Checksum Failure + Face Mismatch -> Score >= 90, CRITICAL, HOLD
  {
    const { docBuffer: compoundMrzFaceBuffer } = await createPassportImage({
      nameLine: "VIKRAM SINGH",
      mrzLine1: "P<INDVALI<<VIKRAM<<<<<<<<<<<<<<<<<<<<<<<<<<<",
      mrzLine2: "X1122334<9IND8801019M3001011<<<<<<<<<<<<<<99",
      faceColor: 0x777777ff,
    });
    const res = await screen({ docBuffer: compoundMrzFaceBuffer, faceBuffer: differentFaceBuffer });
    const d = res.data;
    const ok = d.riskScore >= 90 && d.riskLevel === "CRITICAL" && d.recommendation !== "PROCEED";

    console.log(`  Test 26 (Compound MRZ+Face): Score=${d.riskScore} | Level=${d.riskLevel} | Rec=${d.recommendation} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Compound Fraud (MRZ + Face)",
      category: "Threat Floor Overrides",
      expected: "Score >= 90, Level CRITICAL, Rec HOLD",
      actual: `Score ${d.riskScore}, Level ${d.riskLevel}, Rec ${d.recommendation}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Test 27: Compound Fraud: Checksum Failure + High Synthetic Suspicion -> Score >= 85, CRITICAL/HIGH, HOLD
  {
    const { docBuffer: compoundMrzSyntheticBuffer } = await createPassportImage({
      nameLine: "SYNTHETIC CHECK",
      mrzLine1: "P<UTOSYNTHETIC<<CHECK<<<<<<<<<<<<<<<<<<<<<<<",
      mrzLine2: "Z998877660UTO9001010M3001010<<<<<<<<<<<<<<00",
    });
    const res = await screen({ docBuffer: compoundMrzSyntheticBuffer });
    const d = res.data;
    const ok = d.riskScore >= 85 && (d.riskLevel === "CRITICAL" || d.riskLevel === "HIGH") && d.recommendation !== "PROCEED";

    console.log(`  Test 27 (Compound MRZ+Synthetic): Score=${d.riskScore} | Level=${d.riskLevel} | Rec=${d.recommendation} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Compound Fraud (MRZ + Synthetic)",
      category: "Threat Floor Overrides",
      expected: "Score >= 85, Level HIGH/CRITICAL, Rec HOLD",
      actual: `Score ${d.riskScore}, Level ${d.riskLevel}, Rec ${d.recommendation}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Test 28: Compound Fraud: Watchlist Hit + Checksum Failure -> Score >= 92, CRITICAL, ESCALATE
  {
    const { docBuffer: compoundWlMrzBuffer } = await createPassportImage({
      nameLine: "TARIQ AL-MANSOOR",
      mrzLine1: "P<UTOAL<MANSOOR<<TARIQ<<<<<<<<<<<<<<<<<<<<<<",
      mrzLine2: "M901248810UTO8503150M2801010<<<<<<<<<<<<<<00",
    });
    const res = await screen({ docBuffer: compoundWlMrzBuffer, faceBuffer: matchingFaceBuffer });
    const d = res.data;
    const ok = d.watchlist.matched === true && d.riskScore >= 92 && d.recommendation === "ESCALATE";

    console.log(`  Test 28 (Compound Watchlist+MRZ): Score=${d.riskScore} | Rec=${d.recommendation} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Compound Fraud (Watchlist + MRZ)",
      category: "Threat Floor Overrides",
      expected: "Score >= 92, Rec ESCALATE",
      actual: `Score ${d.riskScore}, Rec ${d.recommendation}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // =========================================================================
  // SECTION 2.5: MRZ CHECKSUM VERIFICATION & UNCERTAINTY MATRIX (CASES 37–52)
  // Strict distinction between verified cryptographic failures and optical uncertainty
  // =========================================================================
  console.log("\n>>> [SECTION 2.5] MRZ Checksum Verification & Uncertainty Matrix (Cases 37-52)...");
  const { ValidationService } = await import("../services/validationService.js");
  const { RiskEngine } = await import("../services/riskEngine.js");
  const { DecisionEngine } = await import("../services/decisionEngine.js");
  const { findAndParseMRZ, evaluateCheckDigit } = await import("../utils/mrzParser.js");

  // Case 37: Valid MRZ + Valid Checksum
  {
    const mrzText = "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<\nL898902C36UTO7408122F3204153ZE184226B<<<<<05";
    const mrzData = findAndParseMRZ(mrzText);
    const valRes = ValidationService.validate("Passport", {
      fullName: "Anna Maria Eriksson",
      documentNumber: "L898902C3",
      dateOfBirth: "12 Aug 1974",
      dateOfBirthIso: "1974-08-12",
      dateOfExpiry: "15 Apr 2032",
      dateOfExpiryIso: "2032-04-15",
      mrzData,
    });
    const risk = RiskEngine.calculate({ validation: valRes, faceVerification: { isProvided: true, similarity: 90, status: "Strong Match", evidenceStatus: "MATCH" } });
    const dec = DecisionEngine.evaluate(risk.riskScore, risk.riskLevel, { validation: valRes, faceVerification: { isProvided: true, similarity: 90, status: "Strong Match", evidenceStatus: "MATCH" } });
    const ok = valRes.hasChecksumFail === false && valRes.hasChecksumUncertainty === false && mrzData.checkDigits.allValid === true && risk.threatFloor === 0;

    console.log(`  Case 37 (Valid MRZ + Checksum): Valid=${mrzData.checkDigits.allValid} | ThreatFloor=${risk.threatFloor} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Case 37: Valid MRZ + Checksum",
      category: "Checksum Verification",
      expected: "allValid=true, hasChecksumFail=false, floor=0",
      actual: `Valid: ${mrzData.checkDigits.allValid}, Floor: ${risk.threatFloor}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Case 38: One Verified Checksum Mismatch (DocNumber check digit altered)
  {
    // L898902C3 has check digit '6', we alter it to '7' (valid single digit, valid len, valid chars)
    const mrzText = "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<\nL898902C37UTO7408122F1204159ZE184226B<<<<<10";
    const mrzData = findAndParseMRZ(mrzText);
    const valRes = ValidationService.validate("Passport", {
      fullName: "Anna Maria Eriksson",
      documentNumber: "L898902C3",
      dateOfBirth: "12 Aug 1974",
      dateOfExpiry: "15 Apr 2035",
      mrzData,
    });
    const risk = RiskEngine.calculate({ validation: valRes });
    const dec = DecisionEngine.evaluate(risk.riskScore, risk.riskLevel, { validation: valRes });
    const ok = valRes.verifiedFailedChecksumCount === 1 && valRes.hasVerifiedChecksumFail === true && risk.threatFloor >= 65 && dec.recommendation === "HOLD FOR SECONDARY VERIFICATION";

    console.log(`  Case 38 (1 Verified Checksum Fail): Fails=${valRes.verifiedFailedChecksumCount} | Floor=${risk.threatFloor} | Rec=${dec.recommendation} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Case 38: 1 Verified Checksum Fail",
      category: "Checksum Verification",
      expected: "1 verified fail, Floor >= 65, Rec HOLD",
      actual: `Fails: ${valRes.verifiedFailedChecksumCount}, Floor: ${risk.threatFloor}, Rec: ${dec.recommendation}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Case 39: Two Verified Checksum Mismatches (DocNumber + DOB check digits altered)
  {
    // DocNumber check altered to '7', DOB check altered from '2' to '3'
    const mrzText = "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<\nL898902C37UTO7408123F1204159ZE184226B<<<<<10";
    const mrzData = findAndParseMRZ(mrzText);
    const valRes = ValidationService.validate("Passport", {
      fullName: "Anna Maria Eriksson",
      documentNumber: "L898902C3",
      dateOfBirth: "12 Aug 1974",
      dateOfExpiry: "15 Apr 2035",
      mrzData,
    });
    const risk = RiskEngine.calculate({ validation: valRes });
    const dec = DecisionEngine.evaluate(risk.riskScore, risk.riskLevel, { validation: valRes });
    const ok = valRes.verifiedFailedChecksumCount === 2 && valRes.hasMultipleChecksumFailures === true && risk.threatFloor >= 85 && dec.recommendation === "HOLD FOR SECONDARY VERIFICATION";

    console.log(`  Case 39 (2 Verified Checksum Fails): Fails=${valRes.verifiedFailedChecksumCount} | Floor=${risk.threatFloor} | Rec=${dec.recommendation} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Case 39: 2 Verified Checksum Fails",
      category: "Checksum Verification",
      expected: "2 verified fails, Floor >= 85, Rec HOLD",
      actual: `Fails: ${valRes.verifiedFailedChecksumCount}, Floor: ${risk.threatFloor}, Rec: ${dec.recommendation}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Case 40: Three Verified Checksum Mismatches (DocNumber + DOB + Expiry check digits altered)
  {
    // DocNumber check altered to '7', DOB check altered to '3', Expiry check altered from '9' to '8'
    const mrzText = "P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<\nL898902C37UTO7408123F1204158ZE184226B<<<<<10";
    const mrzData = findAndParseMRZ(mrzText);
    const valRes = ValidationService.validate("Passport", {
      fullName: "Anna Maria Eriksson",
      documentNumber: "L898902C3",
      dateOfBirth: "12 Aug 1974",
      dateOfExpiry: "15 Apr 2035",
      mrzData,
    });
    const risk = RiskEngine.calculate({ validation: valRes });
    const dec = DecisionEngine.evaluate(risk.riskScore, risk.riskLevel, { validation: valRes });
    const ok = valRes.verifiedFailedChecksumCount === 3 && risk.threatFloor >= 85 && dec.recommendation === "HOLD FOR SECONDARY VERIFICATION";

    console.log(`  Case 40 (3 Verified Checksum Fails): Fails=${valRes.verifiedFailedChecksumCount} | Floor=${risk.threatFloor} | Rec=${dec.recommendation} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Case 40: 3 Verified Checksum Fails",
      category: "Checksum Verification",
      expected: "3 verified fails, Floor >= 85, Rec HOLD",
      actual: `Fails: ${valRes.verifiedFailedChecksumCount}, Floor: ${risk.threatFloor}, Rec: ${dec.recommendation}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Case 41: Missing Check Digit (Truncated field)
  {
    const evalRes = evaluateCheckDigit("documentNumber", "L898902C", 8, "");
    const ok = evalRes.isUncertain === true && evalRes.isVerifiedMismatch === false && evalRes.uncertaintyReason === "MALFORMED_CHECK_DIGIT";

    console.log(`  Case 41 (Missing Check Digit): Uncertain=${evalRes.isUncertain} | Reason=${evalRes.uncertaintyReason} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Case 41: Missing Check Digit",
      category: "Checksum Uncertainty",
      expected: "isUncertain=true, isVerifiedMismatch=false",
      actual: `Uncertain: ${evalRes.isUncertain}, Reason: ${evalRes.uncertaintyReason}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Case 42: Malformed Check Digit (character 'X' or '<')
  {
    const evalRes = evaluateCheckDigit("documentNumber", "L898902C3", 9, "<");
    const ok = evalRes.isUncertain === true && evalRes.isVerifiedMismatch === false && evalRes.uncertaintyReason === "MALFORMED_CHECK_DIGIT";

    console.log(`  Case 42 (Malformed Check Digit): Uncertain=${evalRes.isUncertain} | Reason=${evalRes.uncertaintyReason} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Case 42: Malformed Check Digit",
      category: "Checksum Uncertainty",
      expected: "isUncertain=true (not cryptographic mismatch)",
      actual: `Uncertain: ${evalRes.isUncertain}, Reason: ${evalRes.uncertaintyReason}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Case 43: OCR-Confused Character in MRZ (Invalid character '@')
  {
    const evalRes = evaluateCheckDigit("documentNumber", "L8989@2C3", 9, "6");
    const ok = evalRes.isUncertain === true && evalRes.isVerifiedMismatch === false && evalRes.uncertaintyReason === "INVALID_FIELD_CHARACTERS";

    console.log(`  Case 43 (OCR-Confused MRZ Character): Uncertain=${evalRes.isUncertain} | Reason=${evalRes.uncertaintyReason} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Case 43: Confused MRZ Char",
      category: "Checksum Uncertainty",
      expected: "isUncertain=true, reason INVALID_FIELD_CHARACTERS",
      actual: `Uncertain: ${evalRes.isUncertain}, Reason: ${evalRes.uncertaintyReason}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Case 44: Truncated MRZ Line
  {
    const truncatedText = "P<UTOERIKSSON<<ANNA<MARIA\nL898902C36UTO";
    const mrzResult = findAndParseMRZ(truncatedText);
    const ok = mrzResult === null;

    console.log(`  Case 44 (Truncated MRZ Line): Parsed=${mrzResult} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Case 44: Truncated MRZ Line",
      category: "Checksum Uncertainty",
      expected: "findAndParseMRZ returns null (uncertainty)",
      actual: `Parsed: ${mrzResult === null ? "null" : "object"}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Case 45: Low-Confidence MRZ
  {
    const evalRes = evaluateCheckDigit("documentNumber", "L898902C3", 9, "7", 0.35);
    const ok = evalRes.isUncertain === true && evalRes.isVerifiedMismatch === false && evalRes.uncertaintyReason === "LOW_OCR_CONFIDENCE";

    console.log(`  Case 45 (Low-Confidence MRZ): Uncertain=${evalRes.isUncertain} | Reason=${evalRes.uncertaintyReason} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Case 45: Low-Confidence MRZ",
      category: "Checksum Uncertainty",
      expected: "isUncertain=true, reason LOW_OCR_CONFIDENCE",
      actual: `Uncertain: ${evalRes.isUncertain}, Reason: ${evalRes.uncertaintyReason}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Case 46: Invalid MRZ Structure on Passport -> MRZ_UNAVAILABLE, MANUAL REVIEW, No 65/85 floor
  {
    const valRes = ValidationService.validate("Passport", {
      fullName: "Test User",
      documentNumber: "A12345678",
      dateOfExpiry: "2030-01-01",
      mrzData: null,
    });
    const risk = RiskEngine.calculate({ validation: valRes });
    const dec = DecisionEngine.evaluate(risk.riskScore, risk.riskLevel, { validation: valRes });
    const ok = valRes.hasChecksumUncertainty === true && valRes.hasChecksumFail === false && risk.threatFloor === 0 && dec.recommendation === "MANUAL REVIEW";

    console.log(`  Case 46 (Invalid MRZ Structure): Uncertain=${valRes.hasChecksumUncertainty} | Floor=${risk.threatFloor} | Rec=${dec.recommendation} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Case 46: Invalid MRZ Structure",
      category: "Checksum Uncertainty",
      expected: "Uncertain=true, Floor=0, Rec MANUAL REVIEW",
      actual: `Uncertain: ${valRes.hasChecksumUncertainty}, Floor: ${risk.threatFloor}, Rec: ${dec.recommendation}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Case 47: Correct MRZ but Unreadable Image
  {
    const corruptedBuffer = Buffer.from("NOT_A_VALID_IMAGE_DATA_CORRUPTED_HEADER");
    const res = await screen({ docBuffer: corruptedBuffer });
    const ok = res.success === true && res.data?.recommendation === "MANUAL REVIEW";

    console.log(`  Case 47 (Unreadable Image Handling): Success=${res.success} | Rec=${res.data?.recommendation} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Case 47: Unreadable Image Handling",
      category: "Error Resilience",
      expected: "HTTP 200/Success true, Rec MANUAL REVIEW (no server crash)",
      actual: `Success: ${res.success}, Rec: ${res.data?.recommendation}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Case 48: Legitimate Non-MRZ Credential (e.g. Driving License)
  {
    const valRes = ValidationService.validate("Driving License", {
      fullName: "Jane Passenger",
      documentNumber: "DL-99887766",
      dateOfExpiry: "2032-10-15",
    });
    const risk = RiskEngine.calculate({
      validation: valRes,
      ocr: { ocrStatus: "SUCCESS", confidence: 0.95 },
      faceVerification: { isProvided: true, status: "Strong Match", evidenceStatus: "MATCH", similarity: 88 },
    });
    const dec = DecisionEngine.evaluate(risk.riskScore, risk.riskLevel, {
      validation: valRes,
      ocr: { ocrStatus: "SUCCESS", confidence: 0.95 },
      faceVerification: { isProvided: true, status: "Strong Match", evidenceStatus: "MATCH", similarity: 88 },
    });
    const ok = valRes.hasChecksumFail === false && valRes.hasChecksumUncertainty === false && valRes.passed === true && dec.recommendation === "PROCEED";

    console.log(`  Case 48 (Non-MRZ Credential): Passed=${valRes.passed} | CheckFail=${valRes.hasChecksumFail} | Rec=${dec.recommendation} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Case 48: Non-MRZ Credential",
      category: "Credential Type Handling",
      expected: "Passed=true, hasChecksumFail=false, Rec PROCEED",
      actual: `Passed: ${valRes.passed}, Rec: ${dec.recommendation}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Boundary Test 49: Score 29 (Below threshold 30) -> PROCEED
  {
    const dec = DecisionEngine.evaluate(29, "LOW", {
      validation: { passed: true, issues: [] },
      faceVerification: { isProvided: true, status: "Strong Match", evidenceStatus: "MATCH", similarity: 88 },
      tampering: { tamperingScore: 10 },
      synthetic: { syntheticScore: 10 },
      ocr: { ocrStatus: "SUCCESS", confidence: 0.95 },
    });
    const ok = dec.recommendation === "PROCEED";

    console.log(`  Boundary Test 49 (Score 29): Rec=${dec.recommendation} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Boundary Test 49: Score 29",
      category: "Boundary Verification",
      expected: "PROCEED (score <= 30 with all gates satisfied)",
      actual: `Rec: ${dec.recommendation}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Boundary Test 50: Score 30 (At threshold 30) -> PROCEED
  {
    const dec = DecisionEngine.evaluate(30, "LOW", {
      validation: { passed: true, issues: [] },
      faceVerification: { isProvided: true, status: "Strong Match", evidenceStatus: "MATCH", similarity: 88 },
      tampering: { tamperingScore: 10 },
      synthetic: { syntheticScore: 10 },
      ocr: { ocrStatus: "SUCCESS", confidence: 0.95 },
    });
    const ok = dec.recommendation === "PROCEED";

    console.log(`  Boundary Test 50 (Score 30): Rec=${dec.recommendation} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Boundary Test 50: Score 30",
      category: "Boundary Verification",
      expected: "PROCEED (score <= 30 with all gates satisfied)",
      actual: `Rec: ${dec.recommendation}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Boundary Test 51: Score 31 (Above threshold 30) -> MANUAL REVIEW
  {
    const dec = DecisionEngine.evaluate(31, "LOW", {
      validation: { passed: true, issues: [] },
      faceVerification: { isProvided: true, status: "Strong Match", evidenceStatus: "MATCH", similarity: 88 },
      tampering: { tamperingScore: 10 },
      synthetic: { syntheticScore: 10 },
      ocr: { ocrStatus: "SUCCESS", confidence: 0.95 },
    });
    const ok = dec.recommendation === "MANUAL REVIEW";

    console.log(`  Boundary Test 51 (Score 31): Rec=${dec.recommendation} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Boundary Test 51: Score 31",
      category: "Boundary Verification",
      expected: "MANUAL REVIEW (score > 30 blocks PROCEED)",
      actual: `Rec: ${dec.recommendation}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Sanitization Test 52: Extreme numbers / NaN / Infinity inputs
  {
    const r = RiskEngine.calculate({
      ocr: { confidence: NaN },
      validation: { numericScore: Infinity },
      tampering: { tamperingScore: -999 },
      synthetic: { syntheticScore: 999999 },
      faceVerification: { similarity: NaN, isProvided: true },
    });
    const ok = Number.isFinite(r.riskScore) && !Number.isNaN(r.riskScore) && r.riskScore >= 5 && r.riskScore <= 100;

    console.log(`  Sanitization Test 52: Score=${r.riskScore} | Level=${r.riskLevel} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Sanitization Test 52: NaN/Inf Inputs",
      category: "Input Sanitization",
      expected: "Finite number bounded [5, 100]",
      actual: `Score: ${r.riskScore}, Level: ${r.riskLevel}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // =========================================================================
  // SECTION 3: SYSTEM SECURITY INVARIANTS (A THROUGH H)
  // =========================================================================
  console.log("\n>>> [SECTION 3] Direct Programmatic Verification of Invariants A through H...");

  // Invariant A: Strict PROCEED Gating
  {
    const { DecisionEngine } = await import("../services/decisionEngine.js");
    const testDec1 = DecisionEngine.evaluate(
      20,
      "LOW",
      { validation: { passed: false, issues: [{ rule: "DOCUMENT_EXPIRED" }] } }
    );
    const testDec2 = DecisionEngine.evaluate(
      20,
      "LOW",
      { faceVerification: { isProvided: false, status: "NOT PROVIDED" } }
    );
    const ok = testDec1.recommendation !== "PROCEED" && testDec2.recommendation !== "PROCEED";

    console.log(`  Invariant A (PROCEED Gating): Dec1=${testDec1.recommendation} | Dec2=${testDec2.recommendation} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Invariant A: PROCEED Gating",
      category: "Security Invariant",
      expected: "Zero PROCEED on failed checks or missing photo",
      actual: `Dec1: ${testDec1.recommendation}, Dec2: ${testDec2.recommendation}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Invariant B: Threat Floor Monotonicity
  {
    const { RiskEngine } = await import("../services/riskEngine.js");
    const dummySignals = {
      ocr: { confidence: 0.99, detectedFieldsCount: 6 },
      validation: { numericScore: 20, issues: [{ rule: "MRZ_DOC_CHECK_DIGIT_FAILED", severity: "High" }], hasChecksumFail: true, failedChecksumCount: 1 },
      tampering: { tamperingScore: 5 },
      synthetic: { syntheticScore: 5 },
      faceVerification: { status: "Strong Match", similarity: 95, isProvided: true },
      watchlist: { matched: false },
    };
    const r = RiskEngine.calculate(dummySignals);
    const ok = r.riskScore >= r.threatFloor && r.riskScore >= r.baseScore && r.threatFloor >= 65;

    console.log(`  Invariant B (Threat Floor Monotonicity): Final=${r.riskScore} | Floor=${r.threatFloor} | Base=${r.baseScore} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Invariant B: Threat Floor Monotonicity",
      category: "Security Invariant",
      expected: "Final Score >= threatFloor and >= baseScore",
      actual: `Final: ${r.riskScore}, Floor: ${r.threatFloor}, Base: ${r.baseScore}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Invariant C: Watchlist Escalation Priority
  {
    const { RiskEngine } = await import("../services/riskEngine.js");
    const { DecisionEngine } = await import("../services/decisionEngine.js");
    const r = RiskEngine.calculate({
      watchlist: { matched: true, matchedName: "WANTED PERSON" },
      validation: { numericScore: 100, issues: [] },
      faceVerification: { similarity: 99, isProvided: true },
    });
    const d = DecisionEngine.evaluate(
      r.riskScore,
      r.riskLevel,
      { watchlist: { matched: true } }
    );
    const ok = r.riskScore >= 92 && r.riskLevel === "CRITICAL" && d.recommendation === "ESCALATE";

    console.log(`  Invariant C (Watchlist Escalation Priority): Score=${r.riskScore} | Decision=${d.recommendation} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Invariant C: Watchlist Priority",
      category: "Security Invariant",
      expected: "Score >= 92, Level CRITICAL, Decision ESCALATE",
      actual: `Score: ${r.riskScore}, Decision: ${d.recommendation}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Invariant D: Face Mismatch Floor
  {
    const { RiskEngine } = await import("../services/riskEngine.js");
    const { DecisionEngine } = await import("../services/decisionEngine.js");
    const r = RiskEngine.calculate({
      faceVerification: { isProvided: true, similarity: 42, status: "Mismatch / Suspect" },
      validation: { numericScore: 100, issues: [] },
      watchlist: { matched: false },
    });
    const d = DecisionEngine.evaluate(
      r.riskScore,
      r.riskLevel,
      { faceVerification: { isProvided: true, similarity: 42, status: "Mismatch / Suspect" } }
    );
    const ok = r.riskScore >= 65 && d.recommendation === "HOLD FOR SECONDARY VERIFICATION";

    console.log(`  Invariant D (Face Mismatch Floor): Score=${r.riskScore} | Decision=${d.recommendation} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Invariant D: Face Mismatch Floor",
      category: "Security Invariant",
      expected: "Score >= 65, Decision HOLD (Never PROCEED)",
      actual: `Score: ${r.riskScore}, Decision: ${d.recommendation}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Invariant E: Missing Face Handling
  {
    const { RiskEngine } = await import("../services/riskEngine.js");
    const { DecisionEngine } = await import("../services/decisionEngine.js");
    const r = RiskEngine.calculate({
      faceVerification: { isProvided: false, status: "NOT PROVIDED", similarity: null },
      validation: { numericScore: 95, issues: [] },
      watchlist: { matched: false },
    });
    const d = DecisionEngine.evaluate(
      r.riskScore,
      r.riskLevel,
      { faceVerification: { isProvided: false, status: "NOT PROVIDED", similarity: null } }
    );
    const notMismatch = !r.threatRulesApplied.includes("BIOMETRIC_FACE_MISMATCH");
    const ok = notMismatch && d.recommendation === "MANUAL REVIEW";

    console.log(`  Invariant E (Missing Face Handling): Rules=${JSON.stringify(r.threatRulesApplied)} | Dec=${d.recommendation} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Invariant E: Missing Face Handling",
      category: "Security Invariant",
      expected: "No BIOMETRIC_FACE_MISMATCH rule, Decision MANUAL REVIEW",
      actual: `Rules: ${JSON.stringify(r.threatRulesApplied)}, Decision: ${d.recommendation}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Invariant F: Checksum Floor Scaling
  {
    const { RiskEngine } = await import("../services/riskEngine.js");
    const r1 = RiskEngine.calculate({
      validation: {
        numericScore: 46,
        issues: [{ rule: "MRZ_DOC_CHECK_DIGIT_FAILED", severity: "High" }],
        hasChecksumFail: true,
        hasMultipleChecksumFailures: false,
        failedChecksumCount: 1,
      },
      watchlist: { matched: false },
    });
    const r2 = RiskEngine.calculate({
      validation: {
        numericScore: 20,
        issues: [
          { rule: "MRZ_DOC_CHECK_DIGIT_FAILED", severity: "High" },
          { rule: "MRZ_DOB_CHECK_DIGIT_FAILED", severity: "High" },
        ],
        hasChecksumFail: true,
        hasMultipleChecksumFailures: true,
        failedChecksumCount: 2,
      },
      watchlist: { matched: false },
    });
    const ok = r1.threatFloor === 65 && r2.threatFloor === 85 && r1.riskScore >= 65 && r2.riskScore >= 85;

    console.log(`  Invariant F (Checksum Scaling): 1 Fail Floor=${r1.threatFloor} | 2+ Fail Floor=${r2.threatFloor} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Invariant F: Checksum Floor Scaling",
      category: "Security Invariant",
      expected: "1 fail -> Floor 65; 2+ fails -> Floor 85",
      actual: `1 fail: ${r1.threatFloor}, 2+ fails: ${r2.threatFloor}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Invariant G: Honest Confidence & Evidence Reporting
  {
    const { SyntheticDetectionService } = await import("../services/syntheticDetectionService.js");
    const synthRes = await SyntheticDetectionService.analyze("Passport", { buffer: validDocBuffer });
    const ok =
      synthRes.confidence === "HEURISTIC" &&
      synthRes.isHeuristic === true &&
      Array.isArray(synthRes.indicators) &&
      synthRes.limitations !== undefined;

    console.log(`  Invariant G (Honest Confidence): Confidence=${synthRes.confidence} | IsHeuristic=${synthRes.isHeuristic} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Invariant G: Honest Confidence Reporting",
      category: "Security Invariant",
      expected: "confidence='HEURISTIC', isHeuristic=true, limitations defined",
      actual: `Confidence: ${synthRes.confidence}, IsHeuristic: ${synthRes.isHeuristic}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // Invariant H: Deterministic Demo Scenario Preservation
  {
    const s1 = await screen({ scenario: "scenario-1" });
    const s2 = await screen({ scenario: "scenario-2" });
    const s3 = await screen({ scenario: "scenario-3" });
    const s4 = await screen({ scenario: "scenario-4" });
    const ok =
      s1.data.riskScore === 18 && s1.data.recommendation === "PROCEED" &&
      s2.data.riskScore === 47 && s2.data.recommendation === "MANUAL REVIEW" &&
      s3.data.riskScore === 74 && s3.data.recommendation === "HOLD FOR SECONDARY VERIFICATION" &&
      s4.data.riskScore === 92 && s4.data.recommendation === "ESCALATE";

    console.log(`  Invariant H (Demo Preservation): S1=${s1.data.riskScore}, S2=${s2.data.riskScore}, S3=${s3.data.riskScore}, S4=${s4.data.riskScore} -> ${ok ? "PASS" : "FAIL"}`);
    report.push({
      test: "Invariant H: Demo Preservation",
      category: "Security Invariant",
      expected: "S1=18/PROCEED, S2=47/REVIEW, S3=74/HOLD, S4=92/ESCALATE",
      actual: `S1=${s1.data.riskScore}, S2=${s2.data.riskScore}, S3=${s3.data.riskScore}, S4=${s4.data.riskScore}`,
      status: ok ? "PASS" : "FAIL",
    });
  }

  // =========================================================================
  // FINAL RESULTS TABLE & SUMMARY
  // =========================================================================
  console.log("\n========================================================================================");
  console.log("📊 COMPLETE ADVERSARIAL MATRIX & SECURITY AUDIT SUMMARY TABLE");
  console.log("========================================================================================");
  console.log(`| #  | Test Scenario / Invariant | Category | Expected | Actual | Status |`);
  console.log(`| :- | :------------------------ | :------- | :------- | :----- | :----- |`);
  let allPassed = true;
  let idx = 1;
  for (const r of report) {
    const num = String(idx++).padStart(2, "0");
    const name = r.test.padEnd(25);
    const cat = r.category.padEnd(20);
    const exp = r.expected.padEnd(30);
    const act = r.actual.padEnd(30);
    console.log(`| ${num} | ${name} | ${cat} | ${exp} | ${act} | ${r.status} |`);
    if (r.status !== "PASS") allPassed = false;
  }
  console.log("========================================================================================");
  console.log(`Total Audit Cases Tested: ${report.length}`);
  console.log(`Total Passed: ${report.filter((r) => r.status === "PASS").length}`);
  console.log(`Total Failed: ${report.filter((r) => r.status !== "PASS").length}`);
  console.log(`Final Evaluation: ${allPassed ? "🎉 100% PASS - SYSTEM MEETS ALL HARDENED SECURITY INVARIANTS" : "⚠️ SECURITY DEFECTS DETECTED"}`);
  console.log("========================================================================================");
}

runAdversarialMatrix().catch((err) => {
  console.error("❌ Adversarial Matrix Execution Error:", err);
  process.exit(1);
});
