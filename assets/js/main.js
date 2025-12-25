// Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Close menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});


// Fetch and Display GitHub Projects
function loadGitHubProjects() {
    var username = 'Hkayy47';
    var grid = document.getElementById('projects-grid');
    
    if (!grid) {
        console.log('Projects grid not found, retrying...');
        setTimeout(loadGitHubProjects, 200);
        return;
    }
    
    console.log('Fetching GitHub projects...');
    
    fetch('https://api.github.com/users/' + username + '/repos?sort=updated&per_page=6')
        .then(function(response) {
            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error('HTTP ' + response.status);
            }
            return response.json();
        })
        .then(function(repos) {
            console.log('Received repos:', repos ? repos.length : 0);
            
            if (!repos || !Array.isArray(repos) || repos.length === 0) {
                grid.innerHTML = '<div class="project-card"><div class="project-content"><span class="project-number">01</span><h3 class="project-title">No Projects</h3><p class="project-description">No repositories found.</p></div></div>';
                return;
            }
            
            var html = '';
            var count = Math.min(repos.length, 6);
            for (var i = 0; i < count; i++) {
                var repo = repos[i];
                var num = (i < 9 ? '0' : '') + (i + 1);
                html += '<div class="project-card"><div class="project-content">';
                html += '<span class="project-number">' + num + '</span>';
                html += '<h3 class="project-title">' + (repo.name || 'Untitled') + '</h3>';
                html += '<p class="project-description">' + (repo.description || 'No description available.') + '</p>';
                html += '<a href="' + (repo.html_url || '#') + '" target="_blank" class="project-link">VIEW PROJECT →</a>';
                html += '</div></div>';
            }
            
            grid.innerHTML = html;
            console.log('Projects displayed successfully:', count);
        })
        .catch(function(error) {
            console.error('Error loading projects:', error);
            var grid = document.getElementById('projects-grid');
            if (grid) {
                grid.innerHTML = '<div class="project-card"><div class="project-content"><span class="project-number">01</span><h3 class="project-title">Projects</h3><p class="project-description">Visit <a href="https://github.com/' + username + '" target="_blank">GitHub</a> to see my projects.</p></div></div>';
            }
        });
}

// Load projects when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadGitHubProjects);
} else {
    loadGitHubProjects();
}

// Also try after a delay
setTimeout(loadGitHubProjects, 500);
setTimeout(loadGitHubProjects, 1500);

// Spotify Integration
// You can either:
// 1. Use a direct token (temporary - expires in 1 hour)
// 2. Set up OAuth flow (recommended for production)

// Option 1: Direct Token (paste your token here - expires in ~1 hour)
const SPOTIFY_DIRECT_TOKEN = 'BQCT56vvankfK0VcK5vIPHkToTa-444GJ6VJj-rGsi80b4iEsoZxtzQoIKmfRhnWZBetRDp4_NuaCajQy4tuWCKTCIrytxJTwahnlHIq7fmDlDm6uDX34fVUC57M2afCcZ0Or77rNjlWz_sQ52Qc1QwHSHPOll0IEp2VTym9BYPEzkrg1qIef1CprVonFMnhQin1tCun8s00zaH2n4L8IFypnwG_cjoMopph-QrDe_LObQxsP7Y_jShO9udrak7c3-UvaJ7VqKhDVAfYJ-92_wl7LOkC-yT_XZ5jmYs7QPwg1wcIK0zwQ2V1wZ2tiIvYX-rvhcbP';

// Option 2: OAuth Setup (for when token expires)
const SPOTIFY_CLIENT_ID = 'YOUR_SPOTIFY_CLIENT_ID'; // Update this if using OAuth
const SPOTIFY_REDIRECT_URI = window.location.origin + window.location.pathname;
const SPOTIFY_SCOPES = 'user-top-read';

