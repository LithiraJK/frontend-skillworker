class ChatSystem {
    constructor() {
        this.stompClient = null;
        this.currentUser = null;
        this.selectedContact = null;
        this.isConnected = false;
        this.baseUrl = 'http://localhost:8080';
        this.contacts = [];
        this.messages = {};
        this.connectionRetries = 0;
        this.maxRetries = 3;
        this.reconnectTimeout = null;
        this.init();
    }

    init() {
        this.loadCurrentUser();
        this.bindEvents();
        this.setupErrorHandling();
    }

    loadCurrentUser() {
        try {
            const userId = $.cookie('userId');
            const userRole = $.cookie('user_role');
            const token = $.cookie('token');

            if (userId && token) {
                const tokenUser = this.extractUserFromToken(token);
                this.currentUser = {
                    id: userId,
                    name: tokenUser?.name || 'User',
                    email: tokenUser?.email || '',
                    role: userRole || 'user'
                };
            } else {
                // Generate temporary user for testing if no authentication
                this.currentUser = {
                    id: 'user_' + Date.now(),
                    name: 'Test User',
                    email: 'test@example.com',
                    role: 'guest'
                };
            }
            console.log('Current user loaded:', this.currentUser);
        } catch (error) {
            console.error('Error loading current user:', error);
            this.showError('Failed to load user information');
        }
    }

    extractUserFromToken(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return {
                id: payload.sub || payload.userId,
                name: payload.name || 'User',
                email: payload.email || ''
            };
        } catch (error) {
            console.error('Error extracting user from token:', error);
            return null;
        }
    }

    setupErrorHandling() {
        window.addEventListener('online', () => {
            console.log('Connection restored');
            this.showSuccess('Connection restored');
            if (!this.isConnected) {
                this.connectWebSocket();
            }
        });

        window.addEventListener('offline', () => {
            console.log('Connection lost');
            this.showError('Connection lost. Please check your internet connection.');
        });
    }

    bindEvents() {
        $(document).ready(() => {
            console.log('Chat system: Binding events...');

            $(document).on('click', '#contactsBtn', (e) => {
                e.preventDefault();
                console.log('Contacts button clicked!');
                this.openChatModal();
            });

            $(document).on('click', 'a', (e) => {
                if ($(e.target).text().trim() === 'Contacts' || $(e.target).closest('a').text().trim() === 'Contacts') {
                    e.preventDefault();
                    console.log('Contacts link clicked!');
                    this.openChatModal();
                }
            });

            $(document).on('keypress', '#messageInput', (e) => {
                if (e.which === 13) { 
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            console.log('Chat system: Events bound successfully');
        });
    }

    async openChatModal() {
        console.log('Opening chat modal...');

        try {
            const token = this.getAuthToken();
            if (!token) {
                console.error('No authentication token found');
                this.showError('Please login to access chat');
                return;
            }

            console.log('User authenticated, proceeding with chat modal');

            this.createChatModal();

            const modal = new bootstrap.Modal(document.getElementById('chatModal'));
            modal.show();

            console.log('Modal shown, starting connections...');

            this.showLoading('Connecting to chat service...');

            // Connect to WebSocket first
            await this.connectWebSocket();
            console.log('WebSocket connected successfully');

            // Then load contacts
            await this.loadContacts();
            console.log('Contacts loaded successfully');

            this.hideLoading();
            console.log('Chat modal opened successfully');

        } catch (error) {
            console.error('Error opening chat modal:', error);
            this.hideLoading();
            this.showError(`Failed to open chat: ${error.message}`);
        }
    }

    createChatModal() {
        // Remove existing modal if any
        const existingModal = document.getElementById('chatModal');
        if (existingModal) {
            existingModal.remove();
        }

        const modalHTML = `
            <div class="modal fade chat-modal" id="chatModal" tabindex="-1" aria-labelledby="chatModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="chatModalLabel">
                                <i class="fas fa-comments"></i>
                                Messages
                                <span id="connectionIndicator" class="badge bg-secondary ms-2">Connecting...</span>
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body p-0">
                            <div id="chatLoadingOverlay" class="position-absolute w-100 h-100 d-flex align-items-center justify-content-center bg-light bg-opacity-75" style="z-index: 1000; display: none !important;">
                                <div class="text-center">
                                    <div class="spinner-border text-primary" role="status"></div>
                                    <div class="mt-2">Loading...</div>
                                </div>
                            </div>
                            <div class="chat-container">
                                <!-- Contacts Sidebar -->
                                <div class="chat-contacts">
                                    <div class="contacts-header">
                                        <div class="contacts-search">
                                            <i class="fas fa-search"></i>
                                            <input type="text" id="contactSearch" placeholder="Search contacts..." />
                                        </div>
                                    </div>
                                    <div class="contacts-list" id="contactsList">
                                        <div class="text-center p-3">
                                            <i class="fas fa-spinner fa-spin"></i>
                                            <div>Loading contacts...</div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Chat Area -->
                                <div class="chat-area" id="chatArea">
                                    <div class="chat-empty">
                                        <i class="fas fa-comments"></i>
                                        <h5>Select a conversation</h5>
                                        <p>Choose a contact from the left to start messaging</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Bind modal events
        document.getElementById('contactSearch').addEventListener('input', (e) => {
            this.filterContacts(e.target.value);
        });

        // Handle modal close
        document.getElementById('chatModal').addEventListener('hidden.bs.modal', () => {
            this.disconnect();
        });
    }

    async connectWebSocket() {
        if (this.isConnected) return;

        try {
            this.updateConnectionStatus('Connecting...');

            const socket = new SockJS(`${this.baseUrl}/ws-chat`);
            this.stompClient = Stomp.over(socket);

            // Disable debug logging for cleaner console
            this.stompClient.debug = null;

            await new Promise((resolve, reject) => {
                this.stompClient.connect({}, (frame) => {
                    console.log('Connected to WebSocket:', frame);
                    this.isConnected = true;
                    this.connectionRetries = 0;
                    this.updateConnectionStatus('Connected');

                    // Subscribe to private messages
                    this.stompClient.subscribe(`/user/${this.currentUser.id}/queue/messages`, (message) => {
                        try {
                            this.handleIncomingMessage(JSON.parse(message.body));
                        } catch (error) {
                            console.error('Error handling incoming message:', error);
                        }
                    });

                    // Subscribe to error messages
                    this.stompClient.subscribe(`/user/${this.currentUser.id}/queue/errors`, (error) => {
                        try {
                            const errorMsg = JSON.parse(error.body);
                            this.showError(errorMsg.content);
                        } catch (e) {
                            console.error('Error handling error message:', e);
                        }
                    });

                    resolve();
                }, (error) => {
                    console.error('WebSocket connection error:', error);
                    this.isConnected = false;
                    this.updateConnectionStatus('Connection Failed');
                    this.handleConnectionError();
                    reject(error);
                });
            });
        } catch (error) {
            console.error('Failed to connect to WebSocket:', error);
            this.updateConnectionStatus('Connection Failed');
            this.handleConnectionError();
        }
    }

    handleConnectionError() {
        if (this.connectionRetries < this.maxRetries) {
            this.connectionRetries++;
            const retryDelay = Math.pow(2, this.connectionRetries) * 1000; // Exponential backoff

            this.showError(`Connection failed. Retrying in ${retryDelay/1000} seconds... (${this.connectionRetries}/${this.maxRetries})`);

            this.reconnectTimeout = setTimeout(() => {
                this.connectWebSocket();
            }, retryDelay);
        } else {
            this.showError('Failed to connect after multiple attempts. Please refresh the page.');
            this.updateConnectionStatus('Failed');
        }
    }

    updateConnectionStatus(status) {
        const indicator = document.getElementById('connectionIndicator');
        if (indicator) {
            indicator.textContent = status;
            indicator.className = 'badge ms-2 ' +
                (status === 'Connected' ? 'bg-success' :
                 status === 'Connecting...' ? 'bg-warning' : 'bg-danger');
        }
    }

    async loadContacts() {
        try {
            this.showLoading('Loading contacts...');

            // Get JWT token for authentication
            const token = this.getAuthToken();

            // First try to load from database using AJAX
            const contactIds = await new Promise((resolve, reject) => {
                $.ajax({
                    url: `${this.baseUrl}/api/chat/contacts/${this.currentUser.id}`,
                    type: 'GET',
                    dataType: 'json',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    success: function(data) {
                        resolve(data);
                    },
                    error: function(xhr, status, error) {
                        if (xhr.status === 401) {
                            reject(new Error('Authentication failed. Please login again.'));
                        } else {
                            reject(new Error(`HTTP ${xhr.status}: ${error}`));
                        }
                    }
                });
            });

            if (contactIds.length > 0) {
                // Convert contact IDs to contact objects with user info
                this.contacts = await this.enrichContactsWithUserInfo(contactIds);
            } else {
                // If no contacts from database, show sample contacts for testing
                this.contacts = await this.getSampleContacts();
            }

            this.renderContacts();
            this.hideLoading();
        } catch (error) {
            console.error('Error loading contacts:', error);
            this.hideLoading();

            if (error.message.includes('Authentication failed')) {
                this.showError('Please login again to access chat.');
                this.handleAuthError();
            } else {
                // Fallback to sample contacts
                this.contacts = await this.getSampleContacts();
                this.renderContacts();
                this.showError('Using sample contacts. Database connection may be unavailable.');
            }
        }
    }

    async enrichContactsWithUserInfo(contactIds) {
        // In a real application, you'd fetch user details from your user service
        // For now, create mock contact objects
        return contactIds.map(id => ({
            id: id,
            name: this.generateContactName(id),
            role: this.determineUserRole(id),
            status: Math.random() > 0.5 ? 'online' : 'offline'
        }));
    }

    generateContactName(id) {
        const names = ['John Smith', 'Sarah Johnson', 'Mike Wilson', 'Emma Davis', 'David Brown', 'Lisa Garcia'];
        return names[Math.abs(id.hashCode() % names.length)] || `User ${id.slice(-4)}`;
    }

    determineUserRole(id) {
        return id.startsWith('worker_') ? 'Worker' :
               id.startsWith('client_') ? 'Client' : 'User';
    }

    async getSampleContacts() {
        return [
            { id: 'worker_1', name: 'John Smith', role: 'Plumber', status: 'online' },
            { id: 'client_1', name: 'Sarah Johnson', role: 'Client', status: 'offline' },
            { id: 'worker_2', name: 'Mike Wilson', role: 'Electrician', status: 'online' },
            { id: 'client_2', name: 'Emma Davis', role: 'Client', status: 'online' },
            { id: 'worker_3', name: 'David Brown', role: 'Carpenter', status: 'online' },
            { id: 'client_3', name: 'Lisa Garcia', role: 'Client', status: 'offline' }
        ];
    }

    renderContacts() {
        const contactsList = document.getElementById('contactsList');

        if (this.contacts.length === 0) {
            contactsList.innerHTML = `
                <div class="text-center p-4">
                    <i class="fas fa-users text-muted" style="font-size: 2rem;"></i>
                    <h6 class="mt-2">No contacts yet</h6>
                    <p class="text-muted small">Start a conversation with workers or clients</p>
                    <button class="btn btn-sm btn-primary" onclick="chatSystem.loadSampleContacts()">
                        Load Sample Contacts
                    </button>
                </div>
            `;
            return;
        }

        const contactsHTML = this.contacts.map(contact => `
            <div class="contact-item" data-contact-id="${contact.id}" onclick="chatSystem.selectContact('${contact.id}')">
                <div class="contact-avatar">
                    ${contact.name.charAt(0).toUpperCase()}
                    ${contact.status === 'online' ? '<div class="online-indicator"></div>' : ''}
                </div>
                <div class="contact-info">
                    <div class="contact-name">${contact.name}</div>
                    <div class="contact-status">${contact.role || 'User'}</div>
                </div>
                <div class="contact-time">
                    <small class="text-muted">${this.getLastMessageTime(contact.id)}</small>
                </div>
            </div>
        `).join('');

        contactsList.innerHTML = contactsHTML;
    }

    async loadSampleContacts() {
        this.contacts = await this.getSampleContacts();
        this.renderContacts();
    }

    async selectContact(contactId) {
        try {
            this.showLoading('Loading conversation...');

            this.selectedContact = this.contacts.find(c => c.id === contactId);

            if (!this.selectedContact) {
                throw new Error('Contact not found');
            }

            // Update UI
            document.querySelectorAll('.contact-item').forEach(item => {
                item.classList.remove('active');
            });
            document.querySelector(`[data-contact-id="${contactId}"]`)?.classList.add('active');

            // Load and display chat
            await this.loadChatHistory(contactId);
            this.renderChatArea();

            this.hideLoading();
        } catch (error) {
            console.error('Error selecting contact:', error);
            this.hideLoading();
            this.showError('Failed to load conversation');
        }
    }

    async loadChatHistory(contactId) {
        try {
            const token = this.getAuthToken();

            const history = await new Promise((resolve, reject) => {
                $.ajax({
                    url: `${this.baseUrl}/api/chat/history/${this.currentUser.id}/${contactId}`,
                    type: 'GET',
                    dataType: 'json',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    success: function(data) {
                        resolve(data);
                    },
                    error: function(xhr, status, error) {
                        if (xhr.status === 404) {
                            resolve([]);
                        } else if (xhr.status === 401) {
                            reject(new Error('Authentication failed. Please login again.'));
                        } else {
                            reject(new Error(`HTTP ${xhr.status}: ${error}`));
                        }
                    }
                });
            });

            this.messages[contactId] = history;
            console.log(`Loaded ${history.length} messages for ${contactId}`);
        } catch (error) {
            console.error('Error loading chat history:', error);
            if (error.message.includes('Authentication failed')) {
                this.handleAuthError();
            }
            this.messages[contactId] = [];
            this.showError('Failed to load chat history');
        }
    }

    async clearChat(contactId) {
        try {
            if (!confirm('Are you sure you want to clear this chat history?')) {
                return;
            }

            this.showLoading('Clearing chat...');
            const token = this.getAuthToken();

            await new Promise((resolve, reject) => {
                $.ajax({
                    url: `${this.baseUrl}/api/chat/history/${this.currentUser.id}/${contactId}`,
                    type: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    success: function(data) {
                        resolve(data);
                    },
                    error: function(xhr, status, error) {
                        if (xhr.status === 401) {
                            reject(new Error('Authentication failed. Please login again.'));
                        } else {
                            reject(new Error(`HTTP ${xhr.status}: ${error}`));
                        }
                    }
                });
            });

            this.messages[contactId] = [];
            this.updateMessagesDisplay();
            this.showSuccess('Chat history cleared');
            this.hideLoading();
        } catch (error) {
            console.error('Error clearing chat:', error);
            this.hideLoading();
            if (error.message.includes('Authentication failed')) {
                this.showError('Please login again to clear chat history.');
                this.handleAuthError();
            } else {
                this.showError('Failed to clear chat history');
            }
        }
    }

    getAuthToken() {
        return $.cookie('token') || null;
    }

    getRefreshToken() {
        return $.cookie('refresh_token') || null;
    }

    async refreshAccessToken() {
        try {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await new Promise((resolve, reject) => {
                $.ajax({
                    url: `${this.baseUrl}/api/v1/auth/refresh`,
                    type: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${refreshToken}`
                    },
                    success: function(data) {
                        resolve(data);
                    },
                    error: function(xhr, status, error) {
                        reject(new Error(`HTTP ${xhr.status}: ${error}`));
                    }
                });
            });

            // Update cookies with new tokens
            if (response.token) {
                $.cookie('token', response.token, { path: '/' });
                console.log('Access token refreshed successfully');
            }
            if (response.refresh_token) {
                $.cookie('refresh_token', response.refresh_token, { path: '/' });
            }

            return response.token;
        } catch (error) {
            console.error('Failed to refresh access token:', error);
            throw error;
        }
    }

    handleAuthError() {
        this.refreshAccessToken()
            .then((newToken) => {
                console.log('Token refreshed successfully, retrying chat operation');
            })
            .catch(() => {
                $.removeCookie("token", { path: "/" });
                $.removeCookie("refresh_token", { path: "/" });
                $.removeCookie("user_role", { path: "/" });
                $.removeCookie("userId", { path: "/" });
                $.removeCookie("profile_complete", { path: "/" });

                if (typeof Swal !== 'undefined') {
                    Swal.fire({
                        icon: 'error',
                        title: 'Session Expired',
                        text: 'Please log in again.',
                        customClass: {
                            popup: "modern-swal-popup",
                            confirmButton: "modern-swal-confirm"
                        }
                    }).then(() => {
                        window.location.href = '/pages/login-page.html';
                    });
                } else {
                    alert('Session expired. Please log in again.');
                    window.location.href = '/pages/login-page.html';
                }
            });
    }

    renderChatArea() {
        const chatArea = document.getElementById('chatArea');
        if (!this.selectedContact) return;

        const chatHTML = `
            <div class="chat-header">
                <div class="chat-header-info">
                    <div class="chat-avatar">${this.selectedContact.name.charAt(0).toUpperCase()}</div>
                    <div class="chat-details">
                        <div class="chat-name">${this.selectedContact.name}</div>
                        <div class="chat-status">${this.selectedContact.status || 'offline'}</div>
                    </div>
                </div>
                <div class="chat-actions">
                    <button class="btn btn-sm btn-outline-danger" onclick="chatSystem.clearChat('${this.selectedContact.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="chat-messages" id="chatMessages">
                <!-- Messages will be rendered here -->
            </div>
            <div class="chat-input">
                <div class="input-group">
                    <input type="text" id="messageInput" class="form-control" placeholder="Type a message..." />
                    <button class="btn btn-primary" onclick="chatSystem.sendMessage()">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;

        chatArea.innerHTML = chatHTML;
        this.updateMessagesDisplay();

        const messageInput = document.getElementById('messageInput');
        messageInput.focus();
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.sendMessage();
            }
        });
    }

    updateMessagesDisplay() {
        const messagesContainer = document.getElementById('chatMessages');
        if (!messagesContainer || !this.selectedContact) return;

        const messages = this.messages[this.selectedContact.id] || [];

        if (messages.length === 0) {
            messagesContainer.innerHTML = `
                <div class="no-messages">
                    <i class="fas fa-comments"></i>
                    <p>No messages yet. Start the conversation!</p>
                </div>
            `;
            return;
        }

        const messagesHTML = messages.map(msg => `
            <div class="message ${msg.sender === this.currentUser.id ? 'sent' : 'received'}">
                <div class="message-content">${this.escapeHtml(msg.content)}</div>
                <div class="message-time">${this.formatMessageTime(msg.timestamp)}</div>
            </div>
        `).join('');

        messagesContainer.innerHTML = messagesHTML;
        this.scrollToBottom();
    }

    sendMessage() {
        const messageInput = document.getElementById('messageInput');
        if (!messageInput || !this.selectedContact || !this.isConnected) {
            console.error('Cannot send message: missing requirements');
            return;
        }

        const content = messageInput.value.trim();
        if (!content) return;

        const message = {
            sender: this.currentUser.id,
            receiver: this.selectedContact.id,
            content: content,
            timestamp: String(Date.now())
        };

        try {
            // Send via WebSocket
            this.stompClient.send('/app/chat.private', {}, JSON.stringify(message));

            // Clear input
            messageInput.value = '';

            // Add to local messages immediately for better UX
            if (!this.messages[this.selectedContact.id]) {
                this.messages[this.selectedContact.id] = [];
            }
            this.messages[this.selectedContact.id].push(message);
            this.updateMessagesDisplay();

            console.log('Message sent successfully');
        } catch (error) {
            console.error('Error sending message:', error);
            this.showError('Failed to send message. Please try again.');
        }
    }

    handleIncomingMessage(message) {
        console.log('Received message:', message);

        const conversationId = message.sender === this.currentUser.id ?
            message.receiver : message.sender;

        if (!this.messages[conversationId]) {
            this.messages[conversationId] = [];
        }

        this.messages[conversationId].push(message);

        if (this.selectedContact && this.selectedContact.id === conversationId) {
            this.updateMessagesDisplay();
        }

        if (message.sender !== this.currentUser.id) {
            this.showNotification(`New message from ${this.getContactName(message.sender)}`);
        }
    }

    getContactName(contactId) {
        const contact = this.contacts.find(c => c.id === contactId);
        return contact ? contact.name : contactId;
    }

    getLastMessageTime(contactId) {
        const messages = this.messages[contactId];
        if (!messages || messages.length === 0) return '';

        const lastMessage = messages[messages.length - 1];
        return this.formatMessageTime(lastMessage.timestamp);
    }

    formatMessageTime(timestamp) {
        try {
            const date = new Date(parseInt(timestamp));
            const now = new Date();
            const diffInHours = (now - date) / (1000 * 60 * 60);

            if (diffInHours < 24) {
                return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else {
                return date.toLocaleDateString();
            }
        } catch (error) {
            return '';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatMessages');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    filterContacts(searchTerm) {
        const contactItems = document.querySelectorAll('.contact-item');
        contactItems.forEach(item => {
            const contactName = item.querySelector('.contact-name').textContent.toLowerCase();
            const isVisible = contactName.includes(searchTerm.toLowerCase());
            item.style.display = isVisible ? 'flex' : 'none';
        });
    }

    showLoading(message = 'Loading...') {
        const overlay = document.getElementById('chatLoadingOverlay');
        if (overlay) {
            overlay.querySelector('.mt-2').textContent = message;
            overlay.style.display = 'flex';
        }
    }

    hideLoading() {
        const overlay = document.getElementById('chatLoadingOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    showError(message) {
        console.error('Chat Error:', message);
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'error',
                title: 'Chat Error',
                text: message,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        } else {
            alert('Error: ' + message);
        }
    }

    showSuccess(message) {
        console.log('Chat Success:', message);
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: message,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        }
    }

    showNotification(message) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'info',
                title: 'New Message',
                text: message,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000
            });
        }
    }

    disconnect() {
        if (this.stompClient && this.isConnected) {
            this.stompClient.disconnect();
            this.isConnected = false;
            this.updateConnectionStatus('Disconnected');
            console.log('Disconnected from WebSocket');
        }

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
    }
}

if (!String.prototype.hashCode) {
    String.prototype.hashCode = function() {
        let hash = 0;
        if (this.length === 0) return hash;
        for (let i = 0; i < this.length; i++) {
            const char = this.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash;
    };
}

$(document).ready(() => {
    console.log('Initializing Chat System...');
    window.chatSystem = new ChatSystem();
    console.log('Chat System initialized successfully');
});
