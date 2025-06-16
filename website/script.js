document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.getElementById('upload-btn');
    const originalPreview = document.getElementById('original-preview');
    const resizedPreview = document.getElementById('resized-preview');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const statusElement = document.getElementById('status');
    const loadingElement = document.getElementById('loading');
    
    // AWS Configuration - to be filled after deployment
    const region = 'YOUR_AWS_REGION'; // e.g., 'us-east-1'
    const sourceBucketName = 'YOUR_SOURCE_BUCKET_NAME';
    const resizedBucketName = 'YOUR_RESIZED_BUCKET_NAME';
    
    // Initialize AWS SDK
    AWS.config.region = region;
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'YOUR_IDENTITY_POOL_ID', // You'll need to create a Cognito Identity Pool
    });
    
    const s3 = new AWS.S3();
    
    // Variables
    let selectedFile = null;
    
    // Event Listeners
    dropZone.addEventListener('click', () => fileInput.click());
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drop-zone--over');
    });
    
    ['dragleave', 'dragend'].forEach(type => {
        dropZone.addEventListener(type, () => {
            dropZone.classList.remove('drop-zone--over');
        });
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drop-zone--over');
        
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFileSelect(e.dataTransfer.files[0]);
        }
    });
    
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) {
            handleFileSelect(fileInput.files[0]);
        }
    });
    
    uploadBtn.addEventListener('click', uploadImage);
    
    // Functions
    function handleFileSelect(file) {
        // Check if file is an image
        if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
            showStatus('Please select a JPEG or PNG image.', 'error');
            return;
        }
        
        selectedFile = file;
        uploadBtn.disabled = false;
        
        // Show preview
        const reader = new FileReader();
        reader.onload = function(e) {
            originalPreview.innerHTML = '';
            const img = document.createElement('img');
            img.src = e.target.result;
            originalPreview.appendChild(img);
        };
        reader.readAsDataURL(file);
        
        // Reset resized preview
        resizedPreview.innerHTML = '<p>Upload to see the resized version</p>';
        
        showStatus('', '');
    }
    
    function uploadImage() {
        if (!selectedFile) return;
        
        // Generate a unique key for the file
        const fileKey = `${Date.now()}-${selectedFile.name}`;
        
        // Show progress
        progressContainer.style.display = 'block';
        progressBar.style.width = '0%';
        uploadBtn.disabled = true;
        
        // Upload to S3
        const params = {
            Bucket: sourceBucketName,
            Key: fileKey,
            Body: selectedFile,
            ContentType: selectedFile.type
        };
        
        const upload = s3.upload(params);
        
        upload.on('httpUploadProgress', function(evt) {
            const percentage = Math.round((evt.loaded / evt.total) * 100);
            progressBar.style.width = percentage + '%';
        });
        
        upload.send(function(err, data) {
            if (err) {
                showStatus('Upload failed: ' + err.message, 'error');
                uploadBtn.disabled = false;
                return;
            }
            
            showStatus('Image uploaded successfully! Processing...', 'success');
            loadingElement.classList.remove('hidden');
            
            // Poll for the resized image (it may take a few seconds for Lambda to process)
            checkForResizedImage(fileKey);
        });
    }
    
    function checkForResizedImage(originalKey) {
        const resizedKey = `resized-${originalKey}`;
        let attempts = 0;
        const maxAttempts = 20; // Try for about 10 seconds
        
        const checkInterval = setInterval(() => {
            attempts++;
            
            if (attempts > maxAttempts) {
                clearInterval(checkInterval);
                loadingElement.classList.add('hidden');
                showStatus('Timed out waiting for the resized image.', 'error');
                uploadBtn.disabled = false;
                return;
            }
            
            // Check if the resized image exists
            s3.headObject({
                Bucket: resizedBucketName,
                Key: resizedKey
            }, function(err, data) {
                if (err) {
                    // Image not ready yet, continue polling
                    return;
                }
                
                // Image is ready, display it
                clearInterval(checkInterval);
                loadingElement.classList.add('hidden');
                
                const resizedUrl = s3.getSignedUrl('getObject', {
                    Bucket: resizedBucketName,
                    Key: resizedKey,
                    Expires: 60 * 5 // URL expires in 5 minutes
                });
                
                resizedPreview.innerHTML = '';
                const img = document.createElement('img');
                img.src = resizedUrl;
                resizedPreview.appendChild(img);
                
                showStatus('Image resized successfully!', 'success');
                uploadBtn.disabled = false;
            });
        }, 500); // Check every 500ms
    }
    
    function showStatus(message, type) {
        statusElement.textContent = message;
        statusElement.className = 'status';
        if (type) {
            statusElement.classList.add(type);
        }
    }
});