import { WebServiceClient } from "@maxmind/geoip2-node";
import { error } from "console";
import dotenv from "dotenv";

dotenv.config();

const AccountID = process.env.AccountID || "";
const LicenseKey = process.env.LicenseKey || "";

const client = new WebServiceClient(AccountID, LicenseKey, {
  host: "geolite.info",
});

// You can also use `client.city` or `client.insights`
// `client.insights` is not available to GeoLite2 users
client
  .city("152.58.20.196")
  .then((response) => {
    console.log(response.country?.names.en, response.city?.names.en);
  })
  .catch((error) => {
    console.log(error);
  });
