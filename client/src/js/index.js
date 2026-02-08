/**
 * ==========================================
 * HEADER & NAVIGATION LOGIC
 * ==========================================
 * Handles mobile menu toggling and sticky header effects.
 * Used in: <header id="main-header">
 */

// Mobile Menu Toggle
const mobileBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

// Header Scroll Effect
const header = document.getElementById('main-header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('shadow-md');
        header.classList.add('bg-opacity-95');
    } else {
        header.classList.remove('shadow-md');
        header.classList.remove('bg-opacity-95');
    }
});


/**
 * ==========================================
 * ANIMATIONS
 * ==========================================
 * Intersection Observer for fade-in animations on scroll.
 * Used in: Elements with class 'fade-in-up' or 'sequence-animate'
 */
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in-up, .sequence-animate').forEach(el => {
    observer.observe(el);
});


/**
 * ==========================================
 * HERO SECTION ANIMATION (LOGO)
 * ==========================================
 * Canvas-based frame animation for the logo.
 * Used in: <div class="... justify-center overflow-hidden" onclick="playFrameAnimation()">
 */
const totalFrames = 54;
const processedFrames = []; // Stores cleaned ImageBitmaps
let framesLoaded = false;

// Canvas Setup
const canvas = document.getElementById('logo-canvas');
let ctx;
if (canvas) {
    ctx = canvas.getContext('2d', { willReadFrequently: true });
}

// Preload & Process Images (Remove White Background)
async function preloadAndProcessFrames() {
    if (framesLoaded) return;
    if (!canvas) return;

    const framePrefix = "public/assets/images/frames/ezgif-frame-";
    const frameSuffix = ".jpg";

    // Temporary helper canvas for pixel manipulation
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });

    console.log("Starting frame processing...");

    for (let i = 1; i <= totalFrames; i++) {
        const num = i.toString().padStart(3, '0');
        const src = `${framePrefix}${num}${frameSuffix}`;

        try {
            // Load raw image
            const img = await new Promise((resolve, reject) => {
                const image = new Image();
                image.onload = () => resolve(image);
                image.onerror = reject;
                image.src = src;
            });

            // Set dimensions once based on first frame
            if (i === 1) {
                tempCanvas.width = img.naturalWidth;
                tempCanvas.height = img.naturalHeight;
                canvas.width = img.naturalWidth;
                canvas.height = img.naturalHeight;
            }

            // Draw to temp canvas
            tempCtx.drawImage(img, 0, 0);

            // Get pixel data
            const frameData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
            const data = frameData.data;

            // Pixel manipulation: 
            // 1. Turn white/near-white to transparent
            // 2. Tint black text to Teal (#439093 -> R:67, G:144, B:147)
            for (let j = 0; j < data.length; j += 4) {
                const r = data[j];
                const g = data[j + 1];
                const b = data[j + 2];

                // If pixel is very bright (near white), make it transparent
                if (r > 230 && g > 230 && b > 230) {
                    data[j + 3] = 0; // Alpha = 0
                } else {
                    // Tint to Teal if it's not transparent
                    // New Teal: #026670 -> R:2, G:102, B:112
                    data[j] = 2;     // R
                    data[j + 1] = 102; // G
                    data[j + 2] = 112; // B
                    // Keep original alpha
                }
            }

            // Create clean ImageBitmap
            tempCtx.putImageData(frameData, 0, 0);
            const cleanBitmap = await createImageBitmap(tempCanvas);
            processedFrames.push(cleanBitmap);
        } catch (error) {
            console.error(`Failed to load frame ${i}:`, error);
        }
    }

    framesLoaded = true;
    console.log("All frames processed and ready.");
    playFrameAnimation();
}

// Trigger preload
window.addEventListener('load', preloadAndProcessFrames);

