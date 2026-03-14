document.addEventListener("DOMContentLoaded", () => {
  /* PARTICLE BACKGROUND (your original, unchanged logic) */
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

  /* VOLUNTEER DATA + LOGIC (your original, with no functional change) */
  let volunteers = [
    { name: "Arjun Kumar", email: "arjun@email.com", status: "Available", event: "-", role: "-" },
    { name: "Meena Raj", email: "meena@email.com", status: "Available", event: "-", role: "-" }
  ];

  const assignForm = document.getElementById("assignForm");
  const selectVolunteer = document.getElementById("selectVolunteer");
  const table = document.getElementById("volunteerTable");

  function loadVolunteers() {
    if (!table || !selectVolunteer) return;

    table.innerHTML = "";
    selectVolunteer.innerHTML = '<option value="">Select Volunteer</option>';

    volunteers.forEach((volunteer, index) => {
      if (volunteer.status === "Available") {
        selectVolunteer.innerHTML += `
          <option value="${index}">${volunteer.name}</option>
        `;
      }

      table.innerHTML += `
        <tr>
          <td>${volunteer.name}</td>
          <td>${volunteer.email}</td>
          <td>${volunteer.status}</td>
          <td>${volunteer.event}</td>
          <td>${volunteer.role}</td>
          <td>
            <button class="btn secondary ripple" onclick="removeAssignment(${index})">Remove</button>
          </td>
        </tr>
      `;
    });

    attachRippleToNewButtons();
  }

  if (assignForm) {
    assignForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const volunteerIndex = selectVolunteer.value;
      const eventName = document.getElementById("assignedEvent").value;
      const role = document.getElementById("assignedRole").value;

      if (volunteerIndex === "") {
        alert("Select a volunteer.");
        return;
      }

      volunteers[volunteerIndex].event = eventName;
      volunteers[volunteerIndex].role = role;
      volunteers[volunteerIndex].status = "Assigned";

      assignForm.reset();
      loadVolunteers();
    });
  }

  window.removeAssignment = function (index) {
    volunteers[index].event = "-";
    volunteers[index].role = "-";
    volunteers[index].status = "Available";
    loadVolunteers();
  };

  loadVolunteers();

  /* SCROLL REVEAL for sections */
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

  /* SCROLL PROGRESS BAR */
  const progressBar = document.getElementById("scrollProgress");
  function updateScrollProgress() {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + "%";
  }
  window.addEventListener("scroll", updateScrollProgress);
  updateScrollProgress();

  /* NAV LINK ACTIVE STATE ON SCROLL */
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".nav-link");

  function setActiveNav() {
    let current = "";
    sections.forEach(sec => {
      const secTop = sec.offsetTop - 120;
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

  /* BUTTON RIPPLE HANDLER */
  function attachRippleToNewButtons() {
    document.querySelectorAll(".ripple").forEach(btn => {
      btn.addEventListener("click", function (e) {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        btn.style.setProperty("--ripple-x", x + "px");
        btn.style.setProperty("--ripple-y", y + "px");
        btn.classList.remove("clicked");
        void btn.offsetWidth; // force reflow
        btn.classList.add("clicked");
      });
    });
  }
  attachRippleToNewButtons();

  /* HOVER TILT EFFECT (subtle 3D) */
//   const tiltElements = document.querySelectorAll(".hover-tilt");
//   tiltElements.forEach(el => {
//     el.addEventListener("mousemove", (e) => {
//       const rect = el.getBoundingClientRect();
//       const x = e.clientX - rect.left - rect.width / 2;
//       const y = e.clientY - rect.top - rect.height / 2;
//       const rotateX = (y / rect.height) * -6;
//       const rotateY = (x / rect.width) * 6;
//       el.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
//     });
//     el.addEventListener("mouseleave", () => {
//       el.style.transform = "rotateX(0) rotateY(0) translateY(0)";
    });
//   });
// });
