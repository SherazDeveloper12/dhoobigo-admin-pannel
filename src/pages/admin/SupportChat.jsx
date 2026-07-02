import React, { useEffect, useState, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { SOCKET_URL } from '../../services/api';
import { Send, User, Shield, MessageSquare } from 'lucide-react';

const SupportChat = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('group') || 'Global';
  });
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const connection = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch groups and history initially
  useEffect(() => {
    const fetchData = async () => {
      try {
        const groupsRes = await api.get('/chat/active-groups');
        setGroups(groupsRes.data);
        
        const historyRes = await api.get(`/chat/history/${selectedGroup}`);
        setMessages(historyRes.data);
        setIsLoading(false);
      } catch (err) {
        console.error('Fetch Error:', err);
      }
    };
    fetchData();
  }, [selectedGroup]);

  useEffect(() => {
    connection.current = new signalR.HubConnectionBuilder()
      .withUrl(`${SOCKET_URL}/chatHub`)
      .withAutomaticReconnect()
      .build();

    connection.current.on('ReceiveMessage', (user, message) => {
      // Real-time update logic: only append if group matches (Simplified for now)
      setMessages((prev) => [...prev, { senderName: user, message, timestamp: new Date().toISOString() }]);
    });

    connection.current.start()
      .then(() => {
        console.log('Admin SignalR Connected');
        connection.current.invoke('JoinGroup', selectedGroup);
      })
      .catch((err) => console.error('SignalR Error:', err));

    return () => {
      if (connection.current) {
        connection.current.stop();
      }
    };
  }, [selectedGroup]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !connection.current) return;

    try {
      await connection.current.invoke('SendMessageToGroup', selectedGroup, 'Admin', input.trim());
      setInput('');
    } catch (err) {
      console.error('Send Error:', err);
    }
  };

  return (
    <div className="page animate-fade">
      <div className="page-header">
        <div>
          <h1 className="page-title">Support & Dispute Center</h1>
          <p className="page-subtitle">Monitor activities and resolve user disputes in real-time.</p>
        </div>
      </div>

      <div className="chat-layout panel">
        {/* Sidebar */}
        <div className="chat-sidebar">
          <div className="sidebar-header">
            <MessageSquare size={16} />
            <span>Active Conversations</span>
          </div>
          <div className="group-list">
            <div 
              className={`group-item ${selectedGroup === 'Global' ? 'active' : ''}`}
              onClick={() => setSelectedGroup('Global')}
            >
              <Shield size={16} />
              <div className="group-info">
                <p className="group-name">Global Support</p>
                <p className="group-meta">Live Channel</p>
              </div>
            </div>
            {groups.filter(g => g.groupName !== 'Global').map((group) => (
              <div 
                key={group.groupName}
                className={`group-item ${selectedGroup === group.groupName ? 'active' : ''}`}
                onClick={() => setSelectedGroup(group.groupName)}
              >
                <User size={16} />
                <div className="group-info">
                  <p className="group-name">Order #{group.groupName}</p>
                  <p className="group-meta">{group.messageCount} messages</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-main">
          <div className="chat-header">
            <h3>{selectedGroup === 'Global' ? 'Global Support Channel' : `Dispute Resolution: Order #${selectedGroup}`}</h3>
          </div>
          <div className="chat-messages">
            {messages.length === 0 ? (
              <div className="empty-chat">
                <MessageSquare size={48} color="var(--text-3)" />
                <p>No messages in this channel yet.</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`chat-bubble ${msg.senderName === 'Admin' ? 'me' : 'other'}`}>
                  <div className="bubble-header">
                    <span className="user-name">{msg.senderName}</span>
                    <span className="time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="bubble-content">{msg.message}</div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="chat-input-area" onSubmit={sendMessage}>
            <input
              type="text"
              placeholder={`Message to ${selectedGroup}...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" className="btn-primary" disabled={!input.trim()}>
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .chat-layout {
          height: calc(100vh - 220px);
          display: flex;
          padding: 0;
          overflow: hidden;
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
        }
        .chat-sidebar {
          width: 280px;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          background: #f8fafc;
        }
        .sidebar-header {
          padding: 20px;
          font-weight: 700;
          font-size: 0.85rem;
          text-transform: uppercase;
          color: var(--text-2);
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid #e2e8f0;
        }
        .group-list {
          flex: 1;
          overflow-y: auto;
        }
        .group-item {
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s;
          border-bottom: 1px solid rgba(0,0,0,0.03);
        }
        .group-item:hover {
          background: #f1f5f9;
        }
        .group-item.active {
          background: #fff;
          border-left: 4px solid var(--primary);
        }
        .group-name {
          font-size: 0.9rem;
          font-weight: 600;
          margin: 0;
          color: var(--text-1);
        }
        .group-meta {
          font-size: 0.75rem;
          color: var(--text-3);
          margin: 4px 0 0 0;
        }
        .chat-main {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .chat-header {
          padding: 16px 24px;
          border-bottom: 1px solid #e2e8f0;
          background: #fff;
        }
        .chat-header h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-1);
        }
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: #f1f5f9;
        }
        .chat-bubble {
          max-width: 70%;
          padding: 12px 16px;
          border-radius: 12px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        .chat-bubble.me {
          align-self: flex-end;
          background: var(--primary);
          color: white;
          border-bottom-right-radius: 2px;
        }
        .chat-bubble.other {
          align-self: flex-start;
          background: white;
          color: var(--text-1);
          border-bottom-left-radius: 2px;
          border: 1px solid #e2e8f0;
        }
        .bubble-header {
          display: flex;
          justify-content: space-between;
          font-size: 0.7rem;
          margin-bottom: 4px;
          font-weight: 600;
        }
        .chat-bubble.me .bubble-header { color: rgba(255,255,255,0.8); }
        .chat-bubble.other .bubble-header { color: var(--text-3); }
        .bubble-content {
          font-size: 0.9rem;
          line-height: 1.5;
        }
        .chat-input-area {
          padding: 16px 24px;
          background: white;
          border-top: 1px solid #e2e8f0;
          display: flex;
          gap: 12px;
        }
        .chat-input-area input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          outline: none;
        }
        .chat-input-area input:focus {
          border-color: var(--primary);
          box-shadow: 0 0 0 2px rgba(10, 132, 255, 0.1);
        }
      `}</style>
    </div>
  );
};

export default SupportChat;
