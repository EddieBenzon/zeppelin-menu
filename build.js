// Build script to inject environment variables securely
const fs = require("fs");
const path = require("path");

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
  console.log("Starting build process...");

  // Check if config file exists
  const configPath = path.join(__dirname, "js", "config.js");
  if (!fs.existsSync(configPath)) {
    throw new Error(`Config file not found: ${configPath}`);
  }

  // Read the config template
  let configContent = fs.readFileSync(configPath, "utf8");
  console.log("Config file read successfully");

  // Get environment variables - MUST be set in Netlify
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminKey = process.env.ADMIN_KEY;

  console.log("🔍 Checking environment variables...");
  console.log("ADMIN_PASSWORD:", adminPassword ? "SET" : "MISSING");
  console.log("ADMIN_KEY:", adminKey ? "SET" : "MISSING");

  if (!adminPassword || !adminKey) {
    throw new Error(
      "ADMIN_PASSWORD and ADMIN_KEY environment variables must be set in Netlify"
    );
  }

  // Create hash of the password
  const passwordHash = simpleHash(adminPassword);
  console.log("Password hash generated:", passwordHash);

  // Replace placeholders with actual values
  configContent = configContent.replace(
    "__ADMIN_PASSWORD_HASH__",
    passwordHash
  );
  configContent = configContent.replace("__ADMIN_KEY__", adminKey);

  // Write the updated config
  fs.writeFileSync(configPath, configContent);

  console.log("Build complete! Environment variables injected securely.");
  console.log("Password hash:", passwordHash);
  console.log("Admin key:", adminKey);
} catch (error) {
  console.error("Build failed:", error.message);
  console.error("Stack trace:", error.stack);
  process.exit(1);
}
