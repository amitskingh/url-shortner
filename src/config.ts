import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

export const config = {
  PORT: process.env.PORT || 3000,
  REDIS_URL: process.env.REDIS_URL!,
  clickChannel: 'clickUpdates',
  AccountID: process.env.AccountID!,
  LicenseKey: process.env.LicenseKey!
};


const good = {
  google: 'google',
}