document.addEventListener('DOMContentLoaded', () => {
    // --- Constants ---
    const API_BASE_URL = '/api';

    const body = document.body;
    const themeToggleIcon = document.getElementById('theme-toggle-icon');
    const savedTheme = localStorage.getItem('theme');

    // --- UI Elements ---
    const openTransferModalBtn = document.getElementById('open-transfer-modal-btn');
    const openPhaseoutModalBtn = document.getElementById('open-phaseout-modal-btn');
    const requestModalContainer = document.getElementById('request-modal-container');
    const closeRequestModalBtn = document.getElementById('close-request-modal');
    const requestModalTitle = document.getElementById('request-modal-title');
    const searchInput = document.getElementById('search-input');
    const sendRequestBtn = document.getElementById('send-request-btn');
    const searchResultsTableBody = document.getElementById('search-results-table-body');
    const tableHeadersRow = document.getElementById('table-headers-row');
    const sectorModalContainer = document.getElementById('sector-modal-container');
    const closeSectorModalBtn = document.getElementById('close-sector-modal');
    const productInfoDetails = document.getElementById('product-info-details');
    const okSectorBtn = document.getElementById('ok-sector-btn');
    const phaseoutInfoModalContainer = document.getElementById('phaseout-info-modal-container');
    const closePhaseoutInfoModalBtn = document.getElementById('close-phaseout-info-modal');
    const phaseoutInfoDetails = document.getElementById('phaseout-info-details');
    const okPhaseoutBtn = document.getElementById('ok-phaseout-btn');
    const openSuggestionIcon = document.getElementById('open-suggestion-icon');
    const suggestionModalContainer = document.getElementById('suggestion-modal-container');
    const closeSuggestionModalBtn = document.getElementById('close-suggestion-modal');
    const suggestionForm = document.getElementById('suggestion-form');
    const openChatIcon = document.getElementById('open-chat-icon');
    const chatModalContainer = document.getElementById('chat-modal-container');
    const closeChatModalBtn = document.getElementById('close-chat-modal');
    const okChatBtn = document.getElementById('ok-chat-btn');

    // --- Global Data Storage ---
    let allTransferenciaData = [];
    let allPhaseoutData = [];
    let currentMode = ''; // 'transferencia' or 'phaseout'

    // --- Theme Management ---
    function setTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            themeToggleIcon.textContent = '🌙';
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark-mode');
            themeToggleIcon.textContent = '☀️';
            localStorage.setItem('theme', 'light');
        }
    }

    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        // Define 'dark' como o tema padrão na primeira visita
        setTheme('dark'); 
    }

    themeToggleIcon.addEventListener('click', () => {
        const currentTheme = localStorage.getItem('theme') || 'dark';
        setTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });

    // --- Helper Functions ---
    function openModal(modal) {
        modal.classList.add('active');
    }

    function closeModal(modal) {
        modal.classList.remove('active');
    }

    // --- Fetch Data Functions ---
    async function fetchAllData() {
        try {
            const [transferenciaResponse, phaseoutResponse] = await Promise.all([
                fetch(`${API_BASE_URL}/transferencia`),
                fetch(`${API_BASE_URL}/phaseout`)
            ]);

            if (!transferenciaResponse.ok) throw new Error(`HTTP error! Transferencia status: ${transferenciaResponse.status}`);
            if (!phaseoutResponse.ok) throw new Error(`HTTP error! Phaseout status: ${phaseoutResponse.status}`);

            allTransferenciaData = await transferenciaResponse.json();
            allPhaseoutData = await phaseoutResponse.json();
            console.log('✅ Dados de Transferência e Phaseout carregados com sucesso.');
        } catch (error) {
            console.error('Erro ao buscar todos os dados:', error);
            alert('Não foi possível carregar os dados do servidor. Verifique o console para mais detalhes.');
        }
    }

    // --- Render Table Functions ---
    function renderTransferenciaTable(data) {
        searchResultsTableBody.innerHTML = '';
        tableHeadersRow.innerHTML = `
            <th>Segmento</th>
            <th>Produto</th>
            <th>Blip (chat)</th>
            <th>Telefone</th>
        `;

        if (data.length === 0) {
            searchResultsTableBody.innerHTML = '<tr><td colspan="5">Nenhum produto de transferência encontrado.</td></tr>';
            return;
        }

        data.sort((a, b) => (a.produto || '').localeCompare(b.produto || ''));

        data.forEach(item => {
            const row = document.createElement('tr');
            row.dataset.itemData = JSON.stringify(item);
            row.innerHTML = `
                <td>${item.segmento || ''}</td>
                <td>${item.produto || ''}</td>
                <td>${item.transferencia_chat || ''}</td>
                <td>${item.transferencia_telefone || ''}</td>
            `;
            searchResultsTableBody.appendChild(row);
        });
    }

