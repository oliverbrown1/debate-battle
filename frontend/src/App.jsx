import { useState } from 'react'
import axios from 'axios'

function App() {
  const [opponent, setOpponent] = useState("")
  const [question, setQuestion] = useState("")
  const [side, setSide] = useState("")
  const [showChat, setShowChat] = useState(false)
  const [showOptions, setShowOptions] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [userInput, setUserInput] = useState("")
  const [chat, setChat] = useState([])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Replace with your actual backend endpoint
      const response = await axios.get('http://localhost:3000/initiate', {
        params: {
          opponent: opponent,
          question: question,
          side: side
          }
      })
      
      if (response.status === 200) {
        setShowOptions(false)
        setShowChat(true)
        setChat(prev => [...prev, { sender: response.data.sender , text: response.data.message }])
      } else {
        setError('Server error has occurred.')
      }
    } catch (err) {
      console.error('Error starting debate:', err)
      setError('Internal server error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    setChatLoading(true);
    try {
      const response = await axios.get("http://localhost:3000/debater", {
        params: {
          message: userInput,
        }
      })

      if (response.status === 200) {
        setChat(prev => [...prev, { sender: 'user', text: userInput }])
        setUserInput("")
        setChat(prev => [...prev, { sender: response.data.sender, text: response.data.message }])
      }
    } catch (err) {
      console.error('Error sending message:', err)
      setError('Internal server error occurred. Please try again.')
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <div data-theme="business" className="min-h-screen">
      <div className="w-screen min-h-screen p-0 m-0 flex flex-col gap-5 text-center ">
          <h1 className="text-3xl font-bold underline p-4">Debate AI</h1>

          {/* options */}
          {showOptions && (<form onSubmit={handleSubmit} className="flex flex-row gap-3 justify-center">
            <div className="flex flex-col gap-1">
              <label className="label">Opponent Name</label>
              <input 
                type="text" 
                name="opponentName"
                value={opponent}
                onChange={(e) => setOpponent(e.target.value)}
                placeholder="Socrates" 
                className="input input-bordered w-full max-w-xs" 
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="label">Debate question</label>
              <input 
                type="text" 
                name="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Is there an afterlife?" 
                className="input input-bordered w-full max-w-xs" 
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="label">Your Side</label>
              <select 
                name="side"
                value={side}
                onChange={(e) => setSide(e.target.value)}
                className="select select-bordered w-full max-w-xs"
                required
              >
                <option value="" disabled>Choose your side</option>
                <option value="for">For</option>
                <option value="against">Against</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <div className="label opacity-0">Submit</div>
              <button 
                className="btn btn-primary self-end" 
                type="submit"
                disabled={isLoading}
              >
                Debate
              </button>
              {error && <div className="text-error mt-2">{error}</div>}
            </div>
          </form>)}

          {/* chat */}
          { showChat && (<div className="border w-3/4 mx-auto flex flex-col rounded-lg" style={{ height: '70vh' }}>
            {/* messages */}
            <div className="flex-1 overflow-y-auto p-4">
              {chat.map((message, index) => (
                <div key={index} className={`chat ${message.sender === 'user' ? 'chat-end' : 'chat-start'}`}>
                  <div className="chat-header">
                    {message.sender === 'user' ? 'You' : message.sender}
                  </div>
                  <div className="chat-bubble">{message.text}</div>
                </div>
              ))}

              <div className="chat chat-start">
                <div className="chat-header">
                  Socrates
                </div>
                <div className="chat-bubble">Yes, but here are the facts: 1...</div>
              </div>
            </div>

            {/* input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Type your message..." 
                  className="input input-bordered flex-1" 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                />
                <button className="btn btn-primary" onClick={handleChatSubmit} disabled={chatLoading}>Send</button>
              </div>
            </div>
          </div>)}


      </div>
    </div>
  )
}

export default App
