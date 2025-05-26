document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const previewContainer = document.getElementById('previewContainer');
    const toggleAdvanced = document.getElementById('toggleAdvanced');
    const advancedSettings = document.getElementById('advancedSettings');
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityValue = document.getElementById('qualityValue');
    const formatSelect = document.getElementById('formatSelect');
    const widthInput = document.getElementById('widthInput');
    const heightInput = document.getElementById('heightInput');
    const maintainAspectRatio = document.getElementById('maintainAspectRatio');
    const filterSelect = document.getElementById('filterSelect');
    const filterIntensity = document.getElementById('filterIntensity');
    const filterValue = document.getElementById('filterValue');
    const rotateLeft = document.getElementById('rotateLeft');
    const rotateRight = document.getElementById('rotateRight');
    const flipHorizontal = document.getElementById('flipHorizontal');
    const flipVertical = document.getElementById('flipVertical');
    const filenamePattern = document.getElementById('filenamePattern');
    const resetButton = document.getElementById('resetButton');
    const convertButton = document.getElementById('convertButton');
    const progressBar = document.getElementById('progressBar');
    const batchStatus = document.getElementById('batchStatus');
    const downloadAllButton = document.getElementById('downloadAllButton');
    const aboutLink = document.getElementById('aboutLink');
    const aboutModal = document.getElementById('aboutModal');
    const closeModal = document.getElementById('closeModal');
    
    // State variables
    let uploadedImages = [];
    let convertedImages = [];
    let currentRotation = 0;
    let isFlippedHorizontally = false;
    let isFlippedVertically = false;
    
    // Event Listeners
    fileInput.addEventListener('change', handleFileSelect);
    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);
    
    toggleAdvanced.addEventListener('click', toggleAdvancedSettings);
    qualitySlider.addEventListener('input', updateQualityValue);
    filterSelect.addEventListener('change', handleFilterChange);
    filterIntensity.addEventListener('input', updateFilterValue);
    
    widthInput.addEventListener('input', handleResizeInput);
    heightInput.addEventListener('input', handleResizeInput);
    
    rotateLeft.addEventListener('click', () => rotateImage(-90));
    rotateRight.addEventListener('click', () => rotateImage(90));
    flipHorizontal.addEventListener('click', () => flipImage('horizontal'));
    flipVertical.addEventListener('click', () => flipImage('vertical'));
    
    resetButton.addEventListener('click', resetSettings);
    convertButton.addEventListener('click', convertImages);
    downloadAllButton.addEventListener('click', downloadAllImages);
    
    aboutLink.addEventListener('click', openModal);
    closeModal.addEventListener('click', closeModalFunction);
    window.addEventListener('click', (e) => {
        if (e.target === aboutModal) {
            closeModalFunction();
        }
    });
    
    // Functions
    function handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            processFiles(files);
        }
    }
    
    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('drag-over');
    }
    
    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('drag-over');
    }
    
    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            processFiles(files);
        }
    }
    
    function processFiles(files) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type.match('image.*')) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const imageObj = {
                        id: generateUniqueId(),
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        dataUrl: e.target.result,
                        originalDataUrl: e.target.result
                    };
                    
                    uploadedImages.push(imageObj);
                    createImagePreview(imageObj);
                };
                
                reader.readAsDataURL(file);
            }
        }
    }
    
    function createImagePreview(imageObj) {
        const previewDiv = document.createElement('div');
        previewDiv.className = 'image-preview';
        previewDiv.dataset.id = imageObj.id;
        
        const img = document.createElement('img');
        img.src = imageObj.dataUrl;
        img.alt = imageObj.name;
        
        const removeButton = document.createElement('div');
        removeButton.className = 'remove-button';
        removeButton.innerHTML = '<i class="fas fa-times"></i>';
        removeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            removeImage(imageObj.id);
        });
        
        previewDiv.appendChild(img);
        previewDiv.appendChild(removeButton);
        previewContainer.appendChild(previewDiv);
    }
    
    function removeImage(id) {
        uploadedImages = uploadedImages.filter(img => img.id !== id);
        const previewToRemove = document.querySelector(`.image-preview[data-id="${id}"]`);
        if (previewToRemove) {
            previewContainer.removeChild(previewToRemove);
        }
    }
    
    function toggleAdvancedSettings() {
        advancedSettings.classList.toggle('show');
        toggleAdvanced.classList.toggle('active');
    }
    
    function updateQualityValue() {
        qualityValue.textContent = `${qualitySlider.value}%`;
    }
    
    function handleFilterChange() {
        const selectedFilter = filterSelect.value;
        if (selectedFilter === 'none') {
            filterIntensity.disabled = true;
            filterIntensity.value = 0;
            filterValue.textContent = '0%';
        } else {
            filterIntensity.disabled = false;
        }
    }
    
    function updateFilterValue() {
        filterValue.textContent = `${filterIntensity.value}%`;
    }
    
    function handleResizeInput() {
        if (maintainAspectRatio.checked && uploadedImages.length > 0) {
            const firstImage = new Image();
            firstImage.src = uploadedImages[0].originalDataUrl;
            
            const aspectRatio = firstImage.width / firstImage.height;
            
            if (this === widthInput && widthInput.value) {
                heightInput.value = Math.round(widthInput.value / aspectRatio);
            } else if (this === heightInput && heightInput.value) {
                widthInput.value = Math.round(heightInput.value * aspectRatio);
            }
        }
    }
    
    function rotateImage(degrees) {
        currentRotation = (currentRotation + degrees) % 360;
        if (currentRotation < 0) currentRotation += 360;
        
        // Preview rotation effect on thumbnails
        const previews = document.querySelectorAll('.image-preview img');
        previews.forEach(img => {
            img.style.transform = getTransformString();
        });
    }
    
    function flipImage(direction) {
        if (direction === 'horizontal') {
            isFlippedHorizontally = !isFlippedHorizontally;
        } else if (direction === 'vertical') {
            isFlippedVertically = !isFlippedVertically;
        }
        
        // Preview flip effect on thumbnails
        const previews = document.querySelectorAll('.image-preview img');
        previews.forEach(img => {
            img.style.transform = getTransformString();
        });
    }
    
    function getTransformString() {
        let transform = `rotate(${currentRotation}deg)`;
        if (isFlippedHorizontally) transform += ' scaleX(-1)';
        if (isFlippedVertically) transform += ' scaleY(-1)';
        return transform;
    }
    
    function resetSettings() {
        formatSelect.value = 'jpeg';
        qualitySlider.value = 80;
        qualityValue.textContent = '80%';
        widthInput.value = '';
        heightInput.value = '';
        maintainAspectRatio.checked = true;
        filterSelect.value = 'none';
        filterIntensity.value = 0;
        filterIntensity.disabled = true;
        filterValue.textContent = '0%';
        filenamePattern.value = '{name}_{date}';
        currentRotation = 0;
        isFlippedHorizontally = false;
        isFlippedVertically = false;
        
        // Reset preview transformations
        const previews = document.querySelectorAll('.image-preview img');
        previews.forEach(img => {
            img.style.transform = '';
        });
    }
    
    async function convertImages() {
        if (uploadedImages.length === 0) {
            alert('Please upload at least one image to convert.');
            return;
        }
        
        convertedImages = [];
        progressBar.style.width = '0%';
        batchStatus.textContent = 'Converting...';
        downloadAllButton.disabled = true;
        
        const format = formatSelect.value;
        const quality = parseInt(qualitySlider.value) / 100;
        const width = widthInput.value ? parseInt(widthInput.value) : null;
        const height = heightInput.value ? parseInt(heightInput.value) : null;
        const filter = filterSelect.value;
        const filterStrength = parseInt(filterIntensity.value) / 100;
        
        for (let i = 0; i < uploadedImages.length; i++) {
            const img = uploadedImages[i];
            
            try {
                const convertedImage = await processImage(
                    img,
                    format,
                    quality,
                    width,
                    height,
                    filter,
                    filterStrength
                );
                
                convertedImages.push(convertedImage);
                
                // Update progress
                const progress = ((i + 1) / uploadedImages.length) * 100;
                progressBar.style.width = `${progress}%`;
                batchStatus.textContent = `Converting: ${i + 1}/${uploadedImages.length}`;
            } catch (error) {
                console.error('Error converting image:', error);
            }
        }
        
        batchStatus.textContent = `Converted ${convertedImages.length} images successfully!`;
        downloadAllButton.disabled = false;
    }
    
    function processImage(imageObj, format, quality, width, height, filter, filterStrength) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = function() {
                // Set canvas dimensions
                let imgWidth = img.width;
                let imgHeight = img.height;
                
                // Apply resize if specified
                if (width && height) {
                    imgWidth = width;
                    imgHeight = height;
                } else if (width) {
                    const ratio = img.height / img.width;
                    imgWidth = width;
                    imgHeight = Math.round(width * ratio);
                } else if (height) {
                    const ratio = img.width / img.height;
                    imgHeight = height;
                    imgWidth = Math.round(height * ratio);
                }
                
                canvas.width = imgWidth;
                canvas.height = imgHeight;
                
                // Handle rotation and flipping
                ctx.save();
                ctx.translate(canvas.width / 2, canvas.height / 2);
                
                if (currentRotation !== 0) {
                    ctx.rotate((currentRotation * Math.PI) / 180);
                }
                
                if (isFlippedHorizontally) {
                    ctx.scale(-1, 1);
                }
                
                if (isFlippedVertically) {
                    ctx.scale(1, -1);
                }
                
                // Draw the image
                ctx.drawImage(
                    img,
                    -imgWidth / 2,
                    -imgHeight / 2,
                    imgWidth,
                    imgHeight
                );
                
                ctx.restore();
                
                // Apply filters
                if (filter !== 'none') {
                    applyFilter(ctx, canvas.width, canvas.height, filter, filterStrength);
                }
                
                // Generate filename
                const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
                const index = uploadedImages.indexOf(imageObj) + 1;
                const originalName = imageObj.name.substring(0, imageObj.name.lastIndexOf('.'));
                
                let filename = filenamePattern.value
                    .replace('{name}', originalName)
                    .replace('{date}', date)
                    .replace('{index}', index);
                
                filename += '.' + format;
                
                // Get the data URL
                let mimeType;
                switch (format) {
                    case 'jpeg':
                        mimeType = 'image/jpeg';
                        break;
                    case 'png':
                        mimeType = 'image/png';
                        break;
                    case 'webp':
                        mimeType = 'image/webp';
                        break;
                    case 'gif':
                        mimeType = 'image/gif';
                        break;
                    default:
                        mimeType = 'image/jpeg';
                }
                
                const dataUrl = canvas.toDataURL(mimeType, quality);
                
                resolve({
                    id: generateUniqueId(),
                    name: filename,
                    dataUrl: dataUrl,
                    format: format,
                    size: calculateImageSize(dataUrl)
                });
            };
            
            img.onerror = function() {
                reject(new Error('Failed to load image'));
            };
            
            img.src = imageObj.dataUrl;
        });
    }
    
    function applyFilter(ctx, width, height, filter, strength) {
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        switch (filter) {
            case 'grayscale':
                for (let i = 0; i < data.length; i += 4) {
                    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
                    const mix = strength;
                    data[i] = data[i] * (1 - mix) + avg * mix;
                    data[i + 1] = data[i + 1] * (1 - mix) + avg * mix;
                    data[i + 2] = data[i + 2] * (1 - mix) + avg * mix;
                }
                break;
                
            case 'sepia':
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    
                    const newR = (r * 0.393 + g * 0.769 + b * 0.189);
                    const newG = (r * 0.349 + g * 0.686 + b * 0.168);
                    const newB = (r * 0.272 + g * 0.534 + b * 0.131);
                    
                    const mix = strength;
                    data[i] = r * (1 - mix) + newR * mix;
                    data[i + 1] = g * (1 - mix) + newG * mix;
                    data[i + 2] = b * (1 - mix) + newB * mix;
                }
                break;
                
            case 'brightness':
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = Math.min(255, data[i] + 255 * strength);
                    data[i + 1] = Math.min(255, data[i + 1] + 255 * strength);
                    data[i + 2] = Math.min(255, data[i + 2] + 255 * strength);
                }
                break;
                
            case 'contrast':
                const factor = (259 * (strength * 100 + 255)) / (255 * (259 - strength * 100));
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = factor * (data[i] - 128) + 128;
                    data[i + 1] = factor * (data[i + 1] - 128) + 128;
                    data[i + 2] = factor * (data[i + 2] - 128) + 128;
                }
                break;
                
            case 'invert':
                for (let i = 0; i < data.length; i += 4) {
                    const mix = strength;
                    data[i] = data[i] * (1 - mix) + (255 - data[i]) * mix;
                    data[i + 1] = data[i + 1] * (1 - mix) + (255 - data[i + 1]) * mix;
                    data[i + 2] = data[i + 2] * (1 - mix) + (255 - data[i + 2]) * mix;
                }
                break;
                
            case 'blur':
                // Simple box blur - not efficient but works for demo
                if (strength > 0) {
                    const radius = Math.floor(strength * 10);
                    if (radius > 0) {
                        ctx.putImageData(imageData, 0, 0);
                        ctx.filter = `blur(${radius}px)`;
                        ctx.drawImage(ctx.canvas, 0, 0);
                        ctx.filter = 'none';
                        return; // Skip the putImageData below
                    }
                }
                break;
        }
        
        ctx.putImageData(imageData, 0, 0);
    }
    
    function downloadAllImages() {
        if (convertedImages.length === 0) {
            alert('No converted images to download.');
            return;
        }
        
        // If only one image, download directly
        if (convertedImages.length === 1) {
            downloadSingleImage(convertedImages[0]);
            return;
        }
        
        // For multiple images, create a zip file
        const zip = new JSZip();
        
        convertedImages.forEach(img => {
            // Convert data URL to blob
            const byteString = atob(img.dataUrl.split(',')[1]);
            const mimeString = img.dataUrl.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            
            const blob = new Blob([ab], { type: mimeString });
            zip.file(img.name, blob);
        });
        
        zip.generateAsync({ type: 'blob' }).then(function(content) {
            const zipUrl = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = zipUrl;
            a.download = 'converted_images.zip';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(zipUrl);
        });
    }
    
    function downloadSingleImage(img) {
        const a = document.createElement('a');
        a.href = img.dataUrl;
        a.download = img.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    
    function calculateImageSize(dataUrl) {
        // Rough estimation of file size from data URL
        const base64 = dataUrl.split(',')[1];
        const byteSize = Math.ceil((base64.length * 3) / 4);
        return byteSize;
    }
    
    function generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    
    function openModal(e) {
        e.preventDefault();
        aboutModal.style.display = 'block';
    }
    
    function closeModalFunction() {
        aboutModal.style.display = 'none';
    }
    
    // Initialize UI
    updateQualityValue();
    handleFilterChange();
    
    // Add JSZip library for downloading multiple files
    function loadJSZip() {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        document.head.appendChild(script);
    }
    
    loadJSZip();
});
