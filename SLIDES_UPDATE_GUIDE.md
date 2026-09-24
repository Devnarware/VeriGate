
### 📝 Exact Changes to Make (Slide by Slide)


---

#### **Slide 2: Problem & Idea**
* **The Problem:** We show the Interpol logo and claim a live connection (which is illegal for students to have).
* **Change:** Update the Watchlist bullet to:
  > **"Watchlist screening modeled after Interpol SLTD & ICAO standards (ready for official government API integration)."**

---

#### **Slide 3: Architecture Diagram**
* **The Problem:** Diagram labels everything as "Python, FastAPI, MongoDB", but our working demo is built on Node.js & React.
* **Change:** Add a small note at the bottom:
  > **"Working Demo Stack: Node.js, Express, React | Production Roadmap: Python FastAPI & MongoDB"**

---

#### **Slide 4: Feasibility**
* **The Problem:** It says "Centralized cases and history", which contradicts our privacy promise ("We delete all passport photos immediately").
* **Change:** Replace with:
  > **"Audit log of verification results (Zero Document Retention: traveler photos and personal data are deleted immediately after scan)."**

---

#### **Slide 6: Tech Stack & AI Models**
* **The Problem:** Mentions PaddleOCR, EasyOCR, FaceNet, ArcFace, and InsightFace that do not exist in our code.
* **Changes:**
  1. **OCR bullet:** 
     * *Change to:* **"Tesseract OCR with ICAO 9303 Checksum Parser (extensible to PaddleOCR / EasyOCR)"**
  2. **Face Verification bullet:** 
     * *Change to:* **"1:1 Facial Structural Alignment & Likeness Analysis (Target AI: FaceNet / InsightFace)"**
  3. **Interpol Logo:** 
     * *Add text under logo:* **"Schema modeled after Interpol SLTD specifications"**