// Helper function to fetch from Spotify API
async function fetchWebApi(endpoint, method, body, token) {
    const res = await fetch(`https://api.spotify.com/${endpoint}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        method,
        body: body ? JSON.stringify(body) : undefined
    });
    
    if (!res.ok) {
        throw new Error(`Spotify API error: ${res.status}`);
    }
    
    return await res.json();
}

async function fetchSpotifyTopTracks() {
    const tracksList = document.getElementById('tracks-list');
    const authNote = document.getElementById('auth-note');
    
    if (!tracksList) {
        console.error('Tracks list element not found');
        return;
    }
    
    // Try to get token from localStorage first, then direct token, then show auth
    let accessToken = localStorage.getItem('spotify_access_token') || SPOTIFY_DIRECT_TOKEN;
    
    if (!accessToken || accessToken === 'YOUR_SPOTIFY_CLIENT_ID') {
        // Show auth button
        if (authNote) {
            authNote.style.display = 'block';
        }
        if (tracksList) {
            tracksList.style.display = 'none';
        }
        return;
    }
    
    if (authNote) {
        authNote.style.display = 'none';
    }
    if (tracksList) {
        tracksList.style.display = 'flex';
    }
    
    try {
        // Use the same endpoint format as your working example
        const data = await fetchWebApi(
            'v1/me/top/tracks?time_range=long_term&limit=5',
            'GET',
            null,
            accessToken
        );
        
        if (data.items && data.items.length > 0) {
            tracksList.innerHTML = data.items.map((track, index) => `
                <div class="track-item">
                    <div class="track-number">${String(index + 1).padStart(2, '0')}</div>
                    <div class="track-info">
                        <div class="track-name">${track.name}</div>
                        <div class="track-artist">${track.artists.map(a => a.name).join(', ')}</div>
                    </div>
                    <a href="${track.external_urls.spotify}" target="_blank" class="track-link">
                        <i class="fab fa-spotify"></i>
                    </a>
                </div>
            `).join('');
        } else {
            throw new Error('No tracks found');
        }
    } catch (error) {
        console.error('Error fetching Spotify tracks:', error);
        
        // If token expired, try to get new one via OAuth
        if (error.message.includes('401') || error.message.includes('403')) {
            localStorage.removeItem('spotify_access_token');
            if (authNote) {
                authNote.style.display = 'block';
            }
            if (tracksList) {
                tracksList.style.display = 'none';
            }
        } else {
            if (tracksList) {
                tracksList.innerHTML = `
                    <div class="track-item">
                        <div class="track-number">01</div>
                        <div class="track-info">
                            <div class="track-name">Unable to load tracks</div>
                            <div class="track-artist">${error.message}</div>
                        </div>
                    </div>
                `;
            }
        }
    }
}

// Handle Spotify OAuth callback
function handleSpotifyCallback() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    
    if (accessToken) {
        localStorage.setItem('spotify_access_token', accessToken);
        window.history.replaceState({}, document.title, window.location.pathname);
        fetchSpotifyTopTracks();
    }
}

// Handle Spotify OAuth callback
function handleSpotifyCallback() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    
    if (accessToken) {
        localStorage.setItem('spotify_access_token', accessToken);
        window.history.replaceState({}, document.title, window.location.pathname);
        fetchSpotifyTopTracks();
    }
}

// Spotify Auth Button
document.addEventListener('DOMContentLoaded', () => {
    const authBtn = document.getElementById('spotify-auth-btn');
    if (authBtn) {
        authBtn.addEventListener('click', () => {
            if (SPOTIFY_CLIENT_ID === 'YOUR_SPOTIFY_CLIENT_ID') {
                alert('Please update SPOTIFY_CLIENT_ID in assets/js/main.js with your Spotify Client ID from https://developer.spotify.com/dashboard\n\nOr paste a new token in SPOTIFY_DIRECT_TOKEN (tokens expire in ~1 hour)');
                return;
            }
            
            const authUrl = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}&scope=${encodeURIComponent(SPOTIFY_SCOPES)}`;
            window.location.href = authUrl;
        });
    }
    
    // Check for OAuth callback
    handleSpotifyCallback();
});

// Background Image Rectangles
function initBackgroundImages() {
    const bgRects = document.querySelectorAll('.bg-image-rect');
    const imageFiles = ['pic01.jpg', 'pic02.jpg', 'pic03.jpg', 'pic04.jpg', 'pic05.jpg', 'pic06.jpg'];
    
    bgRects.forEach((rect, index) => {
        const imageFile = imageFiles[index] || imageFiles[0];
        rect.style.backgroundImage = `url(images/${imageFile})`;
        
        // Add parallax effect on scroll
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * 0.3;
            const rotation = (scrolled * 0.1) % 360;
            rect.style.transform = `translateY(${rate}px) rotate(${rotation - 5}deg)`;
        });
    });
}

// Contact Form Handler - Wait for DOM
document.addEventListener('DOMContentLoaded', function() {
    var contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            var name = document.getElementById('name').value;
            var email = document.getElementById('email').value;
            var message = document.getElementById('message').value;
            
            // Create mailto link
            var subject = encodeURIComponent('Portfolio Contact: ' + name);
            var body = encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\nMessage:\n' + message);
            var mailtoLink = 'mailto:your-email@example.com?subject=' + subject + '&body=' + body;
            
            // Show success message first
            var submitBtn = contactForm.querySelector('.submit-btn');
            var originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span>MESSAGE SENT ✓</span>';
            submitBtn.style.backgroundColor = '#333';
            
            // Reset form
            contactForm.reset();
            
            // Open email client after a brief delay
            setTimeout(function() {
                window.location.href = mailtoLink;
            }, 100);
            
            // Reset button after 3 seconds
            setTimeout(function() {
                submitBtn.innerHTML = originalText;
                submitBtn.style.backgroundColor = '#000';
            }, 3000);
        });
    }
});

// Enhanced Scroll Animation with Apple-like smoothness
// Sections are visible by default, but we can add scroll animations if desired
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Make all sections visible immediately
document.querySelectorAll('.section:not(.hero)').forEach((section) => {
    section.classList.add('visible');
});

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    } else {
        navbar.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
});

// Smooth scroll with easing
function smoothScrollTo(target) {
    const element = document.querySelector(target);
    if (element) {
        const startPosition = window.pageYOffset;
        const targetPosition = element.offsetTop - 80;
        const distance = targetPosition - startPosition;
        const duration = 1000;
        let start = null;

        function animation(currentTime) {
            if (start === null) start = currentTime;
            const timeElapsed = currentTime - start;
            const progress = Math.min(timeElapsed / duration, 1);
            
            // Easing function (ease-in-out-cubic)
            const ease = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;
            
            window.scrollTo(0, startPosition + distance * ease);
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }
        
        requestAnimationFrame(animation);
    }
}

// Enhanced smooth scrolling with custom easing
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        smoothScrollTo(this.getAttribute('href'));
    });
});

// Navbar scroll effect with smooth transitions
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
        navbar.style.backdropFilter = 'blur(10px)';
    } else {
        navbar.style.boxShadow = 'none';
        navbar.style.backdropFilter = 'none';
    }
    
    lastScroll = currentScroll;
}, { passive: true });

// Initialize everything
function initializePage() {
    // Load projects
    loadGitHubProjects();
    
    // Remove Spotify tracks fetch since we're using embed now
    // fetchSpotifyTopTracks();
    initBackgroundImages();
    
    // Add smooth reveal to hero on load
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.opacity = '0';
        setTimeout(() => {
            hero.style.transition = 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1)';
            hero.style.opacity = '1';
        }, 100);
    }
    
    // Make first few sections visible immediately
    setTimeout(() => {
        const aboutSection = document.getElementById('about');
        const projectsSection = document.getElementById('projects');
        if (aboutSection) aboutSection.classList.add('visible');
        if (projectsSection) projectsSection.classList.add('visible');
    }, 300);
}

// Try multiple ways to ensure initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    // DOM already loaded
    initializePage();
}

// Projects load automatically when script runs
