// Main JavaScript for LMS functionality

document.addEventListener('DOMContentLoaded', function() {
    // Initialize modals
    initModals();
    
    // Initialize tabs
    initTabs();
    
    // Initialize buttons
    initButtons();
    
    // Add mobile toggle button if needed
    const header = document.querySelector('.header-container');
    const mobileToggle = document.createElement('button');
    mobileToggle.classList.add('mobile-toggle');
    mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
    header.prepend(mobileToggle);
    
    // Handle sidebar toggle
    mobileToggle.addEventListener('click', function() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('active');
    });
    
    // Add animation classes with delay
    const animatedElements = document.querySelectorAll('.stat-card, .student-card, .backend-card');
    animatedElements.forEach((el, index) => {
        el.style.opacity = '0';
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }, 50 * (index + 1));
    });
    
    // Add pulse animation to home button
    const homeBtn = document.querySelector('.home-btn');
    if (homeBtn) {
        setTimeout(() => {
            homeBtn.classList.add('pulse-animation');
            setTimeout(() => {
                homeBtn.classList.remove('pulse-animation');
            }, 2000);
        }, 1000);
    }
    
    // Mark all notifications as read
    const markAllReadBtn = document.querySelector('.mark-all-read');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', function() {
            const unreadItems = document.querySelectorAll('.notification-item.unread');
            unreadItems.forEach(item => {
                item.classList.remove('unread');
                if (window.SNS) {
                    window.SNS.markAsRead(parseInt(item.dataset.id));
                }
            });
        });
    }
    
    // Handle navigation
    const navLinks = document.querySelectorAll('.nav-links a, .sidebar-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Get the target page
            const target = this.getAttribute('data-target');
            
            // Hide all pages
            document.querySelectorAll('.page').forEach(page => {
                page.style.display = 'none';
            });
            
            // Show the target page
            if (target && document.getElementById(target)) {
                document.getElementById(target).style.display = 'block';
            }
        });
    });
});

// Initialize modals
function initModals() {
    // Open modal buttons
    const modalButtons = document.querySelectorAll('[data-modal]');
    modalButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
            }
        });
    });
    
    // Close modal buttons
    const closeButtons = document.querySelectorAll('.modal-close, .modal-cancel');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal-overlay');
            if (modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Close modal when clicking outside
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
            }
        });
    });
}

// Initialize tabs
function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabGroup = this.closest('.tabs');
            const tabContents = tabGroup.nextElementSibling.querySelectorAll('.tab-content');
            
            // Remove active class from all tabs in this group
            tabGroup.querySelectorAll('.tab').forEach(t => {
                t.classList.remove('active');
            });
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all tab contents
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            
            // Show the target tab content
            const target = this.getAttribute('data-tab');
            if (target) {
                document.getElementById(target).classList.add('active');
            }
        });
    });
}

// Initialize buttons
function initButtons() {
    // View Profile buttons
    const viewProfileButtons = document.querySelectorAll('.view-profile-btn');
    viewProfileButtons.forEach(button => {
        button.addEventListener('click', function() {
            const studentName = this.closest('.student-card').querySelector('.student-name').textContent;
            const studentJob = this.closest('.student-card').querySelector('.student-job').textContent;
            
            // Update modal content
            const modal = document.getElementById('student-profile-modal');
            if (modal) {
                modal.querySelector('.modal-title').textContent = studentName;
                modal.querySelector('.student-job-title').textContent = studentJob;
                
                // Show modal
                modal.classList.add('active');
            }
        });
    });
    
    // Contact buttons
    const contactButtons = document.querySelectorAll('.contact-btn');
    contactButtons.forEach(button => {
        button.addEventListener('click', function() {
            const studentName = this.closest('.student-card').querySelector('.student-name').textContent;
            
            // Update modal content
            const modal = document.getElementById('contact-modal');
            if (modal) {
                modal.querySelector('.modal-title').textContent = `Contact ${studentName}`;
                modal.querySelector('#contact-name').value = studentName;
                
                // Show modal
                modal.classList.add('active');
            }
        });
    });
    
    // Form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const name = this.querySelector('#contact-name').value;
            const message = this.querySelector('#contact-message').value;
            
            // Show success message
            alert(`Message sent to ${name}: "${message}"`);
            
            // Close modal
            document.getElementById('contact-modal').classList.remove('active');
            
            // Reset form
            this.reset();
        });
    }
    
    // Export button
    const exportButton = document.querySelector('.export-btn');
    if (exportButton) {
        exportButton.addEventListener('click', function() {
            alert('Student list exported successfully!');
        });
    }
    
    // View All buttons
    const viewAllButtons = document.querySelectorAll('.view-all-btn');
    viewAllButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get the target section
            const target = this.getAttribute('data-target');
            
            // Hide all pages
            document.querySelectorAll('.page').forEach(page => {
                page.style.display = 'none';
            });
            
            // Show the target page
            if (target && document.getElementById(target)) {
                document.getElementById(target).style.display = 'block';
                
                // Update active nav link
                document.querySelectorAll('.nav-links a, .sidebar-menu a').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('data-target') === target) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });
}