function playFrameAnimation() {
    if (!framesLoaded) {
        console.warn("Frames not ready yet!");
        return;
    }

    const staticLogo = document.getElementById('static-logo');
    const canvas = document.getElementById('logo-canvas');

    if (!staticLogo || !canvas) return;

    // Swap to canvas
    staticLogo.classList.add('hidden');
    canvas.classList.remove('hidden');

    let currentFrameIndex = 0;
    const fps = 24;
    const interval = 1000 / fps;

    const animInterval = setInterval(() => {
        if (currentFrameIndex >= totalFrames) {
            clearInterval(animInterval);
            // Reset
            canvas.classList.add('hidden');
            staticLogo.classList.remove('hidden');
            // Clear canvas for next run
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        // Draw clean frame
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Optional clean
        ctx.drawImage(processedFrames[currentFrameIndex], 0, 0);

        currentFrameIndex++;
    }, interval);
}


/**
 * ==========================================
 * FEATURE & TESTIMONIALS LOGIC
 * ==========================================
 * Handles video playback controls and the testimonials carousel.
 * Used in: <section id="features"> and <section id="testimonials">
 */
document.addEventListener('DOMContentLoaded', () => {
    // General auto-play
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
        video.muted = true;
        video.play().catch(e => console.log("Video play failed:", e));
    });

    // Feature 1 Play/Pause Logic
    const f1Btn = document.getElementById('feature-btn-1');
    const f1Video = document.getElementById('feature-video-1');
    const iconPause = document.getElementById('icon-pause-1');
    const iconPlay = document.getElementById('icon-play-1');

    if (f1Btn && f1Video) {
        f1Btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (f1Video.paused) {
                f1Video.play();
                iconPause.classList.remove('hidden');
                iconPlay.classList.add('hidden');
            } else {
                f1Video.pause();
                iconPause.classList.add('hidden');
                iconPlay.classList.remove('hidden');
            }
        });
    }

    // Testimonials Carousel Logic
    const testimonials = [
        { text: "Managing 50 volunteers was a breeze. The dashboard saved my life.", name: "Sarah Jenkins", role: "Event Organizer", type: "organizer", rating: 5 },
        { text: "Great platform for finding gigs. The app feels a bit heavy on older phones, but coordination is smooth.", name: "Mike Chen", role: "Volunteer", type: "volunteer", rating: 4 },
        { text: "Finally an app that understands operations. Pure genius.", name: "David Ross", role: "Event Organizer", type: "organizer", rating: 5 },
        { text: "Love tracking my hours, but the report export feature could be more intuitive.", name: "Lisa Wong", role: "Volunteer", type: "volunteer", rating: 4 },
        { text: "Our efficiency doubled after switching to EventHive.", name: "James Miller", role: "Event Organizer", type: "organizer", rating: 5 },
        { text: "Solid community. The notifications can be a bit overwhelming during big events though.", name: "Emily Clark", role: "Volunteer", type: "volunteer", rating: 4 },
        { text: "The 'God View' feature is exactly what we needed for our mega-events.", name: "Robert Fox", role: "Event Organizer", type: "organizer", rating: 5 },
        { text: "Signing up was easy. Took a day to get the approval, but worth the wait.", name: "Alex P.", role: "Volunteer", type: "volunteer", rating: 4 },
        { text: "No more spreadsheets! Everything is automated now.", name: "Samantha Lee", role: "Event Organizer", type: "organizer", rating: 5 },
    ];

    const track = document.getElementById('testimonial-track');
    if (track) {
        // Populate Cards
        testimonials.forEach(t => {
            const card = document.createElement('div');
            // w-full on mobile (1 per view), w-1/3 on desktop (3 per view)
            card.className = "w-full md:w-1/3 flex-shrink-0 px-4";
            card.innerHTML = `
            <div class="bg-white p-8 rounded-3xl shadow-lg border border-eh-pale h-full flex flex-col justify-between hover:shadow-xl transition-shadow">
                <div>
                    <div class="mb-4">
                        ${Array(t.rating).fill('<span class="text-eh-yellow text-xl">★</span>').join('')}${Array(5 - t.rating).fill('<span class="text-gray-300 text-xl">★</span>').join('')}
                    </div>
                    <p class="text-eh-teal/80 text-lg mb-6 italic">"${t.text}"</p>
                </div>
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${t.type === 'organizer' ? 'bg-eh-teal' : 'bg-eh-mint text-eh-teal'}">
                        ${t.name.charAt(0)}
                    </div>
                    <div>
                        <h4 class="font-bold text-eh-teal">${t.name}</h4>
                        <span class="text-xs uppercase tracking-wider text-gray-400">${t.role}</span>
                    </div>
                </div>
            </div>
        `;
            track.appendChild(card);
        });

        // Carousel State
        let currentIndex = 0;

        function updateCarousel() {
            const isMobile = window.innerWidth < 768;
            const itemsPerView = isMobile ? 1 : 3;
            // Max index is number of "pages" - 1
            const maxIndex = Math.ceil(testimonials.length / itemsPerView) - 1;

            // Loop logic
            if (currentIndex > maxIndex) currentIndex = 0;
            if (currentIndex < 0) currentIndex = maxIndex;

            const translateX = -(currentIndex * 100);
            track.style.transform = `translateX(${translateX}%)`;
        }

        // Auto Play
        let autoTimer = setInterval(() => {
            currentIndex++;
            updateCarousel();
        }, 6000);

        const resetTimer = () => {
            clearInterval(autoTimer);
            autoTimer = setInterval(() => {
                currentIndex++;
                updateCarousel();
            }, 6000);
        };

        // Controls
        const prevBtn = document.getElementById('prev-testimonial');
        const nextBtn = document.getElementById('next-testimonial');

        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                currentIndex--;
                updateCarousel();
                resetTimer();
            });

            nextBtn.addEventListener('click', () => {
                currentIndex++;
                updateCarousel();
                resetTimer();
            });
        }

        window.addEventListener('resize', updateCarousel);
    }
});


