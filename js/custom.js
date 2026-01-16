 /* ================= OAUTH ================= */
    const clientId = "a08af3d6-15a6-48a2-b7fd-77885633cfbe";
    const environment = "usw2.pure.cloud";
    const redirectUri = window.location.origin + window.location.pathname;
    const appContainer = document.getElementById('appContainer');

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

    function login() {
    const authUrl =
        `https://login.${environment}/oauth/authorize` +
        `?response_type=token` +
        `&client_id=${encodeURIComponent(clientId)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=architect%20users%20notifications`;

        window.location.href = authUrl;
    }

    function logout() {
    // Clear local app session
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('token_expiry');

    // Redirect to Genesys logout, then back to this app
        const returnUrl = encodeURIComponent(
            window.location.origin + window.location.pathname
        );
        window.location.href =
            `https://login.${environment}/logout?client_id=${clientId}&redirect_uri=${returnUrl}`;
        }

    const authButton = document.getElementById('authButton');

    function renderAuthButton() {
        if (isAuthenticated()) {
            authButton.innerHTML = `
            <img src="images/white-logout-vector.png" alt="Settings" style="width:20px; height:20px; vertical-align:middle; margin-right:6px">
            <span>Logout</span>
            `;
            authButton.className = 'auth-button logout';
            authButton.onclick = logout;

            appContainer.style.display = 'block';
        } else {
            authButton.innerHTML = `
            <img src="images/white-login-vector.png" alt="Settings" style="width:20px; height:20px; vertical-align:middle; margin-right:6px">
            <span>Login</span>
            `;
            authButton.className = 'auth-button login';
            authButton.onclick = login;

            appContainer.style.display = 'none';
        }
    }
    renderAuthButton();

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

/* Function to create a new knowledge Source in GC */
async function createKnowledgeSource() {
    const token = sessionStorage.getItem('access_token');

    if (!token) {
        throw new Error('Not authenticated');
    }

    const response = await fetch(
        'https://api.usw2.pure.cloud/api/v2/knowledge/sources',
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: 'API-Explorer Source',
                type: 'FileUpload',
                triggerType: 'Manual'
            })
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Create source failed: ${response.status} ${errorText}`);
    }

    return response.json();
}
/* function to create new knowledge synchronization session */

async function createSynchronizationSession(sourceId) {
    const token = sessionStorage.getItem('access_token');

    if (!token) {
        throw new Error('Not authenticated');
    }

    const response = await fetch(
        `https://api.usw2.pure.cloud/api/v2/knowledge/sources/${sourceId}/synchronizations`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Create synchronization failed: ${response.status} ${errorText}`);
    }

    return response.json();
}

/* hanlde upload button click */
uploadBtn.onclick = async () => {
    uploadBtn.disabled = true;

    try {
        // STEP 1: Create Knowledge Source
        const source = await createKnowledgeSource();
        console.log('Knowledge Source created:', source);

        // STEP 2: Create Synchronization Session
        const sync = await createSynchronizationSession(source.id);
        console.log('Synchronization session created:', sync);

        // TEMP: stub success UI (files not uploaded yet)
        const results = document.getElementById('uploadResults');
        const list = document.getElementById('uploadResultsList');
        list.innerHTML = '';

        selectedFiles.forEach(file => {
            list.innerHTML += `
                <div class="upload-result-item">
                    <div class="checkmark">✓</div>
                    <div>
                        <strong>${file.name}</strong><br>
                        Ready for upload (sync session created)
                    </div>
                </div>
            `;
        });

        results.classList.add('success');
        selectedFiles = [];
        render();

    } catch (err) {
        console.error(err);
        alert('Failed during knowledge synchronization setup');
        uploadBtn.disabled = false;
    }
};


    render();


















