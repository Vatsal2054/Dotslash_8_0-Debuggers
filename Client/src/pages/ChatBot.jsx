import  { useState } from 'react';
import { Send } from 'lucide-react';

const LiveChatSupport = () => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      type: 'agent',
      text: 'Welcome to our live chat!',
      time: 'Yesterday'
    },
    {
      id: 2,
      type: 'agent',
      text: 'How can I help you today?',
      time: 'Yesterday'
    },
    {
      id: 3,
      type: 'user',
      text: 'I have a question about your services.',
      time: '08:20 PM'
    },
    {
      id: 4,
      type: 'agent',
      text: "I'd be happy to help! What would you like to know?",
      time: '08:21 PM'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (newMessage.trim()) {
      setMessages([...messages, {
        id: messages.length + 1,
        type: 'user',
        text: newMessage,
        time: new Date().toLocaleTimeString('en-US', { 
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
      }]);
      setNewMessage('');
    }
  };

  return (
    <div className="w-80 h-96 bg-white rounded-lg shadow-lg flex flex-col">
      {/* Header */}
      <div className="bg-blue-500 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Live Chat Support</h2>
          <p className="text-sm text-blue-100">Always available to help</p>
        </div>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
          <span className="text-sm">Online</span>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[80%] rounded-lg p-3 ${
              message.type === 'user' 
                ? 'bg-blue-500 text-white rounded-br-none' 
                : 'bg-gray-100 text-gray-800 rounded-bl-none'
            }`}>
              <p className="text-sm">{message.text}</p>
            </div>
            <span className="text-xs text-gray-500 mt-1">{message.time}</span>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            onClick={handleSend}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveChatSupport;