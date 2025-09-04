/* --- Timing constants --- */
const CURTAIN_DURATION = 2500; // ms (match CSS timings: curtain open starts 0.5s, lasts ~1.8s)
const POST_INTRO_DELAY = 3600; // ms after page load to auto-scroll (adjusted to match animations)



/* Reveal sections on scroll */
const infos = document.querySelectorAll('.info');
function revealOnScroll() {
  infos.forEach(node => {
    const r = node.getBoundingClientRect();
    if (r.top < (window.innerHeight || document.documentElement.clientHeight) - 90) {
      node.classList.add('visible');
    }
  });
}
window.addEventListener('scroll', revealOnScroll);
window.addEventListener('resize', revealOnScroll);

function smoothScrollTo(targetY, duration) {
  
  const startPosition = window.pageYOffset;
  const distance = targetY - startPosition;
  let startTime = null;

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = ease(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    
    if (timeElapsed < duration) {
      autoScrollTimeout = requestAnimationFrame(animation); // Continue animation
    } else {
      autoScrollTimeout = null; // Animation finished
      
    }
  }

  // Easing function (ease-in-out quad)
  function ease(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }

  autoScrollTimeout = requestAnimationFrame(animation); // Start animation
}


/* Parallax music notes: move slightly on scroll */
const notes = document.getElementById('notesLayer');
window.addEventListener('scroll', () => {
  const s = window.scrollY;
  notes.style.transform = 'translateY(' + (s * -0.06) + 'px)';
});

/* Optional music toggle */
const bgAudio = document.getElementById('bgAudio');
const musicToggle = document.getElementById('musicToggle');
let musicPlaying = false;

// Toggle: starts only when user taps (autoplay blocked otherwise)
musicToggle.addEventListener('click', async () => {
  if (!musicPlaying){
    try {
      await bgAudio.play();
      musicPlaying = true;
      musicToggle.setAttribute('aria-pressed','true');
      musicToggle.classList.add('vinyl-top-right'); // Move vinyl to top-right
      document.body.style.overflowY = 'auto'; // Enable scrolling
      

      // Trigger curtain and spotlight animations
      const curtainLeft = document.querySelector('.curtain.left');
      const curtainRight = document.querySelector('.curtain.right');
      const spotlight = document.querySelector('.spotlight');

      if (curtainLeft) curtainLeft.classList.add('curtain-animate');
      if (curtainRight) curtainRight.classList.add('curtain-animate');
      if (spotlight) spotlight.classList.add('spotlight-animate');

      // Trigger title and event details animations
      const eventTitle = document.getElementById('event-title');
      const eventDetailTexts = document.querySelectorAll('.event-detail-text');

      if (eventTitle) eventTitle.classList.add('title-animate');
      eventDetailTexts.forEach(el => el.classList.add('event-detail-text-animate'));

      // Trigger auto-scroll after animations
      autoScrollTimeout = setTimeout(() => {
        
                smoothScrollTo(document.documentElement.scrollHeight - window.innerHeight, 30000); // Scroll to bottom over 20 seconds
      }, POST_INTRO_DELAY + 700);

    } catch(e){
      // playback blocked or file missing — show quick fallback
      alert('Audio cannot autoplay in this browser. Upload /assets/httyd.mp3 for the background vibe, then try again.');
    }
  } else {
    bgAudio.pause();
    musicPlaying = false;
    musicToggle.setAttribute('aria-pressed','false');
    musicToggle.classList.remove('vinyl-top-right'); // Move vinyl back to center
  }
});

/* Small UX: if user scrolls before auto-scroll, cancel auto scroll */
let autoScrollTimeout = null;
autoScrollTimeout = setTimeout(() => { /* handled above */ }, POST_INTRO_DELAY + 700);
window.addEventListener('wheel', (e) => {
  // Cancel if scrolling up or down manually
  if (autoScrollTimeout && (e.deltaY < 0 || e.deltaY > 0)) {
    cancelAnimationFrame(autoScrollTimeout);
    autoScrollTimeout = null;
  }
});

/* Accessibility: keyboard focus for RSVP */
const rsvp = document.querySelector('.btn');
rsvp.addEventListener('keypress', (e) => { if (e.key === 'Enter') rsvp.click(); });

// RSVP Confirmation Message Logic
document.addEventListener('DOMContentLoaded', () => {
  const rsvpForm = document.getElementById('rsvpForm');
  const rsvpConfirmationMessage = document.getElementById('rsvpConfirmationMessage');

  if (rsvpForm && rsvpConfirmationMessage) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault(); // Prevent default form submission

      // You can add form validation here if needed

      // Show the confirmation message
      rsvpConfirmationMessage.style.display = 'block';

      // Optionally, hide the form after submission
      rsvpForm.style.display = 'none';
    });
  }
});

/* --- Timing constants --- */

// Generic Modal Logic for Bottom Bar Buttons
document.addEventListener('DOMContentLoaded', () => {
  const bottomBarItems = document.querySelectorAll('.bottom-bar-item');
  const simpleModal = document.getElementById('simpleModal');
  const modalContentDiv = simpleModal ? simpleModal.querySelector('#modalContent') : null; // Ensure modalContentDiv is inside simpleModal
  const simpleCloseButton = simpleModal ? simpleModal.querySelector('.simple-close-button') : null;

  if (bottomBarItems.length > 0 && simpleModal && modalContentDiv && simpleCloseButton) {
    bottomBarItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default button behavior

        const targetContentId = item.dataset.modalTarget;
        const targetContentElement = document.getElementById(targetContentId);

        if (targetContentElement) {
          modalContentDiv.innerHTML = targetContentElement.innerHTML; // Copy content
          simpleModal.style.display = 'block'; // Show the modal container immediately
          // Use a small timeout to allow display:block to apply before adding active class
          setTimeout(() => {
            simpleModal.classList.add('active'); // Trigger slide-up animation
          }, 10);
        } else {
          console.error('Modal content source not found:', targetContentId);
        }
      });
    });

    // Close button functionality
    simpleCloseButton.addEventListener('click', () => {
      simpleModal.classList.remove('active'); // Trigger slide-down animation
      simpleModal.addEventListener('transitionend', function handler() {
        simpleModal.style.display = 'none'; // Hide after animation
        simpleModal.removeEventListener('transitionend', handler); // Clean up listener
      });
    });

    // Close when clicking outside the modal content
    simpleModal.addEventListener('click', (e) => {
      if (e.target === simpleModal) {
        simpleModal.classList.remove('active'); // Trigger slide-down animation
        simpleModal.addEventListener('transitionend', function handler() {
          simpleModal.style.display = 'none'; // Hide after animation
          simpleModal.removeEventListener('transitionend', handler); // Clean up listener
        });
      }
    });
  } else {
    console.error('Generic Modal Logic: One or more required elements not found.', { bottomBarItems, simpleModal, modalContentDiv, simpleCloseButton });
  }
});