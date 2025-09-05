/* --- Timing constants --- */
const CURTAIN_DURATION = 2500;
const POST_INTRO_DELAY = 3600;

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

/* Smooth scroll */
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
      autoScrollTimeout = requestAnimationFrame(animation);
    } else {
      autoScrollTimeout = null;
    }
  }
  function ease(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }
  autoScrollTimeout = requestAnimationFrame(animation);
}

/* Parallax music notes */
const notes = document.getElementById('notesLayer');
window.addEventListener('scroll', () => {
  const s = window.scrollY;
  if (notes) notes.style.transform = 'translateY(' + (s * -0.06) + 'px)';
});

/* Music toggle */
const bgAudio = document.getElementById('bgAudio');
const musicToggle = document.getElementById('musicToggle');
const vinylImage = musicToggle.querySelector('img');
const fullScreenOverlayText = document.getElementById('fullScreenOverlayText');
let musicPlaying = false;
let initialPlayDone = false;

if (musicToggle && bgAudio) {
  musicToggle.addEventListener('click', async () => {
    if (!musicPlaying) {
      try {
        await bgAudio.play();
        musicPlaying = true;
        musicToggle.setAttribute('aria-pressed', 'true');
        vinylImage.style.animation = 'spin 7s linear infinite';
        vinylImage.style.animation = 'spin 7s linear infinite';
        vinylImage.style.animationPlayState = 'running';
        if (!initialPlayDone) {
          musicToggle.classList.add('vinyl-top-right');
          initialPlayDone = true;
        }
        document.body.style.overflowY = 'auto';

        const curtainLeft = document.querySelector('.curtain.left');
        const curtainRight = document.querySelector('.curtain.right');
        const spotlight = document.querySelector('.spotlight');
        if (curtainLeft) curtainLeft.classList.add('curtain-animate');
        if (curtainRight) curtainRight.classList.add('curtain-animate');
        if (spotlight) spotlight.classList.add('spotlight-animate');

        const eventTitle = document.getElementById('event-title');
        const eventDetailTexts = document.querySelectorAll('.event-detail-text');
        if (eventTitle) eventTitle.classList.add('title-animate');
        eventDetailTexts.forEach(el => el.classList.add('event-detail-text-animate'));

        document.querySelector('.event-actions').classList.add('event-detail-text-animate');
        if (fullScreenOverlayText) {
          fullScreenOverlayText.classList.add('hidden');
        }

        autoScrollTimeout = setTimeout(() => {
          smoothScrollTo(document.documentElement.scrollHeight - window.innerHeight, 30000);
        }, POST_INTRO_DELAY + 700);

      } catch (e) {
        alert('Audio cannot autoplay in this browser. Upload /assets/httyd.mp3 for the background vibe, then try again.');
      }
    } else {
      bgAudio.pause();
      musicPlaying = false;
      musicToggle.setAttribute('aria-pressed', 'false');
      vinylImage.style.animationPlayState = 'paused';
    }
  });
}

/* Cancel auto-scroll if user scrolls manually */
let autoScrollTimeout = null;
window.addEventListener('wheel', () => {
  if (autoScrollTimeout) {
    cancelAnimationFrame(autoScrollTimeout);
    autoScrollTimeout = null;
  }
});

/* Accessibility for RSVP button */
const rsvp = document.querySelector('.btn');
if (rsvp) {
  rsvp.addEventListener('keypress', (e) => { if (e.key === 'Enter') rsvp.click(); });
}

