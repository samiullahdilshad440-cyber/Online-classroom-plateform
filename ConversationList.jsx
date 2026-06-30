import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ConversationList = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await axios.get('/api/messages/conversations');
        setConversations(res.data.data);
      } catch (err) { 
        console.error('Failed to fetch conversations:', err); 
      }
      finally { 
        setLoading(false); 
      }
    };
    fetchConversations();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-accent font-mono text-xl animate-pulse">
          LOADING CONVERSATIONS...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-8 max-w-4xl mx-auto">
      <h1 className="font-display text-4xl text-text mb-2">MESSAGES</h1>
      <p className="text-text-muted font-mono text-sm mb-8 uppercase tracking-widest">
        // Your conversations
      </p>

      <div className="space-y-3">
        {conversations.length === 0 ? (
          <div className="p-12 border border-dashed border-border rounded-xl text-center">
            <p className="text-text-muted font-mono">NO CONVERSATIONS YET</p>
            <p className="text-text-muted text-sm mt-2">
              Start a conversation from a course or user profile
            </p>
          </div>
        ) : (
          conversations.map(conv => (
            <Link
              key={conv.conversationId}
              to={`/messages/${conv.otherUser._id}`}
              className="block p-4 border border-border rounded-lg bg-surface backdrop-blur-md hover:border-accent transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-display text-lg text-text">{conv.otherUser.name}</h3>
                    {conv.unreadCount > 0 && (
                      <span className="bg-accent text-bg text-xs font-mono font-bold rounded-full px-2 py-0.5">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <p className="text-text-muted text-sm truncate">{conv.lastMessage}</p>
                </div>
                <span className="text-text-muted font-mono text-xs">
                  {new Date(conv.lastMessageAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;