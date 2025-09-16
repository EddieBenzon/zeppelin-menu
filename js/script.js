// Main application logic
class ZeppelinMenu {
  constructor() {
    this.menuData = this.loadMenuData();
    this.init();
  }

  init() {
    this.renderMenu();
    this.checkAdminAccess();
    this.bindEvents();
  }

  loadMenuData() {
    const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
    return saved ? JSON.parse(saved) : CONFIG.DEFAULT_MENU;
  }

  saveMenuData() {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(this.menuData));
  }

  renderMenu() {
    // Update header
    document.getElementById("cafe-name").textContent = this.menuData.cafeName;
    document.getElementById("cafe-tagline").textContent = this.menuData.tagline;

    // Generate menu HTML
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

  updateMenu() {
    try {
      const newMenuData = JSON.parse(
        document.getElementById("menu-editor").value
      );

      // Basic validation
      if (!this.validateMenuData(newMenuData)) {
        throw new Error("Invalid menu structure");
      }

      this.menuData = newMenuData;
      this.saveMenuData();
      this.renderMenu();

      alert("Menu updated successfully!");
      this.toggleAdmin();
    } catch (error) {
      alert("Invalid JSON format or menu structure. Please check your data.");
      console.error("Menu update error:", error);
    }
  }

  validateMenuData(data) {
    // Basic validation - ensure required structure exists
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
    // Close admin panel when clicking outside
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

// Global functions for HTML onclick handlers
function toggleAdmin() {
  app.toggleAdmin();
}

function updateMenu() {
  app.updateMenu();
}

function resetMenu() {
  app.resetMenu();
}

// Initialize app when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  window.app = new ZeppelinMenu();
});
