// Scroll-based background animation
function initScrollBackground() {
    console.log('Initializing scroll background');
    
    function updateBackground() {
        const scrolled = window.pageYOffset || document.documentElement.scrollTop;
        const speed = scrolled * 0.3;
        
        if (document.body) {
            document.body.style.backgroundPosition = `${speed}px ${speed}px`;
        }
        
        // Animate the diagonal black strip to grow right over the logo - synced with scroll background
        const heroSection = document.querySelector('.hero-section');
        
        if (heroSection) {
            // Match the speed of other scroll effects - use same calculation as background
            const scrollProgress = Math.min(scrolled / window.innerHeight, 1);
            // Growth range from 30% to 60%
            const blackArea = 29.6 + (scrollProgress * 30); // Grows from 30% to 60%
            
            heroSection.style.setProperty('--black-area', `${blackArea}%`);
        }
    }
    
    // Initial call
    updateBackground();
    
    // Add scroll listener
    window.addEventListener('scroll', updateBackground, { passive: true });
    
    // Also try with requestAnimationFrame for smoother performance
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateBackground();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
}

// Initialize immediately and on load
initScrollBackground();
document.addEventListener('DOMContentLoaded', () => {
    initScrollBackground();
    console.log('Scroll background initialized on DOM ready');
    initTopRightNavigation();
    initMobileBottomNavigation();
    initLandingAnimations();
    initConsoleParallax();
    initServiceCardAnimations();
});

// Top Right Navigation functionality
function initTopRightNavigation() {
    const navItems = document.querySelectorAll('.top-right-nav .nav-item-top');
    const navIndicator = document.querySelector('.nav-indicator-top');
    const navContainer = document.querySelector('.nav-container-top');
    let isScrolling = false;
    
    if (navItems.length === 0) {
        console.warn('No navigation items found');
        return;
    }
    
    // Handle navigation clicks
    navItems.forEach((item, index) => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Prevent scroll updates temporarily
            isScrolling = true;
            
            // Remove active class from all items
            navItems.forEach(navItem => navItem.classList.remove('active'));
            
            // Add active class to clicked item
            item.classList.add('active');
            
            // Update indicator position and container width
            updateIndicatorPosition(index);
            updateContainerWidth();
            
            // Get target section and scroll to it
            const targetSection = item.getAttribute('data-section');
            if (targetSection) {
                scrollToSection(targetSection);
                
                // Re-enable scroll updates after scrolling completes
                setTimeout(() => {
                    isScrolling = false;
                }, 1000);
            }
        });
    });

    // Immediate initial setup for home navigation
    const homeNavItem = document.querySelector('.nav-item-top[data-section="home"]');
    if (homeNavItem) {
        homeNavItem.classList.add('active');
        updateContainerWidth();
    }
    
    // Function to update indicator position
    function updateIndicatorPosition(activeIndex) {
        if (navIndicator) {
            const baseWidth = 50; // Base width of each nav item
            const leftPosition = 8 + (activeIndex * baseWidth);
            navIndicator.style.left = `${leftPosition}px`;
            
            // Update indicator width for active item
            const activeItem = navItems[activeIndex];
            if (activeItem) {
                const isExpanded = activeItem.classList.contains('active');
                navIndicator.style.width = isExpanded ? '120px' : '50px';
            }
        }
    }
    
    // Function to update container width
    function updateContainerWidth() {
        if (navContainer) {
            const activeItem = document.querySelector('.nav-item-top.active');
            const baseItemsWidth = (navItems.length - 1) * 50; // Non-active items
            const activeItemWidth = activeItem ? 120 : 50; // Active item width
            const padding = 16; // Container padding (8px * 2)
            
            const totalWidth = baseItemsWidth + activeItemWidth + padding;
            navContainer.style.width = `${totalWidth}px`;
        }
    }
    
    // Update active nav item based on scroll position
    const updateActiveNav = () => {
        if (isScrolling) return; // Skip updates while manually scrolling
        
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 150; // Increased offset for better detection
        
        let activeSection = 'home'; // Default to home
        let activeSectionIndex = 0;
        
        // Find the current section
        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                activeSection = sectionId;
            }
        });
        
        // Update navigation only if there's a change
        const currentActive = document.querySelector('.nav-item-top.active');
        const newActive = document.querySelector(`.nav-item-top[data-section="${activeSection}"]`);
        
        if (currentActive !== newActive) {
            // Remove active class from all items
            navItems.forEach((navItem, index) => {
                navItem.classList.remove('active');
                if (navItem.getAttribute('data-section') === activeSection) {
                    navItem.classList.add('active');
                    activeSectionIndex = index;
                }
            });
            
            // Update indicator position and container width
            updateIndicatorPosition(activeSectionIndex);
            updateContainerWidth();
        }
    };
    
    // Debounced scroll listener for smoother performance
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(updateActiveNav, 50); // Increased debounce time
    }, { passive: true });
    
    // Initial setup
    setTimeout(() => {
        // Ensure home is active on page load
        const homeNavItem = document.querySelector('.nav-item-top[data-section="home"]');
        if (homeNavItem && !homeNavItem.classList.contains('active')) {
            // Remove active from all nav items
            navItems.forEach(navItem => navItem.classList.remove('active'));
            // Add active to home
            homeNavItem.classList.add('active');
        }
        
        // Force container expansion for initial load
        if (navContainer) {
            updateContainerWidth();
        }
        
        updateActiveNav();
        updateContainerWidth();
        updateIndicatorPosition(0); // Set indicator to home position
    }, 100);
}

// Mobile Bottom Navigation
function initMobileBottomNavigation() {
    const nav = document.querySelector('.mobile-bottom-nav');
    if (!nav) return;
    const items = nav.querySelectorAll('.mb-nav-item');
    const setActive = (index) => {
        items.forEach((el, i) => el.classList.toggle('active', i === index));
    };

    items.forEach((btn, index) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const section = btn.getAttribute('data-section');
            if (section) {
                scrollToSection(section);
                setActive(index);
            }
        });
    });

    // Update active state on scroll
    const sections = Array.from(document.querySelectorAll('section[id]'));
    const updateActiveOnScroll = () => {
        const scrollPos = window.scrollY + 140; // offset for top nav height
        let activeId = 'home';
        let idx = 0;
        sections.forEach((sec, i) => {
            const top = sec.offsetTop;
            const h = sec.offsetHeight;
            if (scrollPos >= top && scrollPos < top + h) {
                activeId = sec.id;
            }
        });
        const foundIndex = items.length ? Array.from(items).findIndex(it => it.getAttribute('data-section') === activeId) : 0;
        if (foundIndex >= 0) {
            idx = foundIndex;
        }
        setActive(idx);
    };

    window.addEventListener('scroll', () => {
        // Debounce minimal
        if (window.__mbNavTick) return;
        window.__mbNavTick = true;
        requestAnimationFrame(() => {
            updateActiveOnScroll();
            window.__mbNavTick = false;
        });
    }, { passive: true });

    // Initial state
    setActive(0);
    updateActiveOnScroll();
}

// Navigation functionality
class Navigation {
    constructor() {
        this.sidebar = document.getElementById('navSidebar');
        this.toggle = document.getElementById('navToggle');
        this.menu = document.getElementById('navMenu');
        this.links = document.querySelectorAll('.nav-link');
        this.isOpen = false;
        
        this.init();
    }
    
    init() {
        // Toggle mobile navigation
        this.toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleSidebar();
        });
        
        // Close navigation when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.sidebar.contains(e.target)) {
                this.closeSidebar();
            }
        });
        
        // Prevent sidebar from closing when clicking inside
        this.sidebar.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Smooth scroll and active link handling
        this.links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Remove active class from all links
                this.links.forEach(l => l.classList.remove('active'));
                
                // Add active class to clicked link
                link.classList.add('active');
                
                // Get target section
                const targetId = link.getAttribute('href').substring(1);
                this.scrollToSection(targetId);
                
                // Close mobile navigation after delay
                setTimeout(() => {
                    this.closeSidebar();
                }, 300);
            });
        });
        
        // Update active link on scroll
        this.updateActiveLink();
        window.addEventListener('scroll', () => this.updateActiveLink());
    }
    
    toggleSidebar() {
        this.isOpen = !this.isOpen;
        this.sidebar.classList.toggle('active', this.isOpen);
        
        // Add body class to prevent scrolling when sidebar is open on mobile
        if (window.innerWidth <= 1024) {
            document.body.classList.toggle('sidebar-open', this.isOpen);
        }
    }
    
    closeSidebar() {
        this.isOpen = false;
        this.sidebar.classList.remove('active');
        document.body.classList.remove('sidebar-open');
    }
    
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const offset = window.innerWidth <= 1024 ? 0 : 80;
            const targetPosition = section.offsetTop - offset;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
        
    updateActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                this.links.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
}

// Scroll-based background animation
class ScrollBasedBackground {
    constructor() {
        this.background = null;
        this.init();
    }
    
    init() {
        // Wait for the pseudo-element to be available
        setTimeout(() => {
            this.setupScrollAnimation();
        }, 100);
    }
    
    setupScrollAnimation() {
        let ticking = false;
        
        const updateBackground = () => {
            const scrollY = window.scrollY;
            const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollProgress = scrollY / documentHeight;
            
            // Calculate the transform based on scroll position
            // This creates a continuous diagonal movement
            const translateX = (scrollProgress * 600) % 300; // Loop every 300px
            const translateY = (scrollProgress * 600) % 300; // Loop every 300px
            
            // Apply the transform to the body pseudo-element
            document.documentElement.style.setProperty('--scroll-x', `${translateX}px`);
            document.documentElement.style.setProperty('--scroll-y', `${translateY}px`);
            
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateBackground);
                ticking = true;
            }
        });
        
        // Initialize position
        updateBackground();
    }
}

// Smooth scrolling utility
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offset = 80;
        const targetPosition = section.offsetTop - offset;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Controller image interactions
class ControllerEffects {
    constructor() {
        this.controller = document.getElementById('controllerImg');
        this.scrollRotation = 0;
        this.init();
    }
    
    init() {
        if (!this.controller) return;
        
        // Click effect - opens modal
        this.controller.addEventListener('click', () => {
            this.openControllerModal();
        });
        
        // Hover effects
        this.controller.addEventListener('mouseenter', () => {
            this.controller.style.filter = `
                drop-shadow(0 40px 80px rgba(0, 0, 0, 0.5)) 
                drop-shadow(0 15px 30px rgba(255, 0, 0, 0.4))
                drop-shadow(0 0 30px rgba(255, 0, 0, 0.8))
                hue-rotate(15deg)
            `;
        });
        
        this.controller.addEventListener('mouseleave', () => {
            this.controller.style.filter = `
                drop-shadow(0 30px 60px rgba(0, 0, 0, 0.4)) 
                drop-shadow(0 10px 20px rgba(255, 0, 0, 0.2))
            `;
        });
        
        // Scroll-based rotation
        this.initScrollRotation();
    }
    
    openControllerModal() {
        // Create modal overlay
        const modal = document.createElement('div');
        modal.className = 'controller-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                <div class="modal-header">
                    <h2>Elite Gaming Controller</h2>
                    <p>Professional-Grade Repair Services</p>
                </div>
                <div class="modal-body">
                    <div class="controller-showcase">
                        <img src="assets/elite-controller-3d.svg" alt="Elite Controller 3D View" class="modal-controller">
                    </div>
                    <div class="controller-features">
                        <h3>Repair Specializations</h3>
                        <ul>
                            <li><i class="fas fa-check-circle"></i> Analog Stick Drift Repair</li>
                            <li><i class="fas fa-check-circle"></i> Button Mechanism Replacement</li>
                            <li><i class="fas fa-check-circle"></i> Trigger Response Calibration</li>
                            <li><i class="fas fa-check-circle"></i> D-Pad Precision Adjustment</li>
                            <li><i class="fas fa-check-circle"></i> LED & Electronics Repair</li>
                            <li><i class="fas fa-check-circle"></i> Custom Modifications</li>
                        </ul>
                        <div class="modal-actions">
                            <button class="btn btn-primary" onclick="scrollToSection('book'); document.querySelector('.controller-modal').remove();">
                                <i class="fas fa-tools"></i> Book Repair Now
                            </button>
                            <button class="btn btn-secondary" onclick="scrollToSection('pricing'); document.querySelector('.controller-modal').remove();">
                                <i class="fas fa-dollar-sign"></i> View Pricing
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .controller-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: modalFadeIn 0.3s ease;
            }
            
            @keyframes modalFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(5px);
            }
            
            .modal-content {
                position: relative;
                background: white;
                border-radius: 20px;
                max-width: 800px;
                width: 90%;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                animation: modalSlideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            
            @keyframes modalSlideUp {
                from { 
                    opacity: 0;
                    transform: translateY(50px) scale(0.9);
                }
                to { 
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            
            .modal-close {
                position: absolute;
                top: 20px;
                right: 20px;
                background: none;
                border: none;
                font-size: 2rem;
                color: #666;
                cursor: pointer;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                z-index: 1;
            }
            
            .modal-close:hover {
                background: #ff0000;
                color: white;
                transform: rotate(90deg);
            }
            
            .modal-header {
                text-align: center;
                padding: 40px 40px 20px;
                background: linear-gradient(135deg, #ff0000, #cc0000);
                color: white;
                border-radius: 20px 20px 0 0;
            }
            
            .modal-header h2 {
                font-size: 2rem;
                font-weight: 800;
                margin-bottom: 10px;
            }
            
            .modal-body {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 40px;
                padding: 40px;
            }
            
            .controller-showcase {
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .modal-controller {
                width: 100%;
                max-width: 350px;
                animation: modalControllerSpin 4s ease-in-out infinite;
                filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3));
            }
            
            @keyframes modalControllerSpin {
                0%, 100% { transform: rotateY(0deg) rotateX(0deg); }
                25% { transform: rotateY(15deg) rotateX(5deg); }
                50% { transform: rotateY(0deg) rotateX(10deg); }
                75% { transform: rotateY(-15deg) rotateX(5deg); }
            }
            
            .controller-features h3 {
                font-size: 1.5rem;
                font-weight: 700;
                margin-bottom: 20px;
                color: #000;
            }
            
            .controller-features ul {
                list-style: none;
                margin-bottom: 30px;
            }
            
            .controller-features li {
                padding: 8px 0;
                display: flex;
                align-items: center;
                gap: 10px;
                color: #333;
            }
            
            .controller-features i {
                color: #ff0000;
            }
            
            .modal-actions {
                display: flex;
                gap: 15px;
                flex-wrap: wrap;
            }
            
            @media (max-width: 768px) {
                .modal-body {
                    grid-template-columns: 1fr;
                    gap: 20px;
                    padding: 20px;
                }
                
                .modal-header {
                    padding: 30px 20px 15px;
                }
                
                .modal-actions {
                    flex-direction: column;
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(modal);
        
        // Close modal functionality
        const closeModal = () => {
            modal.style.animation = 'modalFadeIn 0.3s ease reverse';
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                    document.head.removeChild(style);
                }
            }, 300);
        };
        
        modal.querySelector('.modal-close').onclick = closeModal;
        modal.querySelector('.modal-overlay').onclick = closeModal;
        
        // Escape key to close
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
        
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
        
        // Restore body scroll when modal closes
        const originalCloseModal = closeModal;
        closeModal = () => {
            document.body.style.overflow = '';
            originalCloseModal();
        };
        
        modal.querySelector('.modal-close').onclick = closeModal;
        modal.querySelector('.modal-overlay').onclick = closeModal;
    }
    
    initScrollRotation() {
        let ticking = false;
        
        const updateRotation = () => {
            const scrollY = window.scrollY;
            const heroSection = document.getElementById('home');
            
            if (heroSection) {
                const heroHeight = heroSection.offsetHeight;
                const scrollProgress = Math.min(scrollY / heroHeight, 1);
                
                // 3D rotation based on scroll
                const rotationY = scrollProgress * 360; // Full rotation
                const rotationX = Math.sin(scrollProgress * Math.PI) * 15; // Gentle X rotation
                const scale = 1 + (scrollProgress * 0.1); // Slight scale increase
                
                this.controller.style.transform = `
                    rotateY(${rotationY}deg) 
                    rotateX(${rotationX}deg) 
                    scale(${scale})
                `;
                
                // Update glow intensity based on scroll
                const glowIntensity = 0.2 + (scrollProgress * 0.4);
                this.controller.style.filter = `
                    drop-shadow(0 ${30 + scrollProgress * 30}px ${60 + scrollProgress * 60}px rgba(0, 0, 0, ${0.4 + scrollProgress * 0.2})) 
                    drop-shadow(0 ${10 + scrollProgress * 10}px ${20 + scrollProgress * 20}px rgba(255, 0, 0, ${glowIntensity}))
                `;
            }
            
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateRotation);
                ticking = true;
            }
        });
    }
    
    triggerGlitchEffect() {
        // Add glitch animation class
        this.controller.classList.add('glitch-effect');
        
        // Create CSS animation keyframes dynamically
        const style = document.createElement('style');
        style.textContent = `
            @keyframes glitch {
                0% { transform: translate(0); filter: hue-rotate(0deg); }
                10% { transform: translate(-2px, 2px); filter: hue-rotate(90deg); }
                20% { transform: translate(-3px, 0px); filter: hue-rotate(180deg); }
                30% { transform: translate(3px, 2px); filter: hue-rotate(270deg); }
                40% { transform: translate(1px, -1px); filter: hue-rotate(360deg); }
                50% { transform: translate(-1px, 2px); filter: hue-rotate(180deg); }
                60% { transform: translate(-3px, 1px); filter: hue-rotate(90deg); }
                70% { transform: translate(3px, 1px); filter: hue-rotate(45deg); }
                80% { transform: translate(-1px, -1px); filter: hue-rotate(270deg); }
                90% { transform: translate(1px, 2px); filter: hue-rotate(135deg); }
                100% { transform: translate(0); filter: hue-rotate(0deg); }
            }
            .glitch-effect {
                animation: glitch 0.5s ease-in-out;
            }
        `;
        
        document.head.appendChild(style);
        
        // Remove effect after animation
        setTimeout(() => {
            this.controller.classList.remove('glitch-effect');
            document.head.removeChild(style);
        }, 500);
        
        // Show gallery preview (placeholder functionality)
        this.showGalleryPreview();
    }
    
    showGalleryPreview() {
        // Simple alert for now - could be replaced with a modal
        const gallery = document.getElementById('gallery');
        if (gallery) {
            scrollToSection('gallery');
            
            // Add highlight effect to gallery
            gallery.style.background = 'linear-gradient(45deg, #ff000020, #ffffff20)';
            setTimeout(() => {
                gallery.style.background = '';
            }, 2000);
        }
    }
}

// Form handling
class FormHandler {
    constructor() {
        this.form = document.getElementById('repairForm');
        this.init();
    }
    
    init() {
        if (!this.form) return;
        
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
        
        // Add real-time validation
        const inputs = this.form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearErrors(input));
        });
    }
    
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        // Remove existing error
        this.clearErrors(field);
        
        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }
        
        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address';
            }
        }
        
        // Phone validation
        if (field.type === 'tel' && value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
                isValid = false;
                errorMessage = 'Please enter a valid phone number';
            }
        }
        
        // Show error if validation fails
        if (!isValid) {
            this.showError(field, errorMessage);
        }
        
        return isValid;
    }
    
    showError(field, message) {
        field.style.borderColor = '#ff0000';
        
        // Create error message element
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = '#ff0000';
        errorDiv.style.fontSize = '0.8rem';
        errorDiv.style.marginTop = '5px';
        errorDiv.textContent = message;
        
        // Insert error message after field
        field.parentNode.appendChild(errorDiv);
    }
    
    clearErrors(field) {
        field.style.borderColor = '#ddd';
        
        // Remove existing error message
        const errorMessage = field.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }
    
    handleSubmit() {
        const formData = new FormData(this.form);
        const data = Object.fromEntries(formData);
        
        // Validate all fields
        const inputs = this.form.querySelectorAll('input, select, textarea');
        let isFormValid = true;
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isFormValid = false;
            }
        });
        
        if (!isFormValid) {
            this.showNotification('Please correct the errors above', 'error');
            return;
        }

        // If EmailJS integration is present, hand off (its listener will also fire)
        if (window.emailjs && window.GameFixerEmail) {
            // Do nothing here; email.js will manage sending + button state
            return;
        }

        // Fallback: legacy simulated submission (when EmailJS not loaded)
        const submitButton = this.form.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitButton.disabled = true;

        setTimeout(() => {
            console.log('Form submitted (local simulation, no EmailJS):', data);
            this.form.reset();
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            this.showNotification('Repair request submitted successfully! We\'ll contact you within 24 hours.', 'success');
            const ticketNumber = 'GF' + Date.now().toString().slice(-6);
            this.showNotification(`Your repair ticket number is: ${ticketNumber}`, 'info');
        }, 1200);
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: 600;
            z-index: 10000;
            max-width: 400px;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        
        // Set background color based on type
        const colors = {
            success: '#28a745',
            error: '#dc3545',
            info: '#007bff',
            warning: '#ffc107'
        };
        
        notification.style.backgroundColor = colors[type] || colors.info;
        notification.textContent = message;
        
        // Add close button
        const closeBtn = document.createElement('span');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.cssText = `
            position: absolute;
            top: 5px;
            right: 10px;
            cursor: pointer;
            font-size: 1.2rem;
        `;
        closeBtn.onclick = () => this.removeNotification(notification);
        notification.appendChild(closeBtn);
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            this.removeNotification(notification);
        }, 5000);
    }
    
    removeNotification(notification) {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
}

