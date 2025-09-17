const fs = require("fs");
const path = require("path");

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
}

try {
  console.log("Starting build process...");

  const configPath = path.join(__dirname, "js", "config.js");
  if (!fs.existsSync(configPath)) {
  }

  let configContent = fs.readFileSync(configPath, "utf8");
  console.log("Config file read successfully");

  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminKey = process.env.ADMIN_KEY;

  if (!adminPassword || !adminKey) {
    throw new Error(
      "ADMIN_PASSWORD and ADMIN_KEY environment variables must be set in Netlify"
    );
  }

  const passwordHash = simpleHash(adminPassword);

  configContent = configContent.replace(
    "__ADMIN_PASSWORD_HASH__",
    passwordHash
  );
  configContent = configContent.replace("__ADMIN_KEY__", adminKey);

  fs.writeFileSync(configPath, configContent);
} catch (error) {
  console.error("Build failed:", error.message);
  console.error("Stack trace:", error.stack);
  process.exit(1);
}
