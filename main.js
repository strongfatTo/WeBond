// WeBond Main JavaScript File

// Initialize all components when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    initializeCarousels();
    initializeMobileMenu();
    initializeScrollEffects();
    initializeInteractiveComponents();
});

// Animation initialization
function initializeAnimations() {
    // Animate feature cards on scroll
    const featureCards = document.querySelectorAll('.feature-card');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                anime({
                    targets: entry.target,
                    translateY: [50, 0],
                    opacity: [0, 1],
                    duration: 800,
                    delay: index * 100,
                    easing: 'easeOutCubic'
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    featureCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        observer.observe(card);
    });

    // Animate statistics counters
    animateCounters();
}

// Counter animation
function animateCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    
    counters.forEach(counter => {
        const target = parseInt(counter.dataset.counter);
        const duration = 2000;
        
        anime({
            targets: counter,
            innerHTML: [0, target],
            duration: duration,
            round: 1,
            easing: 'easeOutCubic'
        });
    });
}

// Initialize carousels
function initializeCarousels() {
    // Success stories carousel
    if (document.getElementById('success-stories')) {
        new Splide('#success-stories', {
            type: 'loop',
            perPage: 3,
            perMove: 1,
            gap: '2rem',
            autoplay: true,
            interval: 5000,
            pauseOnHover: true,
            breakpoints: {
                1024: {
                    perPage: 2,
                },
                640: {
                    perPage: 1,
                }
            }
        }).mount();
    }
}

// Mobile menu functionality
function initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const nav = document.querySelector('nav');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            // Toggle mobile menu (you can expand this based on your needs)
            console.log('Mobile menu clicked');
        });
    }
}

// Scroll effects
function initializeScrollEffects() {
    let ticking = false;
    
    function updateScrollEffects() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.floating-element');
        
        parallaxElements.forEach(element => {
            const speed = 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateScrollEffects);
            ticking = true;
        }
    }
    
    window.addEventListener('scroll', requestTick);
}

// Interactive components
function initializeInteractiveComponents() {
    // Button hover effects
    const buttons = document.querySelectorAll('.btn-primary');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            anime({
                targets: this,
                scale: 1.05,
                duration: 200,
                easing: 'easeOutCubic'
            });
        });
        
        button.addEventListener('mouseleave', function() {
            anime({
                targets: this,
                scale: 1,
                duration: 200,
                easing: 'easeOutCubic'
            });
        });
    });

    // Feature card interactions
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            anime({
                targets: this,
                rotateX: 5,
                rotateY: 5,
                duration: 300,
                easing: 'easeOutCubic'
            });
        });
        
        card.addEventListener('mouseleave', function() {
            anime({
                targets: this,
                rotateX: 0,
                rotateY: 0,
                duration: 300,
                easing: 'easeOutCubic'
            });
        });
    });

    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed nav
                
                anime({
                    targets: document.documentElement,
                    scrollTop: offsetTop,
                    duration: 800,
                    easing: 'easeInOutCubic'
                });
            }
        });
    });
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Form validation helper
function validateForm(formData) {
    const errors = {};
    
    if (!formData.name || formData.name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters long';
    }
    
    if (!formData.email || !isValidEmail(formData.email)) {
        errors.email = 'Please enter a valid email address';
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors: errors
    };
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Local storage helpers
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        return false;
    }
}

function getFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return null;
    }
}

// API simulation functions (for demo purposes)
function simulateApiCall(endpoint, data, delay = 1000) {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate different API responses
            switch (endpoint) {
                case '/api/matches':
                    resolve({
                        success: true,
                        matches: generateMockMatches()
                    });
                    break;
                case '/api/tasks':
                    resolve({
                        success: true,
                        tasks: generateMockTasks()
                    });
                    break;
                default:
                    resolve({ success: true, data: 'OK' });
            }
        }, delay);
    });
}

function generateMockMatches() {
    const mockMatches = [
        {
            id: 1,
            name: 'David Wong',
            rating: 4.8,
            skills: ['Cantonese', 'Local Guide', 'University Tours'],
            distance: '0.5 km',
            availability: 'Available Now',
            image: 'https://kimi-web-img.moonshot.cn/img/cdn.i-scmp.com/eca71b65fbcf675ccc0d80333e5dd911d975aaf0.jpg'
        },
        {
            id: 2,
            name: 'Lisa Chan',
            rating: 4.9,
            skills: ['Mandarin', 'Shopping Guide', 'Food Tours'],
            distance: '1.2 km',
            availability: 'Available Today',
            image: 'https://kimi-web-img.moonshot.cn/img/www.cambridgenetwork.com/f2b8238c91d4e1251e40ec2cc41d45f42f211128.jpg'
        }
    ];
    return mockMatches;
}

function generateMockTasks() {
    const mockTasks = [
        {
            id: 1,
            title: 'Help with Cantonese pronunciation',
            category: 'Language Learning',
            budget: 'HK$150/hour',
            location: 'Central',
            urgency: 'This week',
            student: 'Sarah Kim'
        },
        {
            id: 2,
            title: 'Guide to local food markets',
            category: 'Cultural Experience',
            budget: 'HK$200/hour',
            location: 'Mong Kok',
            urgency: 'This weekend',
            student: 'Emily Chen'
        }
    ];
    return mockTasks;
}

// Export functions for use in other pages
window.WeBond = {
    animateCounters,
    validateForm,
    saveToLocalStorage,
    getFromLocalStorage,
    simulateApiCall,
    generateMockMatches,
    generateMockTasks
};