// Student data for AWS Cloud Academy
const studentData = [
    {
        name: "Madhu Sudhan P",
        job: "AWS Solutions Architect",
        interests: ["CloudFormation", "Lambda", "EC2"]
    },
    {
        name: "Bhushan",
        job: "DevOps Engineer",
        interests: ["CI/CD", "Docker", "ECS"]
    },
    {
        name: "Sumanth Hegde",
        job: "Cloud Security Specialist",
        interests: ["IAM", "Security Groups", "KMS"]
    },
    {
        name: "Varun V R Manjaru",
        job: "Cloud Data Engineer",
        interests: ["S3", "Redshift", "Glue"]
    },
    {
        name: "Nugala Vinay Chowdari",
        job: "AWS Cloud Engineer",
        interests: ["EC2", "VPC", "CloudWatch"]
    },
    {
        name: "Abhinay",
        job: "Cloud Infrastructure Specialist",
        interests: ["CloudFormation", "Terraform", "EKS"]
    },
    {
        name: "Abhishek Sharma",
        job: "AWS Network Engineer",
        interests: ["VPC", "Route53", "CloudFront"]
    },
    {
        name: "Telluri Sai Jaideep Reddy",
        job: "Cloud Application Developer",
        interests: ["Lambda", "API Gateway", "DynamoDB"]
    },
    {
        name: "Nitesh Karnam",
        job: "AWS Solutions Architect",
        interests: ["CloudFormation", "ECS", "RDS"]
    },
    {
        name: "Phanindra Peddina",
        job: "DevOps Engineer",
        interests: ["CI/CD", "CodePipeline", "CloudFormation"]
    },
    {
        name: "Aravind",
        job: "Cloud Migration Specialist",
        interests: ["AWS Migration", "DMS", "Storage Gateway"]
    },
    {
        name: "Vivek Kumar Singh",
        job: "Cloud Security Engineer",
        interests: ["WAF", "Shield", "GuardDuty"]
    },
    {
        name: "Adnan Mohammed",
        job: "AWS Database Specialist",
        interests: ["RDS", "DynamoDB", "ElastiCache"]
    },
    {
        name: "Subham Samir",
        job: "Cloud DevOps Engineer",
        interests: ["ECS", "Fargate", "CodeBuild"]
    },
    {
        name: "Narendran",
        job: "Cloud Networking Specialist",
        interests: ["Transit Gateway", "VPC", "Direct Connect"]
    },
    {
        name: "Dhananjay Bilgaye",
        job: "Serverless Architect",
        interests: ["Lambda", "Step Functions", "EventBridge"]
    },
    {
        name: "Niyati Jain",
        job: "Cloud Cost Optimization Specialist",
        interests: ["Cost Explorer", "Budgets", "Trusted Advisor"]
    },
    {
        name: "Akash Yadav",
        job: "AWS Infrastructure Engineer",
        interests: ["EC2", "Auto Scaling", "ELB"]
    },
    {
        name: "Satyajit Pani",
        job: "Cloud Compliance Specialist",
        interests: ["AWS Config", "CloudTrail", "Security Hub"]
    },
    {
        name: "Shuvam",
        job: "AWS Solutions Architect",
        interests: ["Well-Architected Framework", "CloudFormation", "Systems Manager"]
    },
    {
        name: "Hema",
        job: "Cloud Data Scientist",
        interests: ["SageMaker", "Comprehend", "Rekognition"]
    },
    {
        name: "Raghunath Pradhan",
        job: "Cloud Operations Engineer",
        interests: ["CloudWatch", "Systems Manager", "OpsWorks"]
    },
    {
        name: "Sovan Keshri",
        job: "AWS Certified Developer",
        interests: ["Lambda", "API Gateway", "S3"]
    },
    {
        name: "Anurag Kumar Gautam",
        job: "Cloud Integration Specialist",
        interests: ["Step Functions", "SQS", "SNS"]
    },
    {
        name: "Abhishek Banik",
        job: "Cloud Storage Specialist",
        interests: ["S3", "EFS", "Storage Gateway"]
    },
    {
        name: "Nitin C",
        job: "AWS Networking Specialist",
        interests: ["VPC", "Transit Gateway", "Route53"]
    },
    {
        name: "Aditya Lokapalli",
        job: "Cloud Security Engineer",
        interests: ["IAM", "Security Groups", "WAF"]
    },
    {
        name: "Monis",
        job: "AWS Database Administrator",
        interests: ["RDS", "Aurora", "DynamoDB"]
    },
    {
        name: "Suhail Siddiqui",
        job: "Cloud Architect",
        interests: ["Well-Architected Framework", "CloudFormation", "Landing Zone"]
    },
    {
        name: "Rahul Prasad",
        job: "DevSecOps Engineer",
        interests: ["Security Hub", "Inspector", "CI/CD"]
    },
    {
        name: "Prakhar Kumar",
        job: "Cloud Infrastructure Engineer",
        interests: ["EC2", "VPC", "CloudFormation"]
    },
    {
        name: "Ravikanth Mallappa",
        job: "AWS Certified Solutions Architect",
        interests: ["Well-Architected Framework", "Migration", "Hybrid Cloud"]
    },
    {
        name: "Karthik Mohan",
        job: "Cloud Native Developer",
        interests: ["ECS", "EKS", "App Runner"]
    },
    {
        name: "Veturi Lakshmi Prathyusha",
        job: "Cloud Data Engineer",
        interests: ["Glue", "Athena", "Lake Formation"]
    },
    {
        name: "Vikranth",
        job: "AWS SysOps Administrator",
        interests: ["Systems Manager", "CloudWatch", "Auto Scaling"]
    },
    {
        name: "Namitha T K",
        job: "Cloud Automation Specialist",
        interests: ["CloudFormation", "CDK", "Systems Manager"]
    },
    {
        name: "Suryansh",
        job: "Serverless Developer",
        interests: ["Lambda", "API Gateway", "DynamoDB"]
    },
    {
        name: "Chanchal Khatua",
        job: "Cloud Security Analyst",
        interests: ["Security Hub", "GuardDuty", "Macie"]
    },
    {
        name: "Udit Mishra",
        job: "AWS Certified DevOps Engineer",
        interests: ["CodePipeline", "CodeBuild", "CloudFormation"]
    },
    {
        name: "Ikram Mohammed",
        job: "Cloud Migration Specialist",
        interests: ["Application Discovery", "Migration Hub", "CloudEndure"]
    }
];

// Function to generate student cards
function generateStudentCards() {
    const studentGrid = document.querySelector('.student-grid');
    if (!studentGrid) return;
    
    // Clear existing content
    studentGrid.innerHTML = '';
    
    // Add all students
    studentData.forEach(student => {
        const card = document.createElement('div');
        card.className = 'student-card';
        
        // Create interests HTML
        const interestsHTML = student.interests.map(interest => 
            `<span>${interest}</span>`
        ).join('');
        
        card.innerHTML = `
            <h3 class="student-name">${student.name}</h3>
            <div class="student-job">${student.job}</div>
            <div class="student-interests">
                ${interestsHTML}
            </div>
            <div class="student-actions">
                <button class="btn btn-outline view-profile-btn" data-modal="student-profile-modal">View Profile</button>
                <button class="btn btn-primary contact-btn" data-modal="contact-modal">Contact</button>
            </div>
        `;
        
        studentGrid.appendChild(card);
    });
    
    // Re-initialize buttons for the new cards
    initButtons();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Generate student cards if we're on the students page
    if (document.getElementById('students-page')) {
        generateStudentCards();
    }
    
    // Update stats
    const enrolledStudentsElement = document.querySelector('.stat-card:nth-child(1) .stat-card-value');
    if (enrolledStudentsElement) {
        enrolledStudentsElement.textContent = studentData.length;
    }
});