function renderPhaseoutTable(data) {
    searchResultsTableBody.innerHTML = '';
    tableHeadersRow.innerHTML = `
        <th>Unidade</th>
        <th>Segmento</th>
        <th>Descrição</th>
        <th>Modelo</th>
        <th>Data Phase Out</th>
        <th>Subst. Direto</th>
        <th>Subst. Indireto</th>`;

    if (data.length === 0) {
        // CORREÇÃO: colspan deve ser 10 para todas as colunas
        searchResultsTableBody.innerHTML = '<tr><td colspan="10">Nenhum produto de phaseout encontrado.</td></tr>';
        return;
    }

    data.forEach(item => {
        const row = document.createElement('tr');
        row.dataset.itemData = JSON.stringify(item);
        row.innerHTML = `
            <td>${item.unidade || ''}</td>
            <td>${item.segmento || ''}</td>
            <td>${item.descricao || ''}</td>
            <td>${item.modelo || ''}</td>
            <td>${item.data_phase_out || ''}</td>
            <td>${item.descricao_subs_dir || ''}</td>
            <td>${item.descricao_subs_ind || ''}</td>
        `;
        searchResultsTableBody.appendChild(row);
    });
}

    // --- Lógica de busca ---
    function performSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        if (searchTerm === '') {
            if (currentMode === 'transferencia') {
                searchResultsTableBody.innerHTML = '<tr><td colspan="5">Digite para pesquisar.</td></tr>';
            } else if (currentMode === 'phaseout') {
                searchResultsTableBody.innerHTML = '<tr><td colspan="6">Digite para pesquisar.</td></tr>';
            }
            return;
        }

        if (currentMode === 'transferencia') {
            const filtered = allTransferenciaData.filter(item =>
                (item.produto && item.produto.toLowerCase().includes(searchTerm)) ||
                (item.codigo && item.codigo.toLowerCase().includes(searchTerm)) ||
                (item.segmento && item.segmento.toLowerCase().includes(searchTerm))
            );
            renderTransferenciaTable(filtered);
        } else if (currentMode === 'phaseout') {
            const filtered = allPhaseoutData.filter(item =>
                (item.item && item.item.toLowerCase().includes(searchTerm)) ||
                (item.descricao && item.descricao.toLowerCase().includes(searchTerm)) ||
                (item.modelo && item.modelo.toLowerCase().includes(searchTerm)) 
            );
            renderPhaseoutTable(filtered);
        }
    }

    // --- Display Detail Modals ---
    function displayTransferenciaDetails(item) {
        productInfoDetails.innerHTML = `
            <div class="product-detail-item"><strong>Segmento:</strong> <span>${item.segmento || 'N/A'}</span></div>
            <div class="product-detail-item"><strong>Produto:</strong> <span>${item.produto || ''}</span></div>
            <div class="product-detail-item">
                <div><strong>Blip (Filas):</strong> <span>${item.transferencia_chat || ''}</span></div>
                <button class="copy-button" data-text="${item.transferencia_chat || ''}">COPIAR</button>
            </div>
            <div class="product-detail-item">
                <div><strong>Telefone:</strong> <span>${item.transferencia_telefone || ''}</span></div>
                <button class="copy-button" data-text="${item.transferencia_telefone || ''}">COPIAR</button>
            </div>
        `;
        openModal(sectorModalContainer);
        sectorModalContainer.querySelectorAll('.copy-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const textToCopy = e.target.dataset.text;
                navigator.clipboard.writeText(textToCopy).then(() => {
                    const originalText = e.target.textContent;
                    e.target.textContent = 'COPIADO!';
                    setTimeout(() => e.target.textContent = originalText, 1500);
                }).catch(err => console.error('Falha ao copiar:', err));
            });
        });
    }

    function displayPhaseoutDetails(item) {
        phaseoutInfoDetails.innerHTML = `
            <div class="phaseout-detail-item"><strong>Unidade:</strong> <span>${item.unidade || ''}</span></div>
            <div class="phaseout-detail-item"><strong>Segmento:</strong> <span>${item.segmento || ''}</span></div>
            <div class="phaseout-detail-item"><strong>Descrição:</strong> <span>${item.descricao || ''}</span></div>
            <div class="phaseout-detail-item"><strong>Modelo:</strong> <span>${item.modelo || ''}</span></div>
            <div class="phaseout-detail-item"><strong>Data Phase Out:</strong> <span>${item.data_phase_out || ''}</span></div>
            <div class="phaseout-detail-item"><strong>Substituto Direto:</strong> <span>${item.descricao_subs_dir || ''}</span></div>
            <div class="phaseout-detail-item"><strong>Substituto Indicação:</strong> <span>${item.descricao_subs_ind || ''}</span></div>
        `;
        openModal(phaseoutInfoModalContainer);
    }

    // --- Event Listeners ---
    openTransferModalBtn.addEventListener('click', () => {
        currentMode = 'transferencia';
        requestModalTitle.textContent = 'Pesquisar Produto para Transferência';
        searchInput.placeholder = 'Digite o nome ou segmento...';
        searchInput.value = '';
        renderTransferenciaTable([]);
        searchResultsTableBody.innerHTML = '<tr><td colspan="5">Digite para pesquisar.</td></tr>';
        openModal(requestModalContainer);
    });

openPhaseoutModalBtn.addEventListener('click', () => {
    currentMode = 'phaseout';
    requestModalTitle.textContent = 'Pesquisar Phase Out';
    searchInput.placeholder = 'Digite o Item, Descrição ou Modelo...';
    searchInput.value = '';
    renderPhaseoutTable([]);
    // CORREÇÃO: colspan deve ser 10
    searchResultsTableBody.innerHTML = '<tr><td colspan="10">Digite para pesquisar.</td></tr>';
    openModal(requestModalContainer);
});

    sendRequestBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    searchResultsTableBody.addEventListener('click', (event) => {
        const row = event.target.closest('tr');
        if (!row || !row.dataset.itemData) return;

        const selectedItem = JSON.parse(row.dataset.itemData);
        closeModal(requestModalContainer);
        if (currentMode === 'transferencia') {
            displayTransferenciaDetails(selectedItem);
        } else if (currentMode === 'phaseout') {
            displayPhaseoutDetails(selectedItem);
        }
    });

    // Close modals
    [closeRequestModalBtn, okSectorBtn, closeSectorModalBtn, closePhaseoutInfoModalBtn, okPhaseoutBtn, closeSuggestionModalBtn, closeChatModalBtn, okChatBtn].forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(btn.closest('.modal-container'));
        });
    });

    // Open other modals
    openSuggestionIcon.addEventListener('click', () => openModal(suggestionModalContainer));
    openChatIcon.addEventListener('click', () => openModal(chatModalContainer));
    
    // Close modal by clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-container')) {
            closeModal(e.target);
        }
    });

    if (suggestionForm) {
        suggestionForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            try {
                const response = await fetch(form.action, {
                    method: form.method,
                    body: new FormData(form),
                    headers: { 'Accept': 'application/json' }
                });
                if (response.ok) {
                    alert('Sugestão enviada com sucesso!');
                    form.reset();
                    closeModal(suggestionModalContainer);
                } else {
                    alert('Houve um erro ao enviar sua sugestão.');
                }
            } catch (error) {
                alert('Erro de conexão ao enviar sugestão.');
            }
        });
    }

    fetchAllData();
});