// Scroll animations
class ScrollAnimations {
    constructor() {
        this.animatedElements = document.querySelectorAll('.service-card, .gallery-item, .info-card');
        this.init();
    }
    
    init() {
        // Create intersection observer
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                    this.observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        // Observe all animated elements
        this.animatedElements.forEach(element => {
            this.observer.observe(element);
        });
    }
}

// Performance optimization
class PerformanceOptimizer {
    constructor() {
        this.init();
    }
    
    init() {
        // Lazy load images
        this.lazyLoadImages();
        
        // Throttle scroll events
        this.throttleScrollEvents();
        
        // Preload critical resources
        this.preloadResources();
    }
    
    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    throttleScrollEvents() {
        let ticking = false;
        
        function updateScrollBehavior() {
            // Update navigation active states and other scroll-dependent features
            ticking = false;
        }
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollBehavior);
                ticking = true;
            }
        });
    }
    
    preloadResources() {
        // Preload important images
        const importantImages = [
            'assets/images/brand/xbox.png',
            'assets/images/brand/ps5.png'
        ];
        
        importantImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Hide loading screen immediately for debugging
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        // Remove loading screen after a short delay
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            loadingScreen.style.visibility = 'hidden';
            
            // Remove from DOM after transition
            setTimeout(() => {
                if (loadingScreen.parentNode) {
                    loadingScreen.parentNode.removeChild(loadingScreen);
                }
            }, 500);
        }, 800); // Reduced from 1500ms to 800ms
    }
    
    // Initialize all components
    try {
    new Navigation();
    new ScrollBasedBackground();
    // Expose form handler instance globally so email.js can reuse notifications
    window.FormHandlerInstance = new FormHandler();
        new ScrollAnimations();
        new PerformanceOptimizer();
        
        // Add loaded class to body
        document.body.classList.add('loaded');
        
        console.log('✅ All components initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing components:', error);
        
        // Force remove loading screen if there's an error
        if (loadingScreen && loadingScreen.parentNode) {
            loadingScreen.parentNode.removeChild(loadingScreen);
        }
    }
    
    // Console easter egg for developers
    console.log(`
    ╔══════════════════════════════════════╗
    ║                                      ║
    ║         🎮 THE GAME FIXER 🔧         ║
    ║                                      ║
    ║     Professional Gaming Hardware     ║
    ║            Repair Services           ║
    ║                                      ║
    ║    Looking for a developer job?      ║
    ║      Send us your portfolio!         ║
    ║                                      ║
    ╚══════════════════════════════════════╝
    `);
});

// Global utility functions
window.scrollToSection = scrollToSection;

