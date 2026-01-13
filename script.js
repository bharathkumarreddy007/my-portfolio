// Mobile nav toggle
const hamburgerBtn = document.getElementById("hamburgerBtn");
const navMenu = document.getElementById("navMenu");

hamburgerBtn.addEventListener("click", () => {
  navMenu.classList.toggle("open");
});

// Close nav on link click
document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => navMenu.classList.remove("open"));
});

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Fake form submit
function handleSubmit(e) {
  e.preventDefault();
  document.getElementById("formStatus").textContent =
    "Thank you! This form is a demo only.";
}

// Theme toggle
const themeToggle = document.getElementById("themeToggle");
const body = document.body;

if (localStorage.getItem("theme") === "light") {
  body.classList.add("light");
}

themeToggle.addEventListener("click", () => {
  body.classList.toggle("light");
  localStorage.setItem(
    "theme",
    body.classList.contains("light") ? "light" : "dark"
  );
});
