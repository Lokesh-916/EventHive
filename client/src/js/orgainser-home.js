document.addEventListener("DOMContentLoaded", () => {
  /* PARTICLE BACKGROUND (same pattern as dashboard page) */
  const canvas = document.getElementById("particleWave");
  const ctx = canvas.getContext("2d");

  let particles = [];
  let time = 0;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createParticles();
  }

  function createParticles() {
    particles = [];
    const gap = 60;

    for (let y = 0; y < canvas.height; y += gap) {
      for (let x = 0; x < canvas.width; x += gap) {
        particles.push({
          baseX: x,
          baseY: y,
          size: Math.random() * 1.2 + 0.6,
          depth: Math.random() * 1.5 + 0.5,
          phase: Math.random() * Math.PI * 2
        });
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of particles) {
      const wave =
        Math.sin((p.baseX + p.baseY) * 0.01 + time + p.phase) * 14 * p.depth +
        Math.sin((p.baseX - p.baseY) * 0.006 + time * 1.5) * 8;

      const x = p.baseX + wave * 0.7;
      const y = p.baseY + wave * 0.4;
      const alpha = 0.12 + (Math.sin(time + p.phase) + 1) * 0.15;

      ctx.beginPath();
      ctx.arc(x, y, p.size * p.depth, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();
    }

    time += 0.018;
    requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resize);
  resize();
  animate();

  /* SCROLL REVEAL */
  const revealElements = document.querySelectorAll(".reveal");
  function handleReveal() {
    const trigger = window.innerHeight * 0.85;
    revealElements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < trigger) {
        el.classList.add("visible");
      }
    });
  }
  window.addEventListener("scroll", handleReveal);
  handleReveal();

  /* SCROLL PROGRESS */
  const progressBar = document.getElementById("scrollProgress");
  function updateScrollProgress() {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + "%";
  }
  window.addEventListener("scroll", updateScrollProgress);
  updateScrollProgress();

  /* NAV ACTIVE LINK */
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".nav-link");

  function setActiveNav() {
    let current = "";
    sections.forEach(sec => {
      const secTop = sec.offsetTop - 140;
      if (pageYOffset >= secTop) {
        current = sec.getAttribute("id");
      }
    });

    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href").substring(1) === current) {
        link.classList.add("active");
      }
    });
  }
  window.addEventListener("scroll", setActiveNav);
  setActiveNav();

  /* BUTTON RIPPLE */
  function attachRipple() {
    document.querySelectorAll(".ripple").forEach(btn => {
      btn.addEventListener("click", function(e) {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        btn.style.setProperty("--ripple-x", x + "px");
        btn.style.setProperty("--ripple-y", y + "px");
        btn.classList.remove("clicked");
        void btn.offsetWidth;
        btn.classList.add("clicked");
      });
    });
  }
  attachRipple();

  /* HOVER TILT */
  const tiltElements = document.querySelectorAll(".hover-tilt");
  tiltElements.forEach(el => {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      const rotateX = (y / rect.height) * -6;
      const rotateY = (x / rect.width) * 6;
      el.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "rotateX(0) rotateY(0) translateY(0)";
    });
  });

  /* HERO BUTTON SHORTCUTS */
  const startEventBtn = document.getElementById("startEventBtn");
  const viewOffersBtn = document.getElementById("viewOffersBtn");

  if (startEventBtn) {
    startEventBtn.addEventListener("click", () => {
      document.getElementById("create-event").scrollIntoView({ behavior: "smooth" });
    });
  }
  if (viewOffersBtn) {
    viewOffersBtn.addEventListener("click", () => {
      document.getElementById("offers").scrollIntoView({ behavior: "smooth" });
    });
  }

  /* SAMPLE OFFERS DATA */
  const offersList = document.getElementById("offersList");
  const sampleOffers = [
    {
      clientName: "Ravi Enterprises",
      title: "Corporate New Year Party",
      city: "Hyderabad",
      budget: "₹3,50,000",
      date: "29 Dec 2026",
      notes: "Need stage, DJ, decor and buffet for 300 employees.",
      urgency: "High"
    },
    {
      clientName: "Megha & Family",
      title: "Wedding Reception",
      city: "Bangalore",
      budget: "₹8,00,000",
      date: "12 Nov 2026",
      notes: "Royal theme, live music, floral decor, photography.",
      urgency: "Medium"
    },
    {
      clientName: "TechVerse",
      title: "Developer Conference",
      city: "Chennai",
      budget: "₹5,00,000",
      date: "5 Aug 2026",
      notes: "Conference hall, AV setup, livestream, branding.",
      urgency: "High"
    }
  ];

  function renderOffers() {
    if (!offersList) return;
    offersList.innerHTML = "";
    sampleOffers.forEach((offer, index) => {
      const card = document.createElement("div");
      card.className = "offer-card reveal";
      card.innerHTML = `
        <div class="offer-header">
          <h3>${offer.title}</h3>
          <span class="offer-tag">${offer.clientName}</span>
        </div>
        <div class="offer-meta">
          <span>📍 ${offer.city}</span>
          <span>💰 ${offer.budget}</span>
          <span>📅 ${offer.date}</span>
        </div>
        <p class="offer-notes">${offer.notes}</p>
        <div class="offer-actions">
          <button class="btn secondary ripple" data-index="${index}" data-action="ignore">Ignore</button>
          <button class="btn ripple" data-index="${index}" data-action="accept">Accept Offer</button>
        </div>
      `;
      offersList.appendChild(card);
    });

    attachRipple();
    handleReveal();
  }
  renderOffers();

  /* MY EVENTS TABLE (sample data + created events) */
  const myEventsTable = document.getElementById("myEventsTable");
  const myEvents = [
    {
      name: "Tech Summit 2026",
      type: "Conference",
      date: "15 Jun 2026",
      budget: "₹4,00,000",
      offers: 4,
      status: "Open"
    },
    {
      name: "Startup Pitch Day",
      type: "Workshop",
      date: "2 Mar 2026",
      budget: "₹1,50,000",
      offers: 2,
      status: "Open"
    }
  ];

  function renderMyEvents() {
    if (!myEventsTable) return;
    myEventsTable.innerHTML = "";
    myEvents.forEach(ev => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${ev.name}</td>
        <td>${ev.type}</td>
        <td>${ev.date}</td>
        <td>${ev.budget}</td>
        <td>${ev.offers}</td>
        <td><span class="status-pill status-open">${ev.status}</span></td>
      `;
      myEventsTable.appendChild(tr);
    });
  }
  renderMyEvents();

  /* CREATE EVENT FORM HANDLER */
  const createEventForm = document.getElementById("createEventForm");
  const eventSuccess = document.getElementById("eventSuccess");

  if (createEventForm) {
    createEventForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("eventName").value;
      const type = document.getElementById("eventType").value;
      const date = document.getElementById("eventDate").value;
      const budget = document.getElementById("eventBudget").value;

      myEvents.push({
        name: name || "Untitled Event",
        type: type || "-",
        date: date || "-",
        budget: budget || "-",
        offers: 0,
        status: "Open"
      });

      renderMyEvents();
      createEventForm.reset();

      if (eventSuccess) {
        eventSuccess.classList.remove("hidden");
        eventSuccess.classList.add("visible");
        setTimeout(() => {
          eventSuccess.classList.add("hidden");
        }, 3500);
      }

      handleReveal();
    });
  }

  /* OFFER BUTTON ACTIONS (accept/ignore) */
  if (offersList) {
    offersList.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;

      const index = parseInt(btn.dataset.index, 10);
      const action = btn.dataset.action;
      if (Number.isNaN(index)) return;

      if (action === "accept") {
        alert("Offer accepted! It will now appear under your negotiations.");
        // You can push to a separate accepted list, etc.
      } else if (action === "ignore") {
        sampleOffers.splice(index, 1);
        renderOffers();
      }
    });
  }
});
