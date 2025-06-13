// JavaScript for the event-based architecture demo

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tabs
    initTabs();
    
    // Initialize event form
    initEventForm();
    
    // Smooth scrolling for navigation
    initSmoothScroll();
});

// Initialize tabs in the code section
function initTabs() {
    const tabs = document.querySelectorAll('.code-tabs .tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all tab contents
            const tabContents = document.querySelectorAll('.code-panel');
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

// Initialize event form for the demo
function initEventForm() {
    const eventForm = document.getElementById('event-form');
    const logContainer = document.getElementById('log-container');
    const eventTypeSelect = document.getElementById('event-type');
    const eventDataTextarea = document.getElementById('event-data');
    
    // Update event data when event type changes
    eventTypeSelect.addEventListener('change', function() {
        const eventType = this.value;
        let sampleData = {};
        
        switch(eventType) {
            case 'order_created':
                sampleData = {
                    orderId: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
                    customer: "Govind",
                    items: [
                        { id: "ITEM-1", name: "AWS Certified Solutions Architect", price: 125.50 },
                        { id: "ITEM-2", name: "AWS Certified Developer", price: 115.00 }
                    ],
                    total: 240.50,
                    timestamp: new Date().toISOString()
                };
                break;
            case 'payment_processed':
                sampleData = {
                    orderId: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
                    paymentId: `PAY-${Math.floor(10000 + Math.random() * 90000)}`,
                    amount: 240.50,
                    status: "completed",
                    method: "credit_card",
                    timestamp: new Date().toISOString()
                };
                break;
            case 'shipment_created':
                sampleData = {
                    orderId: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
                    shipmentId: `SHP-${Math.floor(10000 + Math.random() * 90000)}`,
                    carrier: "AWS Delivery",
                    trackingNumber: `TRK-${Math.floor(10000 + Math.random() * 90000)}`,
                    estimatedDelivery: new Date(Date.now() + 3*24*60*60*1000).toISOString().split('T')[0],
                    timestamp: new Date().toISOString()
                };
                break;
            case 'order_delivered':
                sampleData = {
                    orderId: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
                    shipmentId: `SHP-${Math.floor(10000 + Math.random() * 90000)}`,
                    deliveredAt: new Date().toISOString(),
                    signedBy: "Govind",
                    status: "delivered",
                    timestamp: new Date().toISOString()
                };
                break;
        }
        
        eventDataTextarea.value = JSON.stringify(sampleData, null, 2);
    });
    
    // Handle form submission
    eventForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const eventType = eventTypeSelect.value;
        const eventData = eventDataTextarea.value;
        
        try {
            // Parse JSON data
            const data = JSON.parse(eventData);
            
            // Add log entry
            addLogEntry(`Publishing ${eventType} event...`);
            
            // Simulate API call
            await simulateEventProcessing(eventType, data);
            
            // Add success log
            addLogEntry(`Event ${eventType} published successfully!`, 'success');
            
            // Simulate event flow
            simulateEventFlow(eventType, data);
            
        } catch (error) {
            addLogEntry(`Error: ${error.message}`, 'error');
        }
    });
    
    function addLogEntry(message, type = 'info') {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        logContainer.appendChild(entry);
        logContainer.scrollTop = logContainer.scrollHeight;
    }
    
    async function simulateEventProcessing(eventType, data) {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Highlight API Gateway node
        highlightNode('api-gateway');
        addLogEntry(`API Gateway received ${eventType} event`);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Highlight Lambda node
        highlightNode('lambda');
        addLogEntry(`Lambda processing event data`);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Highlight SNS node
        highlightNode('sns');
        addLogEntry(`SNS publishing event to subscribers`);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Highlight downstream services
        highlightNode('sqs');
        addLogEntry(`Event added to SQS queue for processing`);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        highlightNode('dynamodb');
        addLogEntry(`Event data stored in DynamoDB: ${data.orderId || data.paymentId || data.shipmentId}`);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        highlightNode('eventbridge');
        addLogEntry(`Event sent to EventBridge for cross-service integration`);
    }
    
    function highlightNode(nodeClass) {
        const node = document.querySelector(`.event-node.${nodeClass}`);
        node.classList.add('active');
        setTimeout(() => {
            node.classList.remove('active');
        }, 2000);
    }
}

// Initialize smooth scrolling for navigation links
function initSmoothScroll() {
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the target section
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                // Smooth scroll to section
                window.scrollTo({
                    top: targetSection.offsetTop - 70,
                    behavior: 'smooth'
                });
                
                // Update active nav link
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    // Update active nav link on scroll
    window.addEventListener('scroll', function() {
        let current = '';
        const sections = document.querySelectorAll('section');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= sectionTop && pageYOffset < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}