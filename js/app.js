document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    const state = {
        favorites: JSON.parse(localStorage.getItem('favorites')) || [],
        currentView: 'home'
    };

    // --- DOM Elements ---
    const ageGate = document.getElementById('age-gate');
    const verifyBtn = document.getElementById('verify-btn');
    const leaveBtn = document.getElementById('leave-btn');
    const userAgeInput = document.getElementById('user-age');
    const navLinks = document.querySelectorAll('.nav-links a');
    const views = document.querySelectorAll('.view');
    const navbar = document.querySelector('.navbar');
    const toastContainer = document.getElementById('toast-container');
    const videoModal = document.getElementById('video-modal');

    // --- Strict Age Gate Logic ---
    console.log('Age Gate Initialization...');

    // Check both localStorage and sessionStorage for verification
    const isAgeVerifiedLocal = localStorage.getItem('ageVerified') === 'true';
    const isAgeVerifiedSession = sessionStorage.getItem('ageVerified') === 'true';
    const isVerified = isAgeVerifiedLocal && isAgeVerifiedSession;

    // Immediately hide all content before verification
    if (!isVerified) {
        console.log('User not verified. Showing age gate and blocking access.');
        if (ageGate) ageGate.classList.add('active');
        document.body.classList.add('content-hidden');
        document.body.style.overflow = 'hidden';

        // Hide all website content
        const mainContent = document.getElementById('main-content');
        const navbar = document.querySelector('.navbar');
        const footer = document.querySelector('footer');
        const bottomNav = document.querySelector('.bottom-nav');

        if (mainContent) mainContent.style.display = 'none';
        if (navbar) navbar.style.display = 'none';
        if (footer) footer.style.display = 'none';
        if (bottomNav) bottomNav.style.display = 'none';
    } else {
        console.log('User already verified. Granting access.');
        if (ageGate) ageGate.classList.remove('active');
        document.body.classList.remove('content-hidden');
        document.body.style.overflow = '';
    }

    if (verifyBtn) {
        console.log('Verify button found. Adding listener.');

        const handleVerification = () => {
            const ageValue = userAgeInput.value.trim();
            const age = parseInt(ageValue);
            console.log('Entered Age:', ageValue, 'Parsed Age:', age);

            // Validate input
            if (!ageValue || isNaN(age) || age < 1 || age > 150) {
                console.warn('Invalid age entered.');
                showToast('Please enter a valid age between 1 and 150', 'error');
                userAgeInput.value = '';
                userAgeInput.focus();
                return;
            }

            if (age >= 18) {
                console.log('Verification successful! Age >= 18');
                // Set in both storage mechanisms for security
                localStorage.setItem('ageVerified', 'true');
                sessionStorage.setItem('ageVerified', 'true');
                localStorage.setItem('ageVerifiedTimestamp', Date.now().toString());

                // Show website content
                const mainContent = document.getElementById('main-content');
                const navbar = document.querySelector('.navbar');
                const footer = document.querySelector('footer');
                const bottomNav = document.querySelector('.bottom-nav');

                if (mainContent) mainContent.style.display = 'block';
                if (navbar) navbar.style.display = 'flex';
                if (footer) footer.style.display = 'block';
                if (bottomNav) bottomNav.style.display = 'flex';

                // Hide age gate
                if (ageGate) ageGate.classList.remove('active');
                document.body.classList.remove('content-hidden');
                document.body.style.overflow = '';
                showToast('Welcome! Age verified successfully.', 'success');
            } else {
                // STRICT ACTION: Immediately block and redirect if under 18
                console.warn('Verification failed. Age < 18. Blocking access immediately.');

                // Show error message
                showToast('Access Denied: You must be 18 or older to enter this website.', 'error');

                // Hide age gate and show blocking message
                if (ageGate) {
                    ageGate.innerHTML = `
                        <div class="modal-content age-gate-content" style="animation: shake 0.5s;">
                            <div style="font-size: 4rem; color: #e74c3c; margin-bottom: 1rem;">🚫</div>
                            <h2 style="color: #e74c3c; margin-bottom: 1rem;">Access Denied</h2>
                            <p style="color: var(--text-secondary); margin-bottom: 2rem; line-height: 1.6;">
                                You must be at least 18 years old to access this website. 
                                This site contains adult content that is not suitable for minors.
                            </p>
                            <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 1.5rem;">
                                You are being redirected to a safe website.
                            </p>
                            <button class="btn btn-secondary" onclick="window.location.href='https://www.google.com'" style="width: 100%;">
                                Leave Site
                            </button>
                        </div>
                    `;
                }

                // Immediately redirect (no delay for strict enforcement)
                setTimeout(() => {
                    window.location.replace('https://www.google.com');
                }, 1500);
            }
        };

        verifyBtn.addEventListener('click', handleVerification);

        // Also support Enter key
        if (userAgeInput) {
            userAgeInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleVerification();
                }
            });

            // Focus input for convenience
            setTimeout(() => userAgeInput.focus(), 500);

            // Prevent pasting to avoid bypass attempts
            userAgeInput.addEventListener('paste', (e) => {
                e.preventDefault();
            });
        }
    } else {
        console.error('Verify button NOT found in DOM!');
    }

    if (leaveBtn) {
        leaveBtn.addEventListener('click', () => {
            console.log('User chose to leave.');
            window.location.replace('https://www.google.com');
        });
    }

    // Prevent accessing content by URL manipulation or console tricks
    window.addEventListener('beforeunload', () => {
        if (!localStorage.getItem('ageVerified') || !sessionStorage.getItem('ageVerified')) {
            // Clear any attempts to bypass
            localStorage.removeItem('ageVerified');
        }
    });

    // --- Navigation Logic ---
    function switchView(viewId) {
        state.currentView = viewId;

        // Update Top Nav
        navLinks.forEach(link => {
            if (link.dataset.page === viewId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Update Bottom Nav (Mobile)
        const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
        bottomNavItems.forEach(item => {
            if (item.dataset.page === viewId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Update View
        views.forEach(view => {
            if (view.id === `${viewId}-view`) {
                view.classList.add('active');
            } else {
                view.classList.remove('active');
            }
        });

        // Specific View Logic
        if (viewId === 'favorites') renderFavorites();
        if (viewId === 'photos') renderPhotos();

        window.scrollTo(0, 0);
    }

    // Global data-page listener
    document.addEventListener('click', (e) => {
        const target = e.target.closest('[data-page]');
        if (target && !target.classList.contains('bottom-nav-item') && !target.parentElement.classList.contains('nav-links')) {
            e.preventDefault();
            const page = target.dataset.page;
            if (document.getElementById(`${page}-view`)) {
                switchView(page);
            }
        }
    });

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            if (document.getElementById(`${page}-view`)) {
                switchView(page);
            }
        });
    });

    // Logo click to home
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', (e) => {
            e.preventDefault();
            switchView('home');
        });
    }

    // --- Mobile Bottom Navigation ---
    const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
    bottomNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;

            // Update bottom nav active state
            bottomNavItems.forEach(navItem => navItem.classList.remove('active'));
            item.classList.add('active');

            // Switch view
            if (document.getElementById(`${page}-view`)) {
                switchView(page);
            }
        });
    });

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- Enhanced Mobile Horizontal Scrolling ---
    const rowScrollers = document.querySelectorAll('.row-scroller');

    rowScrollers.forEach(scroller => {
        let isDown = false;
        let startX;
        let scrollLeft;
        let velocity = 0;
        let lastX = 0;
        let lastTime = Date.now();

        // Mouse/Touch start
        scroller.addEventListener('mousedown', (e) => {
            isDown = true;
            scroller.style.cursor = 'grabbing';
            startX = e.pageX - scroller.offsetLeft;
            scrollLeft = scroller.scrollLeft;
            velocity = 0;
            lastX = e.pageX;
            lastTime = Date.now();
        });

        scroller.addEventListener('touchstart', (e) => {
            isDown = true;
            const touch = e.touches[0];
            startX = touch.pageX - scroller.offsetLeft;
            scrollLeft = scroller.scrollLeft;
            velocity = 0;
            lastX = touch.pageX;
            lastTime = Date.now();
        }, { passive: true });

        // Mouse/Touch end
        scroller.addEventListener('mouseup', () => {
            isDown = false;
            scroller.style.cursor = 'grab';
            applyMomentum(scroller, velocity);
        });

        scroller.addEventListener('touchend', () => {
            isDown = false;
            applyMomentum(scroller, velocity);
        });

        scroller.addEventListener('mouseleave', () => {
            isDown = false;
            scroller.style.cursor = 'grab';
        });

        // Mouse/Touch move
        scroller.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - scroller.offsetLeft;
            const walk = (x - startX) * 1.5; // Scroll speed multiplier

            const now = Date.now();
            const dt = now - lastTime;
            const dx = e.pageX - lastX;
            velocity = dx / dt * 10; // Calculate velocity

            scroller.scrollLeft = scrollLeft - walk;
            lastX = e.pageX;
            lastTime = now;
        });

        scroller.addEventListener('touchmove', (e) => {
            if (!isDown) return;
            const touch = e.touches[0];
            const x = touch.pageX - scroller.offsetLeft;
            const walk = (x - startX) * 1.5;

            const now = Date.now();
            const dt = now - lastTime;
            const dx = touch.pageX - lastX;
            velocity = dx / dt * 10;

            scroller.scrollLeft = scrollLeft - walk;
            lastX = touch.pageX;
            lastTime = now;
        }, { passive: true });

        // Prevent click event when dragging
        scroller.addEventListener('click', (e) => {
            if (Math.abs(velocity) > 1) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);
    });

    // Apply momentum scrolling
    function applyMomentum(element, velocity) {
        if (Math.abs(velocity) < 0.5) return;

        const deceleration = 0.95;
        let currentVelocity = velocity;

        function momentumStep() {
            currentVelocity *= deceleration;
            element.scrollLeft -= currentVelocity * 5;

            if (Math.abs(currentVelocity) > 0.5) {
                requestAnimationFrame(momentumStep);
            }
        }


        requestAnimationFrame(momentumStep);
    }

    // Hide scroll hints after user scrolls
    rowScrollers.forEach(scroller => {
        let hasScrolled = false;

        scroller.addEventListener('scroll', () => {
            if (!hasScrolled && scroller.scrollLeft > 10) {
                hasScrolled = true;
                const contentRow = scroller.closest('.content-row');
                if (contentRow) {
                    contentRow.style.setProperty('--scroll-hint-opacity', '0');
                    // Add custom property to hide arrow
                    const style = document.createElement('style');
                    style.textContent = `
                        .content-row::after {
                            opacity: 0 !important;
                            transition: opacity 0.3s ease;
                        }
                    `;
                    if (!document.querySelector('#scroll-hint-style')) {
                        style.id = 'scroll-hint-style';
                        document.head.appendChild(style);
                    }
                }
            }
        }, { passive: true });
    });

    // --- Toast Notification ---
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        if (toastContainer) {
            toastContainer.appendChild(toast);
        } else {
            console.warn('Toast container not found. Message:', message);
        }

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // --- Content Rendering ---
    function createVideoCard(video) {
        // Find creator ID by matching creator name (case-insensitive) if creatorId doesn't match
        let creatorIdToUse = video.creatorId;
        if (video.creator) {
            const matchedCreator = creators.find(c =>
                c.name.toLowerCase() === video.creator.toLowerCase() ||
                c.username.toLowerCase() === video.creator.toLowerCase()
            );
            if (matchedCreator) {
                creatorIdToUse = matchedCreator.id;
            }
        }

        return `
            <div class="card" onclick="openVideoModal(${video.id})">
                <div class="card-img-wrapper">
                    <img src="${video.thumbnail}" alt="${video.title}" class="card-img" referrerpolicy="no-referrer">
                    <span class="card-duration">${video.duration}</span>
                </div>
                <div class="card-info">
                    <h3 class="card-title">${video.title}</h3>
                    <div class="card-meta">
                        <span onclick="event.stopPropagation(); openCreatorProfile(${creatorIdToUse})" style="cursor:pointer; color: var(--text-secondary); transition: color 0.2s;" onmouseover="this.style.color='var(--primary-color)'" onmouseout="this.style.color='var(--text-secondary)'">${video.creator}</span>
                        <span>${video.views} views</span>
                    </div>
                </div>
            </div>
        `;
    }

    function createCategoryCard(category) {
        return `
            <div class="category-card">
                <img src="${category.image}" alt="${category.name}" referrerpolicy="no-referrer">
                <div class="category-overlay">
                    <span class="category-name">${category.name}</span>
                </div>
            </div>
        `;
    }

    function createPhotoCard(photo) {
        return `
            <div class="photo-card">
                <img src="${photo.url}" alt="${photo.title}" referrerpolicy="no-referrer">
                <div class="photo-overlay">
                    <span class="photo-title">${photo.title}</span>
                    <span class="photo-creator">by ${photo.creator}</span>
                </div>
            </div>
        `;
    }

    function renderPhotos() {
        const photosGrid = document.getElementById('photos-grid');
        if (photosGrid && typeof photos !== 'undefined') {
            photosGrid.innerHTML = photos.map(createPhotoCard).join('');
        }
    }

    // Render Home Content
    const trendingContainer = document.getElementById('trending-container');
    if (trendingContainer) {
        trendingContainer.innerHTML = videos.filter(v => v.trending).map(createVideoCard).join('');
    }

    const newReleasesContainer = document.getElementById('new-releases-container');
    if (newReleasesContainer) {
        newReleasesContainer.innerHTML = videos.filter(v => v.new).map(createVideoCard).join('');
    }

    const categoriesContainer = document.getElementById('categories-container');
    if (categoriesContainer) {
        categoriesContainer.innerHTML = categories.map(createCategoryCard).join('');
    }

    const allCategoriesGrid = document.getElementById('all-categories-grid');
    if (allCategoriesGrid) {
        allCategoriesGrid.innerHTML = categories.map(createCategoryCard).join('');
    }

    // --- Creators List Logic ---
    function createCreatorListCard(creator) {
        return `
            <div class="creator-list-card" onclick="openCreatorProfile(${creator.id})">
                <div class="creator-card-info">
                    <img src="${creator.avatar}" alt="${creator.name}" class="creator-card-avatar" referrerpolicy="no-referrer">
                    <h3 class="creator-card-name">${creator.name}</h3>
                    <span class="creator-card-username">@${creator.username}</span>
                    <div class="creator-card-stats">
                        <span><strong>${creator.subscribers}</strong> Subscribers</span>
                        <span><strong>${creator.views}</strong> Views</span>
                    </div>
                </div>
            </div>
        `;
    }

    const creatorsGrid = document.getElementById('creators-grid');
    if (creatorsGrid) {
        creatorsGrid.innerHTML = creators.map(createCreatorListCard).join('');
    }

    // --- Explore Logic ---
    const exploreGrid = document.getElementById('explore-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');

    function renderExplore(filter = 'all') {
        let filteredVideos = videos;
        if (filter === 'trending') filteredVideos = videos.filter(v => v.trending);
        if (filter === 'new') filteredVideos = videos.filter(v => v.new);

        exploreGrid.innerHTML = filteredVideos.map(createVideoCard).join('');
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderExplore(btn.dataset.filter);
        });
    });

    if (exploreGrid) renderExplore();

    // --- See All Logic ---
    const seeAllLinks = document.querySelectorAll('.see-all');
    seeAllLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const filter = link.dataset.filter;
            switchView('explore');

            // Apply filter on Explore page
            if (filter) {
                const filterBtn = document.querySelector(`.filter-btn[data-filter="${filter}"]`);
                if (filterBtn) {
                    // Trigger the click to update UI and render
                    filterBtn.click();
                }
            }
        });
    });

    // --- Creator Profile Logic ---
    window.openCreatorProfile = (creatorId) => {
        const creator = creators.find(c => c.id === creatorId);
        if (!creator) return;

        // Populate Creator View
        document.getElementById('profile-name').textContent = creator.name;
        document.getElementById('profile-username').textContent = `@${creator.username}`;
        const profileAvatar = document.getElementById('profile-avatar');
        profileAvatar.referrerPolicy = "no-referrer";
        profileAvatar.src = creator.avatar;
        document.querySelector('.creator-cover').style.backgroundImage = `url('${creator.cover || creator.avatar}')`;

        // Populate Stats
        const statsContainer = document.querySelector('.creator-stats');
        statsContainer.innerHTML = `
            <span><strong>${creator.subscribers}</strong> Subscribers</span>
            <span><strong>${creator.views}</strong> Views</span>
        `;

        // Populate Videos - Match by creatorId OR by creator name (case-insensitive)
        const creatorNameLower = creator.name.toLowerCase();
        const creatorVideos = videos.filter(v => {
            // First try to match by creatorId
            if (v.creatorId === creatorId) return true;
            // Fallback: match by creator name (case-insensitive)
            if (v.creator && v.creator.toLowerCase() === creatorNameLower) return true;
            return false;
        });

        // Sort videos by views (highest first) for better display
        creatorVideos.sort((a, b) => {
            const viewsA = parseFloat(a.views) || 0;
            const viewsB = parseFloat(b.views) || 0;
            return viewsB - viewsA;
        });

        const videosGrid = document.getElementById('creator-videos-grid');
        if (creatorVideos.length > 0) {
            videosGrid.innerHTML = creatorVideos.map(createVideoCard).join('');
        } else {
            videosGrid.innerHTML = '<p class="empty-msg">No videos available for this creator.</p>';
        }

        // Switch View
        views.forEach(view => view.classList.remove('active'));
        document.getElementById('creator-view').classList.add('active');
        navLinks.forEach(link => link.classList.remove('active')); // Deselect nav items
        window.scrollTo(0, 0);
    };

    // --- Video Modal Logic ---
    // Video Player Elements
    const videoPlayer = document.getElementById('main-video-player');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const volumeBtn = document.getElementById('volume-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');
    const progressBar = document.querySelector('.video-progress-bar');
    const progressPlayed = document.querySelector('.video-progress-played');
    const progressLoaded = document.querySelector('.video-progress-loaded');
    const progressHandle = document.querySelector('.video-progress-handle');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const pipBtn = document.getElementById('pip-btn');
    const speedBtn = document.getElementById('playback-speed-btn');
    const speedText = document.getElementById('speed-text');
    const qualityBtn = document.getElementById('quality-btn');
    const settingsMenu = document.getElementById('settings-menu');
    const speedOptions = document.querySelectorAll('#speed-options .settings-option');
    const closeVideoBtn = document.getElementById('close-video-btn');
    const controlsOverlay = document.querySelector('.video-controls-overlay');
    const videoPlayerWrapper = document.querySelector('.video-player-wrapper');

    let hideControlsTimeout;
    let isDragging = false;
    let currentPlaybackSpeed = 1;

    // Initialize Video Player
    function initVideoPlayer() {
        if (!videoPlayer) return;

        // Play/Pause
        playPauseBtn.addEventListener('click', togglePlayPause);
        videoPlayer.addEventListener('click', togglePlayPause);

        // Volume Control
        volumeSlider.addEventListener('input', (e) => {
            videoPlayer.volume = e.target.value / 100;
            updateVolumeIcon();
        });

        volumeBtn.addEventListener('click', () => {
            if (videoPlayer.volume > 0) {
                volumeSlider.value = 0;
                videoPlayer.volume = 0;
            } else {
                volumeSlider.value = 100;
                videoPlayer.volume = 1;
            }
            updateVolumeIcon();
        });

        // Progress Bar
        progressBar.addEventListener('click', (e) => {
            if (isDragging) return;
            const rect = progressBar.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            videoPlayer.currentTime = percent * videoPlayer.duration;
        });

        let progressMouseDown = false;
        progressBar.addEventListener('mousedown', (e) => {
            progressMouseDown = true;
            isDragging = true;
            const rect = progressBar.getBoundingClientRect();
            const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            videoPlayer.currentTime = percent * videoPlayer.duration;
        });

        document.addEventListener('mousemove', (e) => {
            if (progressMouseDown) {
                const rect = progressBar.getBoundingClientRect();
                const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                videoPlayer.currentTime = percent * videoPlayer.duration;
            }
        });

        document.addEventListener('mouseup', () => {
            progressMouseDown = false;
            isDragging = false;
        });

        // Video Events
        videoPlayer.addEventListener('timeupdate', updateProgress);
        videoPlayer.addEventListener('loadedmetadata', () => {
            totalTimeEl.textContent = formatTime(videoPlayer.duration);
        });
        videoPlayer.addEventListener('progress', updateLoadedProgress);
        videoPlayer.addEventListener('play', () => {
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
        });
        videoPlayer.addEventListener('pause', () => {
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        });

        // Fullscreen
        fullscreenBtn.addEventListener('click', toggleFullscreen);
        document.addEventListener('fullscreenchange', updateFullscreenIcon);
        document.addEventListener('webkitfullscreenchange', updateFullscreenIcon);

        // Picture in Picture
        pipBtn.addEventListener('click', togglePictureInPicture);

        // Playback Speed
        speedOptions.forEach(option => {
            option.addEventListener('click', () => {
                const speed = parseFloat(option.dataset.speed);
                videoPlayer.playbackRate = speed;
                currentPlaybackSpeed = speed;
                speedText.textContent = speed + 'x';
                speedOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                settingsMenu.classList.remove('active');
            });
        });

        speedBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            settingsMenu.classList.toggle('active');
            qualityBtn.classList.remove('active');
        });

        qualityBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            settingsMenu.classList.toggle('active');
            speedBtn.classList.remove('active');
        });

        // Close settings when clicking outside
        document.addEventListener('click', (e) => {
            if (!settingsMenu.contains(e.target) && !speedBtn.contains(e.target) && !qualityBtn.contains(e.target)) {
                settingsMenu.classList.remove('active');
            }
        });

        // Auto-hide controls
        videoPlayer.addEventListener('mousemove', showControls);
        controlsOverlay.addEventListener('mousemove', showControls);

        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboard);
    }

    function togglePlayPause() {
        if (videoPlayer.paused) {
            videoPlayer.play();
        } else {
            videoPlayer.pause();
        }
        showControls();
    }

    function updateProgress() {
        if (!isDragging) {
            const percent = (videoPlayer.currentTime / videoPlayer.duration) * 100;
            progressPlayed.style.width = percent + '%';
            progressHandle.style.left = percent + '%';
            currentTimeEl.textContent = formatTime(videoPlayer.currentTime);
        }
    }

    function updateLoadedProgress() {
        if (videoPlayer.buffered.length > 0) {
            const buffered = videoPlayer.buffered.end(videoPlayer.buffered.length - 1);
            const percent = (buffered / videoPlayer.duration) * 100;
            progressLoaded.style.width = percent + '%';
        }
    }

    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    function updateVolumeIcon() {
        const volume = videoPlayer.volume;
        if (volume === 0) {
            volumeBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
        } else if (volume < 0.5) {
            volumeBtn.innerHTML = '<i class="fas fa-volume-down"></i>';
        } else {
            volumeBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
        }
    }

    function toggleFullscreen() {
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
            if (videoPlayerWrapper.requestFullscreen) {
                videoPlayerWrapper.requestFullscreen();
            } else if (videoPlayerWrapper.webkitRequestFullscreen) {
                videoPlayerWrapper.webkitRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    }

    function updateFullscreenIcon() {
        if (document.fullscreenElement || document.webkitFullscreenElement) {
            fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
        } else {
            fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        }
    }

    function togglePictureInPicture() {
        if (document.pictureInPictureElement) {
            document.exitPictureInPicture();
        } else if (videoPlayer.readyState > 0) {
            videoPlayer.requestPictureInPicture();
        }
    }

    function showControls() {
        controlsOverlay.classList.remove('hidden');
        clearTimeout(hideControlsTimeout);
        hideControlsTimeout = setTimeout(() => {
            if (!videoPlayer.paused) {
                controlsOverlay.classList.add('hidden');
            }
        }, 3000);
    }

    function handleKeyboard(e) {
        if (!videoModal.classList.contains('active')) return;

        switch (e.key) {
            case ' ':
                e.preventDefault();
                togglePlayPause();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                videoPlayer.currentTime -= 10;
                break;
            case 'ArrowRight':
                e.preventDefault();
                videoPlayer.currentTime += 10;
                break;
            case 'ArrowUp':
                e.preventDefault();
                videoPlayer.volume = Math.min(1, videoPlayer.volume + 0.1);
                volumeSlider.value = videoPlayer.volume * 100;
                updateVolumeIcon();
                break;
            case 'ArrowDown':
                e.preventDefault();
                videoPlayer.volume = Math.max(0, videoPlayer.volume - 0.1);
                volumeSlider.value = videoPlayer.volume * 100;
                updateVolumeIcon();
                break;
            case 'f':
            case 'F':
                e.preventDefault();
                toggleFullscreen();
                break;
            case 'm':
            case 'M':
                e.preventDefault();
                volumeBtn.click();
                break;
        }
    }

    // Initialize player
    initVideoPlayer();

    window.openVideoModal = (videoId) => {
        const video = videos.find(v => v.id === videoId);
        if (!video) return;

        document.getElementById('modal-title').textContent = video.title;
        document.getElementById('modal-desc').textContent = video.desc || "No description available.";

        // Setup Actions
        const favBtn = document.getElementById('modal-fav');
        const isFav = state.favorites.includes(videoId);
        favBtn.className = isFav ? 'btn-icon active' : 'btn-icon';
        favBtn.onclick = () => toggleFavorite(videoId, favBtn);

        if (videoPlayer && video.videoUrl) {
            videoPlayer.poster = video.thumbnail;
            videoPlayer.src = video.videoUrl;
            videoPlayer.playbackRate = currentPlaybackSpeed;
            videoPlayer.load();
            videoPlayer.play().catch(e => console.log('Autoplay prevented:', e));
        }

        videoModal.classList.add('active');
        videoModal.style.pointerEvents = 'all';
        videoModal.style.opacity = '1';
        showControls();
    };

    // Close video functionality
    function closeVideoModal() {
        if (videoPlayer) {
            videoPlayer.pause();
            videoPlayer.src = "";
        }
        videoModal.classList.remove('active');
        videoModal.style.pointerEvents = 'none';
        videoModal.style.opacity = '0';
        settingsMenu.classList.remove('active');
    }

    if (closeVideoBtn) {
        closeVideoBtn.addEventListener('click', closeVideoModal);
    }

    const oldCloseModalBtn = document.querySelector('.close-modal');
    if (oldCloseModalBtn) {
        oldCloseModalBtn.addEventListener('click', closeVideoModal);
    }

    // Close on click outside
    videoModal.addEventListener('click', (e) => {
        if (e.target === videoModal) {
            if (closeVideoBtn) closeVideoBtn.click();
        }
    });

    // --- Favorites Logic ---
    function toggleFavorite(videoId, btnElement) {
        const index = state.favorites.indexOf(videoId);
        if (index === -1) {
            state.favorites.push(videoId);
            btnElement.classList.add('active');
            showToast('Added to Favorites');
        } else {
            state.favorites.splice(index, 1);
            btnElement.classList.remove('active');
            showToast('Removed from Favorites', 'error'); // Using error style for removal
        }
        localStorage.setItem('favorites', JSON.stringify(state.favorites));

        // Re-render if in favorites view
        if (state.currentView === 'favorites') renderFavorites();
    }

    function renderFavorites() {
        const favoritesGrid = document.getElementById('favorites-grid');
        if (state.favorites.length === 0) {
            favoritesGrid.innerHTML = '<p class="empty-msg">No favorites yet.</p>';
            return;
        }

        const favVideos = videos.filter(v => state.favorites.includes(v.id));
        favoritesGrid.innerHTML = favVideos.map(createVideoCard).join('');
    }

    // --- Search Logic ---
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            if (query.length > 0) {
                // Switch to explore view to show results
                if (state.currentView !== 'explore') switchView('explore');

                const filtered = videos.filter(v =>
                    v.title.toLowerCase().includes(query) ||
                    v.creator.toLowerCase().includes(query)
                );
                exploreGrid.innerHTML = filtered.map(createVideoCard).join('');
            } else {
                renderExplore();
            }
        });
    }

});
