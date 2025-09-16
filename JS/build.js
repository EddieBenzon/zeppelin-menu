// Build script to inject environment variables securely
const fs = require("fs");

// Function to create a simple hash (same as in config.js)
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
  // Read the config template
  const configPath = "js/config.js";
  let configContent = fs.readFileSync(configPath, "utf8");

  // Get environment variables - MUST be set in Netlify
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminKey = process.env.ADMIN_KEY;

  if (!adminPassword || !adminKey) {
    throw new Error(
      "ADMIN_PASSWORD and ADMIN_KEY environment variables must be set in Netlify"
    );
  }

  // Create hash of the password
  const passwordHash = simpleHash(adminPassword);

  // Replace placeholders with actual values
  configContent = configContent.replace(
    "__ADMIN_PASSWORD_HASH__",
    passwordHash
  );
  configContent = configContent.replace("__ADMIN_KEY__", adminKey);

  // Write the updated config
  fs.writeFileSync(configPath, configContent);

  console.log("✅ Build complete! Environment variables injected securely.");
  console.log("🔒 Password hash:", passwordHash);
  console.log("🔑 Admin key:", adminKey);
} catch (error) {
  console.error("❌ Build failed:", error.message);
  process.exit(1);
}
