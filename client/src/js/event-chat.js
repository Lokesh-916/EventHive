// ============================================================
// EVENT CHAT FEATURE
// ============================================================

class EventChat {
  constructor() {
    this.token = sessionStorage.getItem('token');
    this.currentUserId = null;
    this.eventId = null;
    this.pollInterval = null;
    this.isMinimized = false;
    this.isFullscreen = false;
    this.participants = null;
    
    this.init();
  }

  async init() {
    if (!this.token) return;
    
    // Get event ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    this.eventId = urlParams.get('id');
    
    if (!this.eventId) return;
    
    try {
      // Get current user info
      const response = await fetch('/api/auth/profile', {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.currentUserId = data.data._id;
        
        // Show FAB and setup event listeners
        this.setupEventListeners();
        this.showFAB();
        this.loadUnreadCount();
        
        // Poll for unread count every 15s
        setInterval(() => this.loadUnreadCount(), 15000);
      }
    } catch (error) {
      console.error('Failed to initialize event chat:', error);
    }
  }

  setupEventListeners() {
    // FAB click
    document.getElementById('event-chat-fab')?.addEventListener('click', () => this.openChat());
    
    // Window controls
    document.getElementById('event-chat-close-btn')?.addEventListener('click', () => this.closeChat());
    document.getElementById('event-chat-minimize-btn')?.addEventListener('click', () => this.minimizeChat());
    document.getElementById('event-chat-fullscreen-btn')?.addEventListener('click', () => this.toggleFullscreen());
    
    // Header toggle (for minimize/restore)
    document.getElementById('event-chat-header-toggle')?.addEventListener('click', (e) => {
      if (!e.target.closest('.event-chat-header-btn') && this.isMinimized) {
        this.restoreChat();
      }
    });
    
    // Send message
    document.getElementById('event-chat-send-btn')?.addEventListener('click', () => this.sendMessage());
    document.getElementById('event-chat-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
    
    // Auto-resize textarea
    document.getElementById('event-chat-input')?.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 100) + 'px';
    });
  }

  showFAB() {
    const fab = document.getElementById('event-chat-fab');
    if (fab) fab.style.display = 'flex';
  }

  hideFAB() {
    const fab = document.getElementById('event-chat-fab');
    if (fab) fab.style.display = 'none';
  }

  async loadUnreadCount() {
    if (!this.token || !this.eventId) return;
    
    try {
      const response = await fetch(`/api/chat/event/${this.eventId}/unread-count`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const badge = document.getElementById('event-chat-fab-badge');
        
        if (data.success && data.count > 0) {
          badge.textContent = data.count > 9 ? '9+' : data.count;
          badge.style.display = 'flex';
        } else {
          badge.style.display = 'none';
        }
      }
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  }

  openChat() {
    if (!this.token) {
      alert('Please log in to use event chat.');
      return;
    }
    
    this.showChatWindow();
    this.loadParticipants();
    this.loadMessages();
  }

  showChatWindow() {
    const window = document.getElementById('event-chat-window');
    if (window) {
      window.classList.remove('hidden-chat', 'minimized');
      this.isMinimized = false;
      this.hideFAB();
      
      const body = document.getElementById('event-chat-body');
      if (body) body.style.display = 'flex';
    }
  }

  closeChat() {
    const window = document.getElementById('event-chat-window');
    if (window) {
      window.classList.add('hidden-chat');
      this.isMinimized = false;
      this.isFullscreen = false;
      this.showFAB();
      
      if (this.pollInterval) {
        clearInterval(this.pollInterval);
        this.pollInterval = null;
      }
    }
  }

  minimizeChat() {
    const window = document.getElementById('event-chat-window');
    if (window) {
      window.classList.add('minimized');
      window.classList.remove('fullscreen');
      this.isMinimized = true;
      this.isFullscreen = false;
      
      const body = document.getElementById('event-chat-body');
      if (body) body.style.display = 'none';
    }
  }

  restoreChat() {
    const window = document.getElementById('event-chat-window');
    if (window) {
      window.classList.remove('minimized');
      this.isMinimized = false;
      
      const body = document.getElementById('event-chat-body');
      if (body) body.style.display = 'flex';
    }
  }

  toggleFullscreen() {
    const window = document.getElementById('event-chat-window');
    if (!window) return;
    
    if (this.isFullscreen) {
      window.classList.remove('fullscreen');
      this.isFullscreen = false;
    } else {
      window.classList.add('fullscreen');
      window.classList.remove('minimized');
      this.isFullscreen = true;
      this.isMinimized = false;
      
      const body = document.getElementById('event-chat-body');
      if (body) body.style.display = 'flex';
    }
  }

  async loadParticipants() {
    if (!this.token || !this.eventId) return;
    
    try {
      const response = await fetch(`/api/chat/event/${this.eventId}/participants`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          this.participants = data.data;
          this.renderParticipants(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to load participants:', error);
    }
  }

  renderParticipants(data) {
    const sidebar = document.getElementById('event-chat-sidebar');
    if (!sidebar || !data) return;

    let html = '';
    
    // Organizer
    if (data.organizer) {
      const org = data.organizer;
      const initials = (org.fullName || org.username || 'O')
        .split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
      
      const avatarHtml = org.profilePic 
        ? `<img src="${org.profilePic}" alt="${org.fullName || org.username}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
        : initials;
      
      html += `
        <div class="event-chat-role-group">
          <div class="event-chat-role-title">Organizer</div>
          <div class="event-chat-participant organizer">
            <div class="event-chat-participant-avatar">${avatarHtml}</div>
            <div class="event-chat-participant-name">${org.fullName || org.username}</div>
          </div>
        </div>
      `;
    }

    // Volunteer groups
    if (data.volunteerGroups && Object.keys(data.volunteerGroups).length > 0) {
      Object.entries(data.volunteerGroups).forEach(([roleName, volunteers]) => {
        html += `
          <div class="event-chat-role-group">
            <div class="event-chat-role-title">${roleName}</div>
        `;
        
        volunteers.forEach(vol => {
          const initials = (vol.fullName || vol.username || 'V')
            .split(' ')
            .map(w => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
          
          const avatarHtml = vol.profilePic 
            ? `<img src="${vol.profilePic}" alt="${vol.fullName || vol.username}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
            : initials;
          
          html += `
            <div class="event-chat-participant">
              <div class="event-chat-participant-avatar">${avatarHtml}</div>
              <div class="event-chat-participant-name">${vol.fullName || vol.username}</div>
            </div>
          `;
        });
        
        html += '</div>';
      });
    }

    sidebar.innerHTML = html;
  }

  async loadMessages() {
    if (!this.token || !this.eventId) return;
    
    try {
      const response = await fetch(`/api/chat/event/${this.eventId}/messages`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          this.renderMessages(data.data);
          
          // Start polling for new messages
          if (!this.pollInterval) {
            this.pollInterval = setInterval(() => this.loadMessages(), 3000);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }

  renderMessages(messages) {
    const container = document.getElementById('event-chat-messages');
    if (!container) return;

    if (!messages || messages.length === 0) {
      container.innerHTML = `
        <div class="event-chat-empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          <span>Start the conversation!</span>
        </div>
      `;
      return;
    }

    const html = messages.map(msg => {
      const sender = msg.senderId;
      const isSent = sender._id === this.currentUserId;
      const senderName = sender.profile?.fullName || sender.profile?.orgName || sender.username || 'Unknown';
      const time = new Date(msg.createdAt).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      return `
        <div class="event-chat-bubble ${isSent ? 'sent' : 'received'}">
          ${!isSent ? `<div class="event-chat-bubble-sender">${senderName}</div>` : ''}
          <div>${this.escapeHtml(msg.text)}</div>
          <div class="event-chat-bubble-time">${time}</div>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;
  }

  async sendMessage() {
    const input = document.getElementById('event-chat-input');
    if (!input) return;
    
    const text = input.value.trim();
    if (!text || !this.token || !this.eventId) return;

    const btn = document.getElementById('event-chat-send-btn');
    if (btn) btn.disabled = true;

    try {
      const response = await fetch(`/api/chat/event/${this.eventId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.token}`
        },
        body: JSON.stringify({ text })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          input.value = '';
          input.style.height = 'auto';
          this.loadMessages(); // Refresh messages
        } else {
          alert(data.error || 'Failed to send message');
        }
      } else {
        alert('Failed to send message');
      }
    } catch (error) {
      alert('Network error');
    } finally {
      if (btn) btn.disabled = false;
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize event chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.eventChat = new EventChat();
});

// Global function for backward compatibility
function openEventChat() {
  if (window.eventChat) {
    window.eventChat.openChat();
  }
}