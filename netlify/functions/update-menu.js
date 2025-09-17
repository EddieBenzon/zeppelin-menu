const { Octokit } = require("@octokit/rest");

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString();
}

exports.handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { menuData, password } = JSON.parse(event.body);

    const expectedPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    const providedPasswordHash = simpleHash(password);

    if (providedPasswordHash !== expectedPasswordHash) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: "Invalid password" }),
      };
    }

    if (
      !menuData ||
      !menuData.cafeName ||
      !Array.isArray(menuData.categories)
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid menu data structure" }),
      };
    }

    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
    });

    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const path = "menu.json";

    let currentFile;
    try {
      const response = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
      });
      currentFile = response.data;
    } catch (error) {
      if (error.status !== 404) throw error;
    }

    const newContent = Buffer.from(JSON.stringify(menuData, null, 2)).toString(
      "base64"
    );

    const updateParams = {
      owner,
      repo,
      path,
      message: `Update menu via admin panel - ${new Date().toISOString()}`,
      content: newContent,
    };

    if (currentFile) {
      updateParams.sha = currentFile.sha;
    }

    await octokit.rest.repos.createOrUpdateFileContents(updateParams);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST",
      },
      body: JSON.stringify({
        success: true,
        message:
          "Menu updated successfully! Changes will be live in 1-2 minutes.",
      }),
    };
  } catch (error) {
    console.error("Function error:", error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      }),
    };
  }
};
