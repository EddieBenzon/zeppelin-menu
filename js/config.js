const CONFIG = {
  ADMIN_PASSWORD_HASH: "__ADMIN_PASSWORD_HASH__",
  ADMIN_KEY: "__ADMIN_KEY__",

  API_BASE_URL: window.location.origin,
  STORAGE_KEY: "zeppelinMenuData",

  DEFAULT_MENU: {
    cafeName: "Zeppelin",
    tagline: "Caffe Music Bar",
    categories: [
      {
        name: "Coffee & Espresso",
        items: [
          {
            name: "Espresso",
            description: "Strong Italian shot, bold and pure",
            price: "8 €",
          },
          {
            name: "Double Espresso",
            description: "When one shot isn't enough",
            price: "12 €",
          },
          {
            name: "Cappuccino",
            description: "Perfect harmony of coffee and milk foam",
            price: "12 €",
          },
          {
            name: "Latte",
            description: "Smooth and creamy, easy listening",
            price: "14 €",
          },
          {
            name: "Macchiato",
            description: "Espresso marked with milk foam",
            price: "10 €",
          },
        ],
      },
      {
        name: "Beverages",
        items: [
          {
            name: "Croatian Beer",
            description: "Local craft selection",
            price: "15 €",
          },
          {
            name: "Wine Selection",
            description: "Red & white by the glass",
            price: "18 €",
          },
          {
            name: "Rakija",
            description: "Traditional Croatian brandy",
            price: "12 €",
          },
          {
            name: "Fresh Juice",
            description: "Orange, apple, or mixed",
            price: "12 €",
          },
          {
            name: "Coca Cola",
            description: "Classic refreshment",
            price: "8 €",
          },
        ],
      },
      {
        name: "Light Bites",
        items: [
          {
            name: "Toast",
            description: "Grilled sandwich with ham & cheese",
            price: "18 €",
          },
          {
            name: "Croissant",
            description: "Fresh buttery pastry",
            price: "8 €",
          },
          {
            name: "Pita",
            description: "Traditional Balkan pastry",
            price: "12 €",
          },
        ],
      },
    ],
  },
};

const AUTH = {
  simpleHash: function (str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return hash.toString();
  },

  validatePassword: function (input) {
    if (!input || CONFIG.ADMIN_PASSWORD_HASH === "__ADMIN_PASSWORD_HASH__") {
      console.warn("Admin password not configured properly");
      return false;
    }

    const inputHash = this.simpleHash(input);
    return inputHash === CONFIG.ADMIN_PASSWORD_HASH;
  },

  validateAdminKey: function (key) {
    if (CONFIG.ADMIN_KEY === "__ADMIN_KEY__") {
      console.warn("Admin key not configured properly");
      return false;
    }

    return key === CONFIG.ADMIN_KEY;
  },
};