/**
 * ==========================================
 * MODAL HANDLERS
 * ==========================================
 * Logic for opening and closing Login and Signup modals.
 * Used in: <div id="login-modal"> and <div id="signup-choice-modal">
 */

// --- Login Modal ---
const loginModal = document.getElementById('login-modal');
const loginBackdrop = document.getElementById('login-backdrop');
const loginPanel = document.getElementById('login-panel');

function openLoginModal() {
    if (!loginModal || !loginBackdrop || !loginPanel) return;

    loginModal.classList.remove('hidden');
    // Small delay to allow display:block to apply before opacity transition
    setTimeout(() => {
        loginBackdrop.classList.remove('opacity-0');
        loginPanel.classList.remove('scale-95', 'opacity-0');
        loginPanel.classList.add('scale-100', 'opacity-100');
    }, 10);
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function closeLoginModal() {
    if (!loginModal || !loginBackdrop || !loginPanel) return;

    loginBackdrop.classList.add('opacity-0');
    loginPanel.classList.remove('scale-100', 'opacity-100');
    loginPanel.classList.add('scale-95', 'opacity-0');

    setTimeout(() => {
        loginModal.classList.add('hidden');
        document.body.style.overflow = ''; // Restore scrolling
    }, 300); // Match transition duration
}

// Close on backdrop click (Login)
if (loginModal) {
    loginModal.addEventListener('click', (e) => {
        if (e.target === loginBackdrop || e.target.closest('#login-backdrop')) {
            closeLoginModal();
        }
    });
}

// Close on Escape key (Login)
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && loginModal && !loginModal.classList.contains('hidden')) {
        closeLoginModal();
    }
});


// --- Signup Choice Modal ---
const signupBackdrop = document.getElementById('signup-backdrop');
const signupModal = document.getElementById('signup-choice-modal');
const signupPanel = document.getElementById('signup-panel');

function openSignupModal() {
    if (!signupModal || !signupBackdrop || !signupPanel) return;

    signupModal.classList.remove('hidden');
    setTimeout(() => {
        signupBackdrop.classList.remove('opacity-0');
        signupPanel.classList.remove('scale-95', 'opacity-0');
        signupPanel.classList.add('scale-100', 'opacity-100');
    }, 10);
    document.body.style.overflow = 'hidden';
}

function closeSignupModal() {
    if (!signupModal || !signupBackdrop || !signupPanel) return;

    signupBackdrop.classList.add('opacity-0');
    signupPanel.classList.remove('scale-100', 'opacity-100');
    signupPanel.classList.add('scale-95', 'opacity-0');

    setTimeout(() => {
        signupModal.classList.add('hidden');
        document.body.style.overflow = '';
    }, 300);
}

if (signupModal) {
    signupModal.addEventListener('click', (e) => {
        if (e.target === signupBackdrop || e.target.closest('#signup-backdrop')) {
            closeSignupModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && signupModal && !signupModal.classList.contains('hidden')) {
            closeSignupModal();
        }
    });
}
