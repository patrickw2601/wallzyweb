document.addEventListener("DOMContentLoaded", function () {
  // Mobile menu toggle
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  if (hamburger) {
    hamburger.addEventListener("click", function () {
      navLinks.classList.toggle("active");
      hamburger.classList.toggle("active");
    });
  }

  // Mobile-only tweak: shorten About title to "Our Story" on phones
  const aboutTitle = document.querySelector(".about-title");
  if (aboutTitle && window.innerWidth <= 480) {
    aboutTitle.textContent = "Our Story";
  }

  // Mobile-only tweak: shorten FAQ title to "FAQ" on phones
  const faqTitle = document.querySelector(".faq h2");
  if (faqTitle && window.innerWidth <= 480) {
    faqTitle.textContent = "FAQ";
  }

  // About video thumbnail -> play iframe
  const aboutVideoFrame = document.querySelector(".about-video-frame");
  if (aboutVideoFrame) {
    const playButton = aboutVideoFrame.querySelector(".about-video-play");
    const iframe = aboutVideoFrame.querySelector("iframe");
    const videoSrc = aboutVideoFrame.dataset.videoSrc;

    if (playButton && iframe && videoSrc) {
      playButton.addEventListener("click", () => {
        if (!aboutVideoFrame.classList.contains("playing")) {
          iframe.src = videoSrc;
          aboutVideoFrame.classList.add("playing");
        }
      });
    }
  }

  // Close mobile menu when clicking a nav link
  const navItems = document.querySelectorAll(".nav-links a");
  navItems.forEach((item) => {
    item.addEventListener("click", function () {
      if (window.innerWidth <= 768) {
        navLinks.classList.remove("active");
        hamburger.classList.remove("active");
      }
    });
  });

  // FAQ Accordion
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");
    if (!question) return; // Skip items that don't have a clickable question

    question.addEventListener("click", () => {
      // Close all other items
      faqItems.forEach((faqItem) => {
        if (faqItem !== item) {
          faqItem.classList.remove("active");
        }
      });

      // Toggle current item
      item.classList.toggle("active");
    });
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    });
  });

  // Add shadow to navbar on scroll
  const nav = document.querySelector("nav");
  if (nav) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 50) {
        nav.style.boxShadow = "0 2px 15px rgba(0, 0, 0, 0.2)";
      } else {
        nav.style.boxShadow = "none";
      }
    });
  }

  // 🚫 IMPORTANT:
  // Disable backend waitlist POST handling.
  // Firebase now fully handles waitlist in index.html.
  // initWaitlistForm(); ❌ Removed on purpose.
});

// 🚫 The entire backend waitlist implementation is disabled
// to prevent conflicts and POST /api/waitlist errors.

/*

function initWaitlistForm() {
    const ctaForm = document.querySelector(".cta-form");
    if (!ctaForm) return;

    const emailInput = ctaForm.querySelector('input[type="email"]');
    const messageEl = ctaForm.querySelector(".cta-message");
    const submitButton = ctaForm.querySelector('button[type="submit"]');
    const apiBase = resolveApiBase();

    ctaForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = emailInput.value.trim().toLowerCase();
        if (!email || !validateEmail(email)) {
            setCtaMessage(messageEl, "Please enter a valid email address.", true);
            return;
        }

        setSubmittingState(submitButton, true);
        setCtaMessage(messageEl, "Adding you to the waitlist...");

        try {
            await submitWaitlistEmail(apiBase, email);
            setCtaMessage(
                messageEl,
                "Thanks! You're officially on the list."
            );
            ctaForm.reset();
        } catch (error) {
            console.error("Unable to submit email:", error);
            setCtaMessage(
                messageEl,
                error.message || "We couldn't save your email right now. Please try again later.",
                true
            );
        } finally {
            setSubmittingState(submitButton, false);
        }
    });
}

async function submitWaitlistEmail(apiBase, email) {
    const requestUrl = `${apiBase.replace(/\/$/, "")}/api/waitlist`;
    const response = await fetch(requestUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
        },
        body: JSON.stringify({ email })
    });

    if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.message || "Server rejected the request.");
    }

    return response.json();
}

function resolveApiBase() {
    const bodyAttr = document.body?.dataset?.apiBase?.trim();
    if (bodyAttr) return bodyAttr;

    if (window.location.protocol === "file:") {
        return "http://127.0.0.1:5000";
    }

    return window.location.origin;
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function setCtaMessage(node, text, isError = false) {
    if (!node) return;
    node.textContent = text;
    node.classList.toggle("error", !!isError);
}

function setSubmittingState(button, isSubmitting) {
    if (!button) return;
    button.disabled = isSubmitting;
    button.textContent = isSubmitting ? "Submitting..." : "Join Waitlist";
}

*/
