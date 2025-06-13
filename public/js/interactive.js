// Interactive features for AWS Cloud Academy LMS

document.addEventListener('DOMContentLoaded', function() {
    // Initialize interactive features
    initDragAndDrop();
    initSearchFilter();
    initTooltips();
    initUserMenu();
    
    // Add welcome message with typing effect
    const welcomeTitle = document.querySelector('.page-title');
    if (welcomeTitle && welcomeTitle.textContent.includes('Welcome')) {
        const originalText = welcomeTitle.textContent;
        welcomeTitle.textContent = '';
        typeText(welcomeTitle, originalText, 50);
    }
});

// Typing effect function
function typeText(element, text, speed) {
    let i = 0;
    function typing() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(typing, speed);
        }
    }
    typing();
}

// Initialize drag and drop for course cards
function initDragAndDrop() {
    const courseCards = document.querySelectorAll('.course-card');
    const studentCards = document.querySelectorAll('.student-card');
    
    // Make course cards draggable
    courseCards.forEach(card => {
        card.setAttribute('draggable', true);
        
        card.addEventListener('dragstart', function(e) {
            e.dataTransfer.setData('text/plain', card.querySelector('.course-title').textContent);
            this.classList.add('dragging');
        });
        
        card.addEventListener('dragend', function() {
            this.classList.remove('dragging');
        });
    });
    
    // Allow dropping on student cards
    studentCards.forEach(card => {
        card.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.classList.add('drag-over');
        });
        
        card.addEventListener('dragleave', function() {
            this.classList.remove('drag-over');
        });
        
        card.addEventListener('drop', function(e) {
            e.preventDefault();
            this.classList.remove('drag-over');
            
            const courseName = e.dataTransfer.getData('text/plain');
            const studentName = this.querySelector('.student-name').textContent;
            
            // Show assignment confirmation
            showToast(`Assigned "${courseName}" to ${studentName}`, 'success');
        });
    });
}

// Initialize search and filter functionality
function initSearchFilter() {
    // Create search input
    const studentsSection = document.querySelector('#students-page .section');
    if (studentsSection) {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.innerHTML = `
            <input type="text" id="student-search" class="search-input" placeholder="Search students...">
            <select id="student-filter" class="filter-select">
                <option value="all">All Students</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
            </select>
        `;
        
        // Insert after section title
        const sectionTitle = studentsSection.querySelector('.section-title');
        sectionTitle.parentNode.insertBefore(searchContainer, sectionTitle.nextSibling);
        
        // Add search functionality
        const searchInput = document.getElementById('student-search');
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const studentCards = document.querySelectorAll('.student-card');
            
            studentCards.forEach(card => {
                const studentName = card.querySelector('.student-name').textContent.toLowerCase();
                const studentJob = card.querySelector('.student-job').textContent.toLowerCase();
                
                if (studentName.includes(searchTerm) || studentJob.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
}

// Initialize tooltips
function initTooltips() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        // Create tooltip element
        const tooltip = document.createElement('span');
        tooltip.className = 'tooltip';
        tooltip.textContent = button.textContent.trim();
        
        // Add tooltip to button
        button.appendChild(tooltip);
        
        // Show/hide tooltip
        button.addEventListener('mouseenter', function() {
            tooltip.classList.add('show-tooltip');
        });
        
        button.addEventListener('mouseleave', function() {
            tooltip.classList.remove('show-tooltip');
        });
    });
}

// Initialize user menu dropdown
function initUserMenu() {
    const userAvatar = document.querySelector('.user-avatar');
    
    if (userAvatar) {
        // Create user menu dropdown
        const userDropdown = document.createElement('div');
        userDropdown.className = 'user-dropdown';
        userDropdown.innerHTML = `
            <ul class="user-dropdown-menu">
                <li><a href="#"><i class="fas fa-user-circle"></i> My Profile</a></li>
                <li><a href="#"><i class="fas fa-cog"></i> Account Settings</a></li>
                <li><a href="help-center.html"><i class="fas fa-question-circle"></i> Help Center</a></li>
                <li class="divider"></li>
                <li><a href="#" class="logout-link"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
            </ul>
        `;
        
        // Add to body
        document.body.appendChild(userDropdown);
        
        // Toggle dropdown
        userAvatar.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('show-dropdown');
            
            // Position dropdown
            const rect = userAvatar.getBoundingClientRect();
            userDropdown.style.top = (rect.bottom + 10) + 'px';
            userDropdown.style.right = (window.innerWidth - rect.right) + 'px';
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            userDropdown.classList.remove('show-dropdown');
        });
        
        // Handle logout
        const logoutLink = userDropdown.querySelector('.logout-link');
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            showToast('Logged out successfully', 'info');
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        });
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `interactive-toast toast-${type}`;
    
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    if (type === 'error') icon = 'times-circle';
    
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fas fa-${icon}"></i>
        </div>
        <div class="toast-content">${message}</div>
        <button class="toast-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to body
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => {
        toast.classList.add('show-toast');
    }, 10);
    
    // Close button
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        toast.classList.remove('show-toast');
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    });
    
    // Auto close
    setTimeout(() => {
        toast.classList.remove('show-toast');
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 5000);
}