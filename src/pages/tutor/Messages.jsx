import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Messages() {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  useEffect(() => {
    setTimeout(() => {
      const mockConversations = [
        {
          id: 1,
          name: 'Emma Thompson',
          avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
          lastMessage: 'Thank you for the feedback on my calculus assignment!',
          timestamp: new Date(2025, 4, 17, 15, 30),
          unread: 0,
          role: 'student',
          status: 'online'
        },
        {
          id: 2,
          name: 'Lucas Rodriguez',
          avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
          lastMessage: 'I have a question about the next physics lab.',
          timestamp: new Date(2025, 4, 17, 14, 15),
          unread: 1,
          role: 'student',
          status: 'offline'
        },
        {
          id: 3,
          name: 'Dr. Sarah Johnson',
          avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
          lastMessage: 'Could you share the results of the mid-term exams?',
          timestamp: new Date(2025, 4, 17, 11, 45),
          unread: 2,
          role: 'faculty',
          status: 'offline'
        },
        {
          id: 4,
          name: 'Advanced Mathematics - Class Group',
          avatar: null,
          lastMessage: 'You: I\'ve posted the review materials for next week\'s test.',
          timestamp: new Date(2025, 4, 16, 16, 30),
          unread: 0,
          role: 'group',
          status: null,
          members: 24
        },
        {
          id: 5,
          name: 'James Wilson',
          avatar: 'https://randomuser.me/api/portraits/men/83.jpg',
          lastMessage: 'Thank you for the extra help yesterday.',
          timestamp: new Date(2025, 4, 16, 10, 20),
          unread: 0,
          role: 'student',
          status: 'online'
        },
        {
          id: 6,
          name: 'Sophia Chen',
          avatar: 'https://randomuser.me/api/portraits/women/79.jpg',
          lastMessage: 'You: Please complete the missing homework assignments by Friday.',
          timestamp: new Date(2025, 4, 15, 14, 50),
          unread: 0,
          role: 'student',
          status: 'offline'
        },
        {
          id: 7,
          name: 'Principal Robert Davis',
          avatar: 'https://randomuser.me/api/portraits/men/29.jpg',
          lastMessage: 'Looking forward to your presentation at the staff meeting.',
          timestamp: new Date(2025, 4, 15, 9, 15),
          unread: 0,
          role: 'admin',
          status: 'online'
        }
      ];
      
      setConversations(mockConversations);
      setActiveConversation(mockConversations[0]);
      
      const mockMessages = [
        {
          id: 1,
          sender: 'Emma Thompson',
          senderAvatar: 'https://randomuser.me/api/portraits/women/32.jpg',
          content: 'Hello Professor, I wanted to ask about the calculus assignment due next week.',
          timestamp: new Date(2025, 4, 17, 14, 45),
          isMe: false
        },
        {
          id: 2,
          sender: 'Me',
          content: 'Hi Emma, what questions do you have about it?',
          timestamp: new Date(2025, 4, 17, 14, 50),
          isMe: true
        },
        {
          id: 3,
          sender: 'Emma Thompson',
          senderAvatar: 'https://randomuser.me/api/portraits/women/32.jpg',
          content: 'I\'m having trouble with the integration by parts problems. Could you recommend any additional resources to help me understand the concept better?',
          timestamp: new Date(2025, 4, 17, 14, 55),
          isMe: false
        },
        {
          id: 4,
          sender: 'Me',
          content: 'Of course! I recommend checking out the Khan Academy videos on integration by parts. Also, I\'ll be holding an extra review session tomorrow at 3PM if you\'d like to attend.',
          timestamp: new Date(2025, 4, 17, 15, 0),
          isMe: true
        },
        {
          id: 5,
          sender: 'Emma Thompson',
          senderAvatar: 'https://randomuser.me/api/portraits/women/32.jpg',
          content: 'That would be very helpful! I\'ll definitely attend the review session. Thank you for the feedback on my calculus assignment!',
          timestamp: new Date(2025, 4, 17, 15, 30),
          isMe: false
        }
      ];
      
      setMessages(mockMessages);
      setLoading(false);
    }, 800);
  }, []);

  // Handle sending a new message
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (newMessage.trim() === '') return;
    
    const newMessageObj = {
      id: messages.length + 1,
      sender: 'Me',
      content: newMessage,
      timestamp: new Date(),
      isMe: true
    };
    
    setMessages([...messages, newMessageObj]);
    setNewMessage('');
    
    // Update the conversation's last message
    if (activeConversation) {
      const updatedConversations = conversations.map(conv => {
        if (conv.id === activeConversation.id) {
          return {
            ...conv,
            lastMessage: `You: ${newMessage}`,
            timestamp: new Date()
          };
        }
        return conv;
      });
      
      setConversations(updatedConversations);
      setActiveConversation({
        ...activeConversation,
        lastMessage: `You: ${newMessage}`,
        timestamp: new Date()
      });
    }
  };

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(conv => 
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format time display
  const formatTime = (timestamp) => {
    const now = new Date();
    const messageDate = new Date(timestamp);
    
    // If the message is from today, show only the time
    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If the message is from yesterday, show "Yesterday"
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // If the message is from this week, show the day name
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    if (messageDate > oneWeekAgo) {
      return messageDate.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Otherwise show the date
    return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 80
      }
    }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        type: "spring",
        stiffness: 80
      }
    })
  };

  return (
    <div className="px-0 py-0 md:px-4 md:py-6 h-[calc(100vh-7rem)]">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden h-full flex flex-col md:flex-row">
        {/* Conversation sidebar */}
        <div className={`w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col ${activeConversation && 'hidden md:flex'}`}>
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-800 mb-4">Messages</h1>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Search conversations..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
          
          <div className="overflow-y-auto flex-grow">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center p-2 animate-pulse">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mr-3"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="divide-y divide-gray-100"
              >
                {filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    No conversations found
                  </div>
                ) : (
                  filteredConversations.map(conversation => (
                    <motion.div
                      key={conversation.id}
                      variants={itemVariants}
                      className={`p-3 flex items-center hover:bg-gray-50 cursor-pointer ${
                        activeConversation?.id === conversation.id ? 'bg-cyan-50' : ''
                      }`}
                      onClick={() => setActiveConversation(conversation)}
                    >
                      <div className="relative">
                        {conversation.avatar ? (
                          <img 
                            src={conversation.avatar} 
                            alt={conversation.name} 
                            className="w-12 h-12 rounded-full object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-medium">
                            {conversation.name.charAt(0)}
                          </div>
                        )}
                        
                        {conversation.status === 'online' && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                        )}
                        
                        {conversation.unread > 0 && (
                          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                            {conversation.unread}
                          </span>
                        )}
                      </div>
                      
                      <div className="ml-3 flex-1 overflow-hidden">
                        <div className="flex justify-between items-start">
                          <div className="font-medium text-gray-900 truncate">{conversation.name}</div>
                          <div className="text-xs text-gray-500 whitespace-nowrap">
                            {formatTime(conversation.timestamp)}
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-sm text-gray-600 truncate pr-2">{conversation.lastMessage}</p>
                          
                          {conversation.role !== 'student' && (
                            <span className={`text-xs px-1.5 py-0.5 rounded-sm ${
                              conversation.role === 'faculty' ? 'bg-purple-100 text-purple-800' :
                              conversation.role === 'admin' ? 'bg-amber-100 text-amber-800' :
                              conversation.role === 'group' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {conversation.role === 'group' ? `${conversation.members} members` : conversation.role}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button className="w-full px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 flex items-center justify-center">
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              New Message
            </button>
          </div>
        </div>
        
        {/* Message content */}
        {activeConversation ? (
          <div className={`flex-1 flex flex-col ${!activeConversation && 'hidden md:flex'}`}>
            {/* Conversation header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
              <div className="flex items-center">
                <button 
                  className="md:hidden mr-2 p-2 rounded-lg hover:bg-gray-100"
                  onClick={() => setActiveConversation(null)}
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                  </svg>
                </button>
                
                <div className="relative">
                  {activeConversation.avatar ? (
                    <img 
                      src={activeConversation.avatar} 
                      alt={activeConversation.name} 
                      className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-medium">
                      {activeConversation.name.charAt(0)}
                    </div>
                  )}
                  
                  {activeConversation.status === 'online' && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
                  )}
                </div>
                
                <div className="ml-3">
                  <div className="font-medium text-gray-900">{activeConversation.name}</div>
                  <div className="text-xs text-gray-500">
                    {activeConversation.status === 'online' ? 'Online' : 
                     activeConversation.role === 'group' ? `${activeConversation.members} members` :
                     'Last seen ' + formatTime(activeConversation.timestamp)}
                  </div>
                </div>
              </div>
              
              <div className="flex">
                <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                  </svg>
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              <div className="max-w-2xl mx-auto">
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : ''}`}>
                        <div className={`rounded-lg p-4 max-w-xs md:max-w-md animate-pulse ${
                          i % 2 === 0 ? 'bg-cyan-100' : 'bg-white'
                        }`}>
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                  >
                    {messages.map((message, index) => (
                      <motion.div 
                        key={message.id}
                        custom={index}
                        variants={messageVariants}
                        className={`flex ${message.isMe ? 'justify-end' : 'items-start'}`}
                      >
                        {!message.isMe && (
                          <img 
                            src={message.senderAvatar} 
                            alt={message.sender}
                            className="w-8 h-8 rounded-full mr-2 mt-1"
                          />
                        )}
                        
                        <div className={`rounded-lg p-3 ${
                          message.isMe 
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' 
                            : 'bg-white border border-gray-200'
                        }`}>
                          {!message.isMe && (
                            <div className="text-xs text-gray-500 mb-1">{message.sender}</div>
                          )}
                          
                          <div className={message.isMe ? 'text-white' : 'text-gray-800'}>
                            {message.content}
                          </div>
                          
                          <div className={`text-xs mt-1 text-right ${
                            message.isMe ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
            
            {/* Message input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSendMessage} className="flex items-center">
                <button 
                  type="button"
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-500 mr-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
                  </svg>
                </button>
                
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 py-2 px-4 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                
                <button 
                  type="button"
                  className="p-2 rounded-full hover:bg-gray-100 text-gray-500 mx-1"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </button>
                
                <button 
                  type="submit"
                  className="ml-1 p-2 rounded-full bg-cyan-600 text-white hover:bg-cyan-700"
                  disabled={newMessage.trim() === ''}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                  </svg>
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
            <div className="text-center p-8">
              <div className="bg-gray-100 rounded-full p-6 mx-auto w-24 h-24 flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Your Messages</h3>
              <p className="text-gray-500 mb-6 max-w-md">Select a conversation from the list to view messages or start a new conversation.</p>
              <button className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 flex items-center mx-auto">
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                New Message
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
