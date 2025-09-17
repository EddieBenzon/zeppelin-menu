// Main application logic
class ZeppelinMenu {
  constructor() {
    this.menuData = null;
    this.init();
  }

  async init() {
    await this.loadMenuData();
    this.renderMenu();
    this.checkAdminAccess();
    this.bindEvents();
  }

  async loadMenuData() {
    try {
      const response = await fetch("/menu.json");
      if (response.ok) {
        this.menuData = await response.json();
        console.log("Menu loaded from server");
        return;
      }
    } catch (error) {
      console.warn("Could not load menu from server, using default");
    }

    this.menuData = CONFIG.DEFAULT_MENU;
  }

  saveMenuData() {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(this.menuData));
  }

  renderMenu() {
    document.getElementById("cafe-name").textContent = this.menuData.cafeName;
    document.getElementById("cafe-tagline").textContent = this.menuData.tagline;

    const menuDisplay = document.getElementById("menu-display");
    menuDisplay.innerHTML = "";

    this.menuData.categories.forEach((category) => {
      const categoryDiv = document.createElement("div");
      categoryDiv.className = "category";

      const categoryTitle = document.createElement("h2");
      categoryTitle.textContent = category.name;
      categoryDiv.appendChild(categoryTitle);

      category.items.forEach((item) => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "menu-item";

        itemDiv.innerHTML = `
                    <div class="item-header">
                        <div class="item-name">${this.escapeHtml(
                          item.name
                        )}</div>
                        <div class="price-line"></div>
                        <div class="item-price">${this.escapeHtml(
                          item.price
                        )}</div>
                    </div>
                    <div class="item-description">${this.escapeHtml(
                      item.description
                    )}</div>
                `;

        categoryDiv.appendChild(itemDiv);
      });

      menuDisplay.appendChild(categoryDiv);
    });
  }

  checkAdminAccess() {
    const urlParams = new URLSearchParams(window.location.search);
    const adminParam = urlParams.get("admin");

    if (AUTH.validateAdminKey(adminParam)) {
      document.getElementById("admin-toggle").classList.remove("hidden");
    }
  }

  toggleAdmin() {
    const adminSection = document.getElementById("admin-section");
    const menuEditor = document.getElementById("menu-editor");

    if (adminSection.classList.contains("visible")) {
      adminSection.classList.remove("visible");
    } else {
      const password = prompt("Enter admin password:");

      if (password && AUTH.validatePassword(password)) {
        adminSection.classList.add("visible");
        menuEditor.value = JSON.stringify(this.menuData, null, 2);
      } else if (password !== null) {
        alert("Incorrect password! Access denied.");
      }
    }
  }

  async updateMenu() {
    try {
      const newMenuData = JSON.parse(
        document.getElementById("menu-editor").value
      );

      if (!this.validateMenuData(newMenuData)) {
        throw new Error("Invalid menu structure");
      }

      const password = prompt("Enter admin password to save changes:");
      if (!password) return;

      const updateButton = document.querySelector(
        'button[onclick="updateMenu()"]'
      );
      const originalText = updateButton.textContent;
      updateButton.textContent = "Saving...";
      updateButton.disabled = true;

      const response = await fetch("/.netlify/functions/update-menu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          menuData: newMenuData,
          password: password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        this.menuData = newMenuData;
        this.renderMenu();

        alert("🎸 " + result.message);
        this.toggleAdmin();
      } else {
        throw new Error(result.error || "Failed to update menu");
      }
    } catch (error) {
      alert("Error: " + error.message);
      console.error("Menu update error:", error);
    } finally {
      // Reset button
      const updateButton = document.querySelector(
        'button[onclick="updateMenu()"]'
      );
      if (updateButton) {
        updateButton.textContent = "Update Menu";
        updateButton.disabled = false;
      }
    }
  }

  resetMenu() {
    if (confirm("Reset to default menu? This cannot be undone.")) {
      this.menuData = { ...CONFIG.DEFAULT_MENU };
      this.saveMenuData();
      document.getElementById("menu-editor").value = JSON.stringify(
        this.menuData,
        null,
        2
      );
      this.renderMenu();
      alert("Menu reset!");
    }
  }

  validateMenuData(data) {
    return (
      data &&
      typeof data === "object" &&
      data.cafeName &&
      data.tagline &&
      Array.isArray(data.categories) &&
      data.categories.every(
        (cat) =>
          cat.name &&
          Array.isArray(cat.items) &&
          cat.items.every((item) => item.name && item.price)
      )
    );
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  bindEvents() {
    document.addEventListener("click", (event) => {
      const adminSection = document.getElementById("admin-section");
      const toggleButton = document.getElementById("admin-toggle");

      if (
        adminSection.classList.contains("visible") &&
        !adminSection.contains(event.target) &&
        !toggleButton.contains(event.target)
      ) {
        adminSection.classList.remove("visible");
      }
    });
  }
}

function toggleAdmin() {
  app.toggleAdmin();
}

function updateMenu() {
  app.updateMenu();
}

function resetMenu() {
  app.resetMenu();
}

document.addEventListener("DOMContentLoaded", async function () {
  window.app = new ZeppelinMenu();
});
