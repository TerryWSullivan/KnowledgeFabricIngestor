    const fileInput = document.getElementById('fileInput');
    const addFilesBtn = document.getElementById('addFilesBtn');
    const dropZone = document.getElementById('dropZone');
    const fileListDiv = document.getElementById('fileList');
    const uploadBtn = document.getElementById('uploadBtn');
    const fileCount = document.getElementById('fileCount');

    let selectedFiles = [];

    fileInput.addEventListener('change', e => handleFiles(e.target.files));

    dropZone.addEventListener('dragover', e => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () =>
        dropZone.classList.remove('dragover')
    );

    dropZone.addEventListener('drop', e => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
	
	const browseFilesLink = document.getElementById('browseFilesLink');

    browseFilesLink.addEventListener('click', e => {
        e.preventDefault();
        fileInput.click();
    });

    function handleFiles(files) {
        Array.from(files).forEach(file => {
            const exists = selectedFiles.some(
                f => f.name === file.name && f.size === file.size
            );
            if (!exists) selectedFiles.push(file);
        });

        fileInput.value = '';
        render();
    }

    function removeFile(index) {
        selectedFiles.splice(index, 1);
        render();
    }

    function render() {
        fileCount.textContent = `${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''}`;
        uploadBtn.disabled = selectedFiles.length === 0;

        if (selectedFiles.length === 0) {
            fileListDiv.innerHTML = '<p>No files selected.</p>';
            return;
        }

        fileListDiv.innerHTML = selectedFiles.map((file, i) => `
            <div class="file-item">
                <span><strong>${file.name}</strong> (${file.size} bytes)</span>
                <button onclick="removeFile(${i})">Remove</button>
            </div>
        `).join('');
    }

   uploadBtn.addEventListener('click', () => {
    uploadBtn.disabled = true;

    const payload = selectedFiles.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        relativePath: file.webkitRelativePath || '',
        uri: `client://uploads/${file.webkitRelativePath || file.name}`
    }));

    console.log('Upload JSON Payload:', JSON.stringify(payload, null, 2));

    const uploadResults = document.getElementById('uploadResults');
    const uploadResultsList = document.getElementById('uploadResultsList');

    uploadResultsList.innerHTML = '';

    // STUB: simulate per-file success
    selectedFiles.forEach(file => {
        const row = document.createElement('div');
        row.className = 'upload-result-item';

        row.innerHTML = `
            <div class="checkmark">✓</div>
            <div>
                <strong>${file.name}</strong><br>
                File successfully uploaded
            </div>
        `;

        uploadResultsList.appendChild(row);
    });

    uploadResults.classList.add('success');
	selectedFiles = [];
	render();
});


 