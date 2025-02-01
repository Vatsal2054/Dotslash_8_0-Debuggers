import { useState } from 'react';
import { Send } from 'lucide-react';
import Button from '../components/UI/Buttons';
import AppointmentModal from '../components/Appointment/AppointmentModal';

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
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [recommendationData, setRecommendationData] = useState(null);

  const handleSend = async () => {
    if (newMessage.trim()) {
      // Add user message
      const userMessage = {
        id: messages.length + 1,
        type: 'user',
        text: newMessage,
        time: new Date().toLocaleTimeString('en-US', { 
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
      };
      setMessages(prev => [...prev, userMessage]);

      try {
        // Make API call to get recommendations
        const response = await fetch('http://127.0.0.1:8080/recommend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ symptoms: newMessage })
        });
        
        const data = await response.json();
        setRecommendationData(data);
        setShowRecommendation(true);

        // Add system response with recommendations
        const systemResponse = {
          id: messages.length + 2,
          type: 'agent',
          text: `Based on your symptoms, I recommend seeing a ${data.recommended_specialty} specialist. They focus on ${data.specialty_focus}.`,
          time: new Date().toLocaleTimeString('en-US', { 
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })
        };
        setMessages(prev => [...prev, systemResponse]);

        // Add available doctors message
        if (data.available_doctors?.length > 0) {
          const doctorsMessage = {
            id: messages.length + 3,
            type: 'agent',
            text: 'Here are the available doctors:',
            doctors: data.available_doctors,
            time: new Date().toLocaleTimeString('en-US', { 
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })
          };
          setMessages(prev => [...prev, doctorsMessage]);
        }
      } catch (error) {
        console.error('Error getting recommendations:', error);
      }

      setNewMessage('');
    }
  };

  const handleBookAppointment = (doctor) => {
    setSelectedDoctor(doctor);
    setIsModalOpen(true);
  };

  const handleSubmitAppointment = async (formData) => {
    // Handle appointment submission
    console.log('Appointment booked:', { ...formData, doctorId: selectedDoctor.doctorId });
  };

  return (
    <div className="w-96 h-[32rem] bg-white rounded-lg shadow-lg flex flex-col">
      {/* Header */}
      <div className="bg-blue-500 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Health Assistant</h2>
          <p className="text-sm text-blue-100">Get doctor recommendations</p>
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
              {message.doctors && (
                <div className="mt-2 space-y-2">
                  {message.doctors.map((doctor) => (
                    <div key={doctor.doctorId} className="bg-white rounded-lg p-2 text-gray-800">
                      <p className="font-medium">{doctor.name}</p>
                      <p className="text-xs">{doctor.degree} • {doctor.experience} years exp</p>
                      <p className="text-xs">{doctor.location}</p>
                      <Button 
                        type="PRIMARY"
                        extraClasses="mt-2 text-xs py-1 px-2"
                        onClick={() => handleBookAppointment(doctor)}
                      >
                        Book Appointment
                      </Button>
                    </div>
                  ))}
                </div>
              )}
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
            placeholder="Describe your symptoms..."
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

      {/* Appointment Modal */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitAppointment}
      />
    </div>
  );
};

export default LiveChatSupport;