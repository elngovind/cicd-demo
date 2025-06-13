// SNS Demo JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // SNS Notification System
    const snsSystem = {
        notifications: [],
        subscribers: [],
        
        // Add a new notification
        publish: function(topic, message) {
            const notification = {
                id: Date.now(),
                topic: topic,
                message: message,
                timestamp: new Date().toISOString(),
                read: false
            };
            
            this.notifications.push(notification);
            this.notifySubscribers(notification);
            
            // Update UI
            this.updateNotificationCount();
            this.addNotificationToList(notification);
            
            return notification;
        },
        
        // Subscribe to notifications
        subscribe: function(callback) {
            this.subscribers.push(callback);
            return this.subscribers.length - 1; // Return subscription ID
        },
        
        // Notify all subscribers
        notifySubscribers: function(notification) {
            this.subscribers.forEach(callback => {
                callback(notification);
            });
        },
        
        // Mark notification as read
        markAsRead: function(id) {
            const notification = this.notifications.find(n => n.id === id);
            if (notification) {
                notification.read = true;
                this.updateNotificationCount();
            }
        },
        
        // Get unread count
        getUnreadCount: function() {
            return this.notifications.filter(n => !n.read).length;
        },
        
        // Update notification count in UI
        updateNotificationCount: function() {
            const count = this.getUnreadCount();
            const badge = document.getElementById('notification-badge');
            
            if (badge) {
                badge.textContent = count;
                badge.style.display = count > 0 ? 'flex' : 'none';
            }
        },
        
        // Add notification to dropdown list
        addNotificationToList: function(notification) {
            const list = document.getElementById('notification-list');
            if (!list) return;
            
            const item = document.createElement('div');
            item.className = 'notification-item' + (notification.read ? '' : ' unread');
            item.dataset.id = notification.id;
            
            // Format the notification based on topic
            let icon = 'bell';
            let topicClass = '';
            
            switch(notification.topic) {
                case 'assignment':
                    icon = 'clipboard-list';
                    topicClass = 'topic-assignment';
                    break;
                case 'announcement':
                    icon = 'bullhorn';
                    topicClass = 'topic-announcement';
                    break;
                case 'grade':
                    icon = 'star';
                    topicClass = 'topic-grade';
                    break;
                case 'message':
                    icon = 'envelope';
                    topicClass = 'topic-message';
                    break;
            }
            
            item.innerHTML = `
                <div class="notification-icon ${topicClass}">
                    <i class="fas fa-${icon}"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${this.formatTime(notification.timestamp)}</div>
                </div>
                <div class="notification-action">
                    <button class="mark-read" title="Mark as read">
                        <i class="fas fa-check"></i>
                    </button>
                </div>
            `;
            
            // Add click handler to mark as read
            const markReadBtn = item.querySelector('.mark-read');
            markReadBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.markAsRead(notification.id);
                item.classList.remove('unread');
            });
            
            // Add the notification to the top of the list
            if (list.firstChild) {
                list.insertBefore(item, list.firstChild);
            } else {
                list.appendChild(item);
            }
            
            // Show notification toast
            this.showToast(notification);
        },
        
        // Format timestamp to relative time
        formatTime: function(timestamp) {
            const date = new Date(timestamp);
            const now = new Date();
            const diffMs = now - date;
            const diffSec = Math.round(diffMs / 1000);
            const diffMin = Math.round(diffSec / 60);
            const diffHour = Math.round(diffMin / 60);
            
            if (diffSec < 60) {
                return 'Just now';
            } else if (diffMin < 60) {
                return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
            } else if (diffHour < 24) {
                return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
            } else {
                return date.toLocaleDateString();
            }
        },
        
        // Show notification toast
        showToast: function(notification) {
            const toast = document.createElement('div');
            toast.className = 'notification-toast';
            
            let topicIcon = 'bell';
            let topicClass = '';
            
            switch(notification.topic) {
                case 'assignment':
                    topicIcon = 'clipboard-list';
                    topicClass = 'topic-assignment';
                    break;
                case 'announcement':
                    topicIcon = 'bullhorn';
                    topicClass = 'topic-announcement';
                    break;
                case 'grade':
                    topicIcon = 'star';
                    topicClass = 'topic-grade';
                    break;
                case 'message':
                    topicIcon = 'envelope';
                    topicClass = 'topic-message';
                    break;
            }
            
            toast.innerHTML = `
                <div class="toast-icon ${topicClass}">
                    <i class="fas fa-${topicIcon}"></i>
                </div>
                <div class="toast-content">
                    <div class="toast-title">${notification.topic.charAt(0).toUpperCase() + notification.topic.slice(1)} Notification</div>
                    <div class="toast-message">${notification.message}</div>
                </div>
                <button class="toast-close">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            // Add close button handler
            const closeBtn = toast.querySelector('.toast-close');
            closeBtn.addEventListener('click', () => {
                document.body.removeChild(toast);
            });
            
            // Add to body
            document.body.appendChild(toast);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    toast.classList.add('toast-hide');
                    setTimeout(() => {
                        if (document.body.contains(toast)) {
                            document.body.removeChild(toast);
                        }
                    }, 300);
                }
            }, 5000);
            
            // Animate in
            setTimeout(() => {
                toast.classList.add('toast-show');
            }, 10);
        }
    };
    
    // Initialize notification system
    window.SNS = snsSystem;
    
    // Set up notification dropdown toggle
    const notificationBtn = document.getElementById('notification-btn');
    const notificationDropdown = document.getElementById('notification-dropdown');
    
    if (notificationBtn && notificationDropdown) {
        notificationBtn.addEventListener('click', function(e) {
            e.preventDefault();
            notificationDropdown.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!notificationBtn.contains(e.target) && !notificationDropdown.contains(e.target)) {
                notificationDropdown.classList.remove('show');
            }
        });
    }
    
    // Demo: Add some sample notifications after page load
    setTimeout(() => {
        SNS.publish('announcement', 'Welcome to the new EduLearn LMS platform! Explore the new features.');
    }, 3000);
    
    setTimeout(() => {
        SNS.publish('assignment', 'New assignment "AWS Cloud Architecture" has been posted by Govind.');
    }, 8000);
    
    setTimeout(() => {
        SNS.publish('message', 'Govind: Please submit your project proposals by Friday.');
    }, 15000);
    
    // Add demo controls
    const demoControls = document.getElementById('sns-demo-controls');
    if (demoControls) {
        demoControls.addEventListener('submit', function(e) {
            e.preventDefault();
            const topic = document.getElementById('sns-topic').value;
            const message = document.getElementById('sns-message').value;
            
            if (message.trim() !== '') {
                SNS.publish(topic, message);
                document.getElementById('sns-message').value = '';
            }
        });
    }
});