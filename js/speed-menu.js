/* ===== SPEED MENU FUNCTIONALITY ===== */
/* Add this code to js/app.js (at the end of the file) */

// Speed Menu Toggle
const speedBtn = document.getElementById('playback-speed-btn');
const settingsMenu = document.getElementById('settings-menu');
const speedOptions = document.querySelectorAll('.settings-option');
const speedText = document.getElementById('speed-text');
const videoPlayer = document.getElementById('main-video-player');

// Toggle speed menu when clicking speed button
if (speedBtn) {
    speedBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsMenu.classList.toggle('active');
    });
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (settingsMenu && !settingsMenu.contains(e.target) && e.target !== speedBtn) {
        settingsMenu.classList.remove('active');
    }
});

// Handle speed option selection
speedOptions.forEach(option => {
    option.addEventListener('click', () => {
        const speed = parseFloat(option.dataset.speed);

        // Update video playback speed
        if (videoPlayer) {
            videoPlayer.playbackRate = speed;
        }

        // Update active state
        speedOptions.forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');

        // Update button text
        if (speedText) {
            speedText.textContent = `${speed}x`;
        }

        // Close menu
        settingsMenu.classList.remove('active');

        console.log(`Playback speed set to ${speed}x`);
    });
});

console.log('Speed menu functionality loaded ✓');