/* --- Modal + RSVP logic --- */
document.addEventListener('DOMContentLoaded', () => {
  const modalButtons = document.querySelectorAll('[data-modal-target]');
  const closeModalButtons = document.querySelectorAll('.simple-close-button');
  const simpleModal = document.getElementById('simpleModal');
  const modalContent = document.getElementById('modalContent');

  modalButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetId = button.getAttribute('data-modal-target');
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        const titleContainer = targetContent.querySelector('.popup-title-container');
        const restOfContent = targetContent.cloneNode(true);

        if (titleContainer) {
          restOfContent.removeChild(restOfContent.querySelector('.popup-title-container'));
          modalContent.innerHTML = '';
          modalContent.appendChild(titleContainer);
          const contentWrapper = document.createElement('div');
          contentWrapper.classList.add('modal-content-wrapper');
          contentWrapper.innerHTML = restOfContent.innerHTML;
          modalContent.appendChild(contentWrapper);
        } else {
          modalContent.innerHTML = targetContent.innerHTML;
        }
        simpleModal.classList.add('active');

        /* RSVP form submission */
        const rsvpForm = modalContent.querySelector('#rsvpForm');
        const rsvpConfirmationMessage = modalContent.querySelector('#rsvpConfirmationMessage');
        if (rsvpForm) {
          rsvpForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const scriptURL = rsvpForm.dataset.scriptUrl;
            const formData = new FormData(rsvpForm);
            if (formData.get('entry.1212652195') === 'Tidak') {
              formData.set('entry.1811924995', 0); // force value 0
            }
            try {
              await fetch(scriptURL, { method: 'POST', body: formData });
              rsvpForm.reset();
              rsvpForm.style.display = 'none';
              if (rsvpConfirmationMessage) rsvpConfirmationMessage.style.display = 'block';
            } catch (error) {
              console.error('Error submitting form:', error);
            }
          });
        }

        /* RSVP step logic */
        const rsvpInitialStep = modalContent.querySelector('#rsvp-initial-step');
        const rsvpDetailsStep = modalContent.querySelector('#rsvp-details-step');
        const rsvpYesButton = modalContent.querySelector('#rsvp-yes');
        const rsvpNoButton = modalContent.querySelector('#rsvp-no');
        const hadirSelect = modalContent.querySelector('#hadir');

        const showRsvpDetails = (attending) => {
          if (hadirSelect) hadirSelect.value = attending;
          if (rsvpInitialStep) rsvpInitialStep.style.display = 'none';
          if (rsvpDetailsStep) rsvpDetailsStep.style.display = 'block';
          const bilanganGroup = modalContent.querySelector('#bilangan-kehadiran-group');
          const bilanganInput = modalContent.querySelector('#bilangan');
          if (bilanganGroup && bilanganInput) {
            if (attending === 'Tidak') {
              bilanganGroup.style.display = 'none';
              bilanganInput.value = 0;
              bilanganInput.removeAttribute('required');
            } else {
              bilanganGroup.style.display = 'block';
              bilanganInput.setAttribute('required', 'required');
            }
          }
        };
        if (rsvpYesButton) rsvpYesButton.addEventListener('click', () => showRsvpDetails('Ya'));
        if (rsvpNoButton) rsvpNoButton.addEventListener('click', () => showRsvpDetails('Tidak'));
      }
    });
  });

  const closeModal = () => simpleModal.classList.remove('active');
  closeModalButtons.forEach(button => button.addEventListener('click', closeModal));
  window.addEventListener('click', (event) => {
    if (event.target === simpleModal) closeModal();
  });

  // Fetch and display Kehadiran sum
  const kehadiranSumElement = document.getElementById('kehadiranSum');
  const scriptURL = 'https://script.google.com/macros/s/AKfycbyxJSt_I0NjFVka7cmYzdY00cSVV79V3BOxtkBDtYmyInLqzz8n-tKmRAOgKIxMcwVD/exec';

  if (kehadiranSumElement) {
    fetch(scriptURL)
      .then(response => response.json())
      .then(data => {
        let totalKehadiran = 0;
        // Assuming data is an array of objects, and each object has a 'kehadiran' property
        if (Array.isArray(data)) {
          data.forEach(row => {
            if (typeof row['bilangan'] === 'number') {
              totalKehadiran += row['bilangan'];
            }
          });
        }
        kehadiranSumElement.textContent = `${totalKehadiran}`;
      })
      .catch(error => {
        console.error('Error fetching kehadiran data:', error);
        kehadiranSumElement.textContent = 'Could not load kehadiran data.';
      });
  }
});