// Service Worker registration for PWA functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Ads Carousel Functionality - Auto-cycling only
function initAdsCarousel() {
    const slides = document.querySelectorAll('.ad-slide');
    
    if (!slides.length) return;
    
    let currentSlide = 0;
    
    // Show specific slide
    function showSlide(index) {
        // Remove active class from all slides
        slides.forEach(slide => slide.classList.remove('active'));
        
        // Add active class to current slide
        slides[index].classList.add('active');
        
        currentSlide = index;
    }
    
    // Next slide
    function nextSlide() {
        const next = (currentSlide + 1) % slides.length;
        showSlide(next);
    }
    
    // Auto slide function - cycles every 15 seconds
    setInterval(nextSlide, 15000);
    
    console.log('Ads carousel initialized with', slides.length, 'slides (auto-cycling only)');
}

// Initialize ads carousel when DOM is loaded
// Initialize landing page animations
function initLandingAnimations() {
    // Check if mobile for faster animations
    const isMobile = window.innerWidth <= 768;
    const initialDelay = isMobile ? 50 : 100;
    const sequenceDelay = isMobile ? 100 : 150;
    const logoDelay = isMobile ? 200 : 300;
    
    // Wait for page to fully load, then trigger animations
    setTimeout(() => {
        // Animate PS5 console (left side)
        const ps5Image = document.querySelector('.console-left .console-image');
        if (ps5Image) {
            ps5Image.classList.add('animate-in');
        }
        
        // Animate Xbox console (right side) with delay
        setTimeout(() => {
            const xboxImage = document.querySelector('.console-right .console-image');
            if (xboxImage) {
                xboxImage.classList.add('animate-in');
            }
        }, sequenceDelay);
        
        // Animate main logo with bigger delay
        setTimeout(() => {
            const mainTitle = document.querySelector('.main-title');
            if (mainTitle) {
                mainTitle.classList.add('animate-in');
            }
        }, logoDelay);
        
    }, initialDelay);
}

// Initialize service card scroll animations
function initServiceCardAnimations() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    if (!serviceCards.length) return;
    
    // Create intersection observer
    const observerOptions = {
        threshold: 0.2, // Trigger when 20% of section is visible
        rootMargin: '0px 0px -100px 0px' // Start animation earlier
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Find all service cards and animate them together
                const allCards = document.querySelectorAll('.service-card');
                
                allCards.forEach((card, index) => {
                    // Deal cards like playing cards - bottom to top (0, 1, 2)
                    // Bottom card (least visible) animates first, top transparent card animates last
                    const delay = index * 300; // 300ms between each card for dramatic effect
                    
                    setTimeout(() => {
                        card.classList.add('in-view');
                    }, delay);
                });
                
                // Stop observing after first trigger
                observer.disconnect();
            }
        });
    }, observerOptions);
    
    // Observe the services section instead of individual cards
    const servicesSection = document.querySelector('.services-section');
    if (servicesSection) {
        observer.observe(servicesSection);
    }
}

// Initialize console parallax effect
function initConsoleParallax() {
    const consoleLeft = document.querySelector('.console-left');
    const consoleRight = document.querySelector('.console-right');
    const heroSection = document.querySelector('.hero-section');
    
    if (!consoleLeft || !consoleRight || !heroSection) return;
    
    function updateConsoleParallax() {
        const scrollY = window.scrollY;
        const heroHeight = heroSection.offsetHeight;
        const scrollProgress = Math.min(scrollY / heroHeight, 1);
        
        // Calculate inward movement - consoles move toward center
        const maxInwardMovement = 150; // How far they move inward
        const inwardOffset = scrollProgress * maxInwardMovement;
        
        // Left console moves right (toward center)
        consoleLeft.style.transform = `translateX(${inwardOffset}px)`;
        
        // Right console moves left (toward center)  
        consoleRight.style.transform = `translateX(-${inwardOffset}px)`;
        
        // Optional: Add slight fade effect as they move behind logo
        const opacity = Math.max(1 - (scrollProgress * 0.4), 0.6);
        consoleLeft.style.opacity = opacity;
        consoleRight.style.opacity = opacity;
    }
    
    // Throttled scroll listener for better performance
    let ticking = false;
    function handleScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateConsoleParallax();
                ticking = false;
            });
            ticking = true;
        }
    }
    
    // Add scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Initial call
    updateConsoleParallax();
}

document.addEventListener('DOMContentLoaded', initAdsCarousel);
