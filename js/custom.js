 /* ================= OAUTH ================= */
    const clientId = "a08af3d6-15a6-48a2-b7fd-77885633cfbe";
    const environment = "usw2.pure.cloud";
    const redirectUri = window.location.origin + window.location.pathname;

    /* ================= HANDLE CALLBACK ================= */
    if (window.location.hash.includes('access_token')) {
        const params = new URLSearchParams(window.location.hash.substring(1));
        const token = params.get('access_token');
        const expiresIn = params.get('expires_in');

        if (token) {
            sessionStorage.setItem('access_token', token);
            if (expiresIn) {
                sessionStorage.setItem(
                    'token_expiry',
                    Date.now() + (parseInt(expiresIn, 10) * 1000)
                );
            }
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    const token = sessionStorage.getItem('access_token');
    const expiry = sessionStorage.getItem('token_expiry');
    function isAuthenticated() {
        const token = sessionStorage.getItem('access_token');
        const expiry = sessionStorage.getItem('token_expiry');

        return token && (!expiry || Date.now() < parseInt(expiry, 10));
    }
    function updateAuthUI() {
        if (isAuthenticated()) {
            loginContainer.style.display = 'none';
            appContainer.style.display = 'block';
        } else {
            loginContainer.style.display = 'flex';
            appContainer.style.display = 'none';
        }
    }
    updateAuthUI();

    const authButton = document.getElementById('authButton');

    function renderAuthButton() {
        if (isAuthenticated()) {
            authButton.textContent = 'Logout';
            authButton.className = 'auth-button logout';
            authButton.onclick = () => {
                sessionStorage.removeItem('access_token');
                sessionStorage.removeItem('token_expiry');
                updateAuthUI();
                renderAuthButton();
            };
        } else {
            authButton.textContent = 'Login';
            authButton.className = 'auth-button login';
            authButton.onclick = login;
        }
    }

renderAuthButton();
updateAuthUI();
    /* ================= UPLOAD LOGIC ================= */
    const fileInput = document.getElementById('fileInput');
    const browseFilesLink = document.getElementById('browseFilesLink');
    const dropZone = document.getElementById('dropZone');
    const fileListDiv = document.getElementById('fileList');
    const uploadBtn = document.getElementById('uploadBtn');
    const fileCount = document.getElementById('fileCount');

    let selectedFiles = [];

    browseFilesLink.onclick = () => fileInput.click();
    fileInput.onchange = e => handleFiles(e.target.files);

    dropZone.ondragover = e => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    };

    dropZone.ondragleave = () => dropZone.classList.remove('dragover');

    dropZone.ondrop = e => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    };

    function handleFiles(files) {
        Array.from(files).forEach(file => {
            if (!selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
                selectedFiles.push(file);
            }
        });
        fileInput.value = '';
        render();
    }

    function removeFile(index) {
        selectedFiles.splice(index, 1);
        render();
    }

    function render() {
        fileCount.textContent = `${selectedFiles.length} files`;
        uploadBtn.disabled = selectedFiles.length === 0;

        if (selectedFiles.length === 0) {
            fileListDiv.innerHTML = '<p>No files selected.</p>';
            return;
        }

        fileListDiv.innerHTML = selectedFiles.map((file, i) => `
            <div class="file-item">
                <span><strong>${file.name}</strong></span>
                <button onclick="removeFile(${i})">Remove</button>
            </div>
        `).join('');
    }

    uploadBtn.onclick = () => {
        uploadBtn.disabled = true;

        const results = document.getElementById('uploadResults');
        const list = document.getElementById('uploadResultsList');
        list.innerHTML = '';

        selectedFiles.forEach(file => {
            list.innerHTML += `
                <div class="upload-result-item">
                    <div class="checkmark">✓</div>
                    <div>
                        <strong>${file.name}</strong><br>
                        File successfully uploaded
                    </div>
                </div>
            `;
        });

        results.classList.add('success');
        selectedFiles = [];
        render();
    };

    render();


