document.addEventListener("DOMContentLoaded", () => {
  // 1. PERSISTENT SCROLL ANIMATION
  const observerOptions = {
    threshold: 0.2,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
      } else {
        entry.target.classList.remove("active");
      }
    });
  }, observerOptions);

  document
    .querySelectorAll(".feature-item")
    .forEach((el) => observer.observe(el));

  // 2. REDIRECT BUTTON LOGIC (if you add any .redirect-btn later)
  document.querySelectorAll(".redirect-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const url = button.getAttribute("data-url");
      if (url) {
        window.location.href = url;
      }
    });
  });

  // 3. CARD CLICK REDIRECT
  document.querySelectorAll(".event-card").forEach((card) => {
    card.addEventListener("click", () => {
      const url = card.getAttribute("data-url");
      if (url) {
        window.location.href = url;
      }
    });
  });
});
const canvas = document.getElementById("particleWave");
const ctx = canvas.getContext("2d");

let particles = [];
let time = 0;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  createParticles();
}

window.addEventListener("resize", resize);

function createParticles() {
  particles = [];
  const gap = 60; // density
  for (let y = 0; y < canvas.height; y += gap) {
    for (let x = 0; x < canvas.width; x += gap) {

      particles.push({
        baseX: x,
        baseY: y,
        size: Math.random() * 1.2 + 0.8,
        depth: Math.random() * 1.5 + 0.6, // parallax
        phase: Math.random() * Math.PI *4
      });

    }
  }
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const p of particles) {

    // 🌊 REALISTIC DIAGONAL SEA WAVE (TRIG)
    const wave =
      Math.sin((p.baseX + p.baseY) * 0.012 + time + p.phase) * 14 * p.depth +
      Math.sin((p.baseX - p.baseY) * 0.008 + time * 1.6) * 8;

    const x = p.baseX + wave * 0.8;
    const y = p.baseY + wave * 0.4;

    // shimmer (light reflection)
    const alpha = 0.15 + (Math.sin(time + p.phase) + 1) * 0.15;

    ctx.beginPath();
    ctx.arc(x, y, p.size * p.depth, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fill();
  }

  time += 0.015;
  requestAnimationFrame(animate);
}

resize();
animate();

const navbar = document.querySelector(".navbar");

// window.addEventListener("scroll", () => {
//   if (window.scrollY > 80) {
//     navbar.classList.add("dimmed");
//   } else {
//     navbar.classList.remove("dimmed");
//   }
// });
