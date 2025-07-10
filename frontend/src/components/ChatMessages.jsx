import React from 'react';

const ChatMessages = ({ chat, teams, player1, player2, player3, player4, enableColours }) => {
  // Function to get border color class based on sender
  const getBorderColor = (sender) => {
    console.log("sender is "+sender)
    if (!enableColours) return '';
    
    if (sender === player1) return 'chat-bubble-info';
    if (sender === player2) return 'chat-bubble-success';
    if (sender === player3) return 'chat-bubble-error';
    if (sender === player4) return 'chat-bubble-warning';
    return '';
  };

  return (
    <>
      {chat.map((message, index) => {
        const chatClass = teams === 'ava' 
          ? ((message.sender === player1 || message.sender === player3) ? 'chat-start' : 'chat-end')
          : (message.sender === 'user' ? 'chat-end' : 'chat-start');

        return (
          <div key={index} className={`chat ${chatClass}`}>
            <div className="chat-header">
              {message.sender === 'user' ? 'You' : message.sender}
            </div>
            <div className={`chat-bubble text-left text-lg ${getBorderColor(message.sender)}`}>
              {message.text}
            </div>
          </div>
        );
      })}
    </>
  );
};

export default ChatMessages;