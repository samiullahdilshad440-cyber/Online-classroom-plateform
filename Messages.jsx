import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

const Messages = () => {
  const { withUserId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [recipient, setRecipient] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (withUserId) {
      fetchConversation();
    }
  }, [withUserId]);

  useEffect(() => {
    if (socket && withUserId) {
      const conversationId = [user.id, withUserId].sort().join('_');
      socket.emit('join-conversation', conversationId);

      socket.on('new-message', (message) => {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      });

      return () => {
        socket.off('new-message');
      };
    }
  }, [socket, withUserId, user.id]);

  const fetchConversation = async () => {
    try {
      const res = await axios.get(`/api/messages/${withUserId}`);
      setMessages(res.data.data);
      if (res.data.data.length > 0) {
        const msg = res.data.data[0];
        const otherUser = msg.senderId._id === user.id ? msg.recipientId : msg.senderId;
        setRecipient(otherUser);
      }
      scrollToBottom();
    } catch (err) {
      console.error(err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const res = await axios.post('/api/messages', {
        recipientId: withUserId,
        body: newMessage
      });
      setMessages(prev => [...prev, res.data.data]);
      setNewMessage('');
      scrollToBottom();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send message');
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      <div className="p-6 border-b border-border">
        <Link to="/student/dashboard" className="text-text-muted font-mono text-sm hover:text-accent mb-2 inline-block">
          ← BACK
        </Link>
        <h1 className="font-display text-2xl text-text">
          {recipient ? `CONVERSATION WITH ${recipient.name.toUpperCase()}` : 'LOADING...'}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.senderId._id === user.id;
          return (
            <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-md px-4 py-3 rounded-xl ${
                isMe ? 'bg-accent text-bg' : 'bg-surface backdrop-blur-md border border-border text-text'
              }`}>
                <p className="text-sm mb-1">{msg.body}</p>
                <p className={`text-xs font-mono ${isMe ? 'text-bg/70' : 'text-text-muted'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-6 border-t border-border flex gap-3">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-bg border border-border rounded-lg px-4 py-3 text-text font-mono text-sm focus:outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-accent text-bg font-display rounded-lg hover:shadow-[0_0_15px_rgba(210,255,0,0.3)] transition-all uppercase tracking-wider"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default Messages;