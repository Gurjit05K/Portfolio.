// ======================
// PAGE RELOAD FIX
// ======================
window.addEventListener('load', () => {
    if (window.location.hash) {
        history.replaceState(null, null, ' ');
    }
    window.scrollTo(0, 0);
});

document.addEventListener('DOMContentLoaded', () => {
    window.scrollTo(0, 0);
});
// ======================

// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const backToTopBtn = document.getElementById('back-to-top');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navbarMenu = document.getElementById('navbar-menu');
const navLinks = document.querySelectorAll('.nav-link');
const contactForm = document.getElementById('contactForm');
const currentYear = document.getElementById('current-year');
const typingText = document.querySelector('.typing-text');


const EMAILJS_CONFIG = {
    SERVICE_ID: 'ADD_IN_VERCEL_SERVICE_ID',
    TEMPLATE_ID: 'ADD_IN_VERCEL_TEMPLATE_ID',
    PUBLIC_KEY: 'ADD_IN_VERCEL_PUBLIC_KEY'
};

// Initialize EmailJS
(function() {
    if (EMAILJS_CONFIG.PUBLIC_KEY && EMAILJS_CONFIG.PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
        emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
        console.log('EmailJS initialized successfully');
    } else {
        console.warn('EmailJS not configured. Update EMAILJS_CONFIG in script.js');
    }
})();

// Check for saved theme or default to light
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

// Theme Toggle
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    themeToggle.style.transform = 'scale(0.9)';
    setTimeout(() => {
        themeToggle.style.transform = 'scale(1)';
    }, 150);
});

// Back to Top Button
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
    
    updateActiveNavLink();
});

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Mobile Menu Toggle
mobileMenuBtn.addEventListener('click', () => {
    navbarMenu.classList.toggle('active');
    const icon = mobileMenuBtn.querySelector('i');
    icon.classList.toggle('fa-bars');
    icon.classList.toggle('fa-times');
});

// Close mobile menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navbarMenu.classList.remove('active');
        const icon = mobileMenuBtn.querySelector('i');
        icon.classList.add('fa-bars');
        icon.classList.remove('fa-times');
    });
});

// Update active navigation link
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// Form Validation and EmailJS Submission
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form elements
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const messageInput = document.getElementById('message');
        const submitBtn = document.querySelector('.submit-btn');
        const submitText = document.getElementById('submit-text');
        const submitSpinner = document.getElementById('submit-spinner');
        const formMessage = document.getElementById('form-message');
        
        // Reset errors and message
        clearErrors();
        formMessage.textContent = '';
        formMessage.className = 'form-message';
        
        // Validate form
        let isValid = true;
        
        if (!nameInput.value.trim()) {
            showError('name-error', 'Name is required');
            isValid = false;
        } else if (nameInput.value.trim().length < 2) {
            showError('name-error', 'Name must be at least 2 characters');
            isValid = false;
        }
        
        if (!emailInput.value.trim()) {
            showError('email-error', 'Email is required');
            isValid = false;
        } else if (!isValidEmail(emailInput.value)) {
            showError('email-error', 'Please enter a valid email address');
            isValid = false;
        }
        
        if (!messageInput.value.trim()) {
            showError('message-error', 'Message is required');
            isValid = false;
        } else if (messageInput.value.trim().length < 10) {
            showError('message-error', 'Message must be at least 10 characters');
            isValid = false;
        } else if (messageInput.value.trim().length > 1000) {
            showError('message-error', 'Message is too long (max 1000 characters)');
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Show loading state
        submitText.textContent = 'Sending...';
        submitSpinner.classList.remove('hidden');
        submitBtn.disabled = true;
        
        // Prepare email data
        const templateParams = {
            from_name: nameInput.value.trim(),
            from_email: emailInput.value.trim(),
            message: messageInput.value.trim(),
            to_name: 'Gurjit',
            reply_to: emailInput.value.trim(),
            date: new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        };
        
        try {
            // Send email via EmailJS
            const response = await emailjs.send(
                EMAILJS_CONFIG.SERVICE_ID,
                EMAILJS_CONFIG.TEMPLATE_ID,
                templateParams
            );
            
            console.log('Email sent successfully:', response);
            
            // Show success message
            formMessage.textContent = 'Message sent successfully! I\'ll get back to you within 24 hours.';
            formMessage.classList.add('success');
            
            // Reset form
            contactForm.reset();
            
            // Hide message after 7 seconds
            setTimeout(() => {
                formMessage.textContent = '';
                formMessage.className = 'form-message';
            }, 7000);
            
        } catch (error) {
            console.error('EmailJS error:', error);
            
            // Show user-friendly error message
            let errorMessage = 'Failed to send message. Please try again.';
            
            if (error.text) {
                try {
                    const errorData = JSON.parse(error.text);
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    // If can't parse JSON, use default message
                }
            }
            
            formMessage.textContent = `❌ ${errorMessage}`;
            formMessage.classList.add('error');
            
            // Keep error message visible longer
            setTimeout(() => {
                formMessage.textContent = '';
                formMessage.className = 'form-message';
            }, 10000);
        } finally {
            // Reset button state
            submitText.textContent = 'Send Message';
            submitSpinner.classList.add('hidden');
            submitBtn.disabled = false;
        }
    });
}

// Helper function to validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Helper function to show error messages
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.color = '#e74c3c';
        errorElement.style.fontSize = '0.85rem';
        errorElement.style.marginTop = '0.3rem';
        errorElement.style.display = 'block';
    }
}

// Helper function to clear all error messages
function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
    });
}

// Set current year in footer
if (currentYear) {
    currentYear.textContent = new Date().getFullYear();
}

// Typing effect for the job title
const jobTitles = ['Frontend Developer', 'Web Developer'];
let currentTitleIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {
    if (!typingText) return;
    
    const currentTitle = jobTitles[currentTitleIndex];
    
    if (isDeleting) {
        typingText.textContent = currentTitle.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typingText.textContent = currentTitle.substring(0, charIndex + 1);
        charIndex++;
    }
    
    if (!isDeleting && charIndex === currentTitle.length) {
        isDeleting = true;
        setTimeout(typeEffect, 1500);
        return;
    }
    
    if (isDeleting && charIndex === 0) {
        isDeleting = false;
        currentTitleIndex = (currentTitleIndex + 1) % jobTitles.length;
    }
    
    const typingSpeed = isDeleting ? 50 : 100;
    setTimeout(typeEffect, typingSpeed);
}

// Initialize typing effect
if (typingText) {
    setTimeout(typeEffect, 1000);
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
            
            // Update URL without causing refresh issues
            if (targetId === '#home') {
                history.replaceState(null, null, ' ');
            } else {
                history.replaceState(null, null, targetId);
            }
        }
    });
});

// Add scroll animation for elements
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.skill-card, .project-card');
    
    elements.forEach(element => {
        const elementPosition = element.getBoundingClientRect().top;
        const screenPosition = window.innerHeight / 1.2;
        
        if (elementPosition < screenPosition) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }
    });
};

// Set initial state for animation
window.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('.skill-card, .project-card');
    elements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
    
    setTimeout(animateOnScroll, 100);
});

window.addEventListener('scroll', animateOnScroll);

// Test EmailJS connection on load (optional)
window.addEventListener('load', () => {
    if (typeof emailjs !== 'undefined' && EMAILJS_CONFIG.PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
        console.log('✅ EmailJS is ready to use');
    } else {
        console.warn('⚠️ EmailJS not configured. Update EMAILJS_CONFIG in script.js');
    }
});