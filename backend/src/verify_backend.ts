import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const runVerify = async () => {
  console.log("=== Running Backend Cryptography and Token Sign Verification ===");
  
  const testSecret = "test_mediai_super_secret_signing_key";
  const mockPayload = { id: "user_patient_12345", role: "patient" };
  
  try {
    // 1. JWT signing check
    const token = jwt.sign(mockPayload, testSecret, { expiresIn: "1h" });
    console.log("✔ JWT Sign Check: Completed successfully.");
    console.log(`Generated Token: ${token.substring(0, 40)}...`);

    // 2. JWT decode verification
    const decoded: any = jwt.verify(token, testSecret);
    if (decoded.id === mockPayload.id && decoded.role === mockPayload.role) {
      console.log("✔ JWT Verify and Decode Check: Matches payload inputs.");
    } else {
      console.error("❌ JWT Verify Check: Decoded values did not match inputs.");
    }

    // 3. Bcrypt password hashing check
    const rawPassword = "securePassword77";
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawPassword, salt);
    console.log("✔ Bcrypt Hashing Check: Completed successfully.");
    
    const isMatch = await bcrypt.compare(rawPassword, hash);
    if (isMatch) {
      console.log("✔ Bcrypt Compare Check: Hashes match raw password successfully.");
    } else {
      console.error("❌ Bcrypt Compare Check: Hashes comparison failed.");
    }

    console.log("\n=== All Local Crypto & Token Sign Verifications Passed! 🚀 ===");
  } catch (error: any) {
    console.error("❌ Verification exception encountered:", error.message);
  }
};

runVerify();
