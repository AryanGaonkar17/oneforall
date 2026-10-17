
var selectedProduct = null;

var products = [
  {
    name: "Homemade Chakli",
    price: 150,
    description:
      "Crispy, golden-brown traditional Indian spiral snacks, perfect for tea-time and festive celebrations.",
    image: "./img/Homemade Chakli.png",
  },
  {
    name: "Homemade Papad",
    price: 100,
    description:
      "Traditional Indian papad made for a crunchy, delicious accompaniment to everyday meals. Easy to roast or fry before serving.",
    image: "./img/Homemade Papad.jpeg",
  },
  {
    name: "Milk Masala",
    price: 80,
    description:
      "A flavourful blend of aromatic spices and nuts that adds a rich taste and delightful aroma to milk and desserts.",
    image: "./img/Milk Masala.jpg",
  },
  {
    name: "Decorative Welcome Rangoli",
    price: 300,
    description:
      "Beautiful handmade floral decorations with vibrant colours, ideal for welcoming guests during festivals and special occasions.",
    image: "./img/Decorative Welcome Rangoli.jpeg",
  },
  {
    name: "Woolen Chorang Mat Rangoli",
    price: 599,
    description:
      "Beautiful handmade woolen rangoli mat featuring a traditional Swastik design, vibrant colours, and decorative fringes. Perfect for puja rooms, festivals, Diwali, and home decoration.",
    image: "./img/Woolen Chorang Mat Rangoli.jpeg",
  },
  {
    name: "Handmade Floral Rangoli Mats",
    price: 400,
    description:
      "Colourful, reusable floral mats that bring a traditional and elegant touch to your home entrance and festive decor.",
    image: "./img/Handmade Floral Rangoli Mats.jpeg",
  },
];

// Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyDpBD_xV5vSJGmNniZP2aKpbRe5dTyvgnc",
  authDomain: "fo-54617.firebaseapp.com",
  projectId: "fo-54617",
  storageBucket: "fo-54617.firebasestorage.app",
  messagingSenderId: "475829954674",
  appId: "1:475829954674:web:6e5d6aaaafd503a8fa3aeb",
  measurementId: "G-W3NE4X8S71",
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

var auth = firebase.auth();
var db = firebase.firestore();

// Keep the displayed page in sync with login status
auth.onAuthStateChanged(function (user) {
  if (user) {
    showPage("home-page");
  } else {
    showPage("login-page");
  }
});

function showPage(pageId) {
  var pages = document.getElementsByClassName("page");

  for (var i = 0; i < pages.length; i++) {
    pages[i].classList.remove("active");
  }

  if (pageId === "about-section") {
    document.getElementById("home-page").classList.add("active");
    document.getElementById("about-section").scrollIntoView();
  } else {
    document.getElementById(pageId).classList.add("active");
    window.scrollTo(0, 0);
  }
}

function getLoginDetails() {
  var emailInput = document.getElementById("email");
  var passwordInput = document.getElementById("password");

  if (!emailInput || !passwordInput) {
    alert("Please check the email and password fields in index.html.");
    return null;
  }

  var email = emailInput.value.trim();
  var password = passwordInput.value;

  if (!email || !password) {
    alert("Please enter your email address and password.");
    return null;
  }

  return { email: email, password: password };
}

// Register a new customer
function register() {
  var details = getLoginDetails();
  if (!details) return;

  auth
    .createUserWithEmailAndPassword(details.email, details.password)
    .then(function () {
      alert("Account created successfully!");
      showPage("home-page");
    })
    .catch(function (error) {
      console.error("Registration error:", error);
      alert("Registration failed: " + error.message);
    });
}

// Log in an existing customer
function login() {
  var details = getLoginDetails();
  if (!details) return;

  auth
    .signInWithEmailAndPassword(details.email, details.password)
    .then(function () {
      alert("Login successful!");
      showPage("home-page");
    })
    .catch(function (error) {
      console.error("Login error:", error);
      alert("Login failed: " + error.message);
    });
}

// Log out the current customer
function logout() {
  auth
    .signOut()
    .then(function () {
      selectedProduct = null;
      showPage("login-page");
      alert("You have logged out.");
    })
    .catch(function (error) {
      console.error("Logout error:", error);
      alert("Logout failed: " + error.message);
    });
}

function showProduct(productNumber) {
  if (!auth.currentUser) {
    alert("Please log in first.");
    showPage("login-page");
    return;
  }

  var product = products[productNumber];
  if (!product) return;

  selectedProduct = product;

  document.getElementById("detail-image").src = product.image;
  document.getElementById("detail-name").innerText = product.name;
  document.getElementById("detail-description").innerText =
    product.description;
  document.getElementById("detail-price").innerText =
    "₹" + product.price;
  document.getElementById("quantity").value = 1;

  showPage("product-page");
}

// Save an order to Firestore
async function buyNow() {
  var user = auth.currentUser;

  if (!user) {
    alert("Please log in before placing an order.");
    showPage("login-page");
    return;
  }

  if (!selectedProduct) {
    alert("Please select a product first.");
    return;
  }

  var quantity = Number(document.getElementById("quantity").value);

  if (
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 100
  ) {
    alert("Please enter a whole-number quantity from 1 to 100.");
    return;
  }

  var total = selectedProduct.price * quantity;

  try {
    await db.collection("orders").add({
      userId: user.uid,
      customerEmail: user.email,
      productName: selectedProduct.name,
      quantity: quantity,
      unitPrice: selectedProduct.price,
      total: total,
      status: "Pending",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    alert(
      "Order saved successfully!\n\n" +
        quantity +
        " x " +
        selectedProduct.name +
        "\nTotal: ₹" +
        total
    );
  } catch (error) {
    console.error("Order saving error:", error);
    alert("Could not save your order. Please check your connection and Firestore rules.\n" + error.message);
  }
}
