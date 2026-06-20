import fs from "fs/promises";
import path from "path";

export interface Certificate {
  code: string;           // Unique code, e.g. NAFSI-CERT-1052
  traineeName: string;    // Trainee full name in Arabic/English
  courseName: string;     // Course name in Arabic/English
  issueDate: string;      // YYYY-MM-DD
  grade?: string;         // e.g. ممتاز / جيد جداً (Optional)
  hours?: number;         // Number of training hours (Optional)
  instructor?: string;    // Name of the course instructor (Optional)
  status: "ACTIVE" | "REVOKED";
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), "src", "data");
const FILE_PATH = path.join(DATA_DIR, "certificates.json");

// Helper to ensure directory exists
async function ensureDirectory() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    // Already exists or permission error handled by caller
  }
}

// Fetch all certificates
export async function getCertificates(): Promise<Certificate[]> {
  await ensureDirectory();
  try {
    const fileContent = await fs.readFile(FILE_PATH, "utf-8");
    if (!fileContent.trim()) return [];
    return JSON.parse(fileContent);
  } catch (error: any) {
    if (error.code === "ENOENT") {
      // File doesn't exist, initialize with empty array
      await fs.writeFile(FILE_PATH, JSON.stringify([]));
      return [];
    }
    console.error("Error reading certificates file:", error);
    return [];
  }
}

// Save all certificates
export async function saveCertificates(certs: Certificate[]): Promise<boolean> {
  await ensureDirectory();
  try {
    await fs.writeFile(FILE_PATH, JSON.stringify(certs, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing certificates file:", error);
    return false;
  }
}

// Add a certificate
export async function addCertificate(cert: Omit<Certificate, "createdAt">): Promise<Certificate> {
  const certs = await getCertificates();
  
  // Check if code already exists
  const exists = certs.some(c => c.code.toLowerCase() === cert.code.toLowerCase());
  if (exists) {
    throw new Error("كود الشهادة موجود بالفعل، يرجى استخدام كود فريد");
  }

  const newCert: Certificate = {
    ...cert,
    createdAt: new Date().toISOString()
  };

  certs.push(newCert);
  await saveCertificates(certs);
  return newCert;
}

// Delete a certificate by code
export async function deleteCertificate(code: string): Promise<boolean> {
  const certs = await getCertificates();
  const initialLength = certs.length;
  const filtered = certs.filter(c => c.code.toLowerCase() !== code.toLowerCase());
  
  if (filtered.length === initialLength) {
    return false;
  }

  await saveCertificates(filtered);
  return true;
}

// Find a certificate by code
export async function getCertificateByCode(code: string): Promise<Certificate | null> {
  const certs = await getCertificates();
  const cert = certs.find(c => c.code.toLowerCase() === code.toLowerCase());
  return cert || null;
}
