import admin, { ServiceAccount } from "firebase-admin";
import { config } from "../config";

const serviceAccountBase64 = config.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountBase64) {
  console.error(
    "Error: FIREBASE_SERVICE_ACCOUNT environment variable is not set."
  );
  process.exit(1);
}

try {
  const serviceAccount = JSON.parse(
    Buffer.from(serviceAccountBase64, "base64").toString("utf-8")
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as ServiceAccount),
  });

  console.log("Firebase admin initialized");
} catch (error) {
  console.error("Error initializing Firebase Admin SDK:", error);
  process.exit(1);
}
