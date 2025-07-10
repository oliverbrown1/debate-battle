import { useState } from 'react'
import axios from 'axios'
import ChatMessages from "./components/ChatMessages.jsx"

function App() {
  const [player1, setPlayer1] = useState("")
  const [player2, setPlayer2] = useState("")
  const [player3, setPlayer3] = useState("")
  const [player4, setPlayer4] = useState("")
  const [currentPlayer, setCurrentPlayer] = useState("")
  const [opponent, setOpponent] = useState("")
  const [question, setQuestion] = useState("")
  const [teams, setTeams] = useState("")
  const [teamSetup, setTeamSetup] = useState("")
  const [side, setSide] = useState("")
  const [showChat, setShowChat] = useState(false)
  const [showOptions, setShowOptions] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [userInput, setUserInput] = useState("")
  const [chat, setChat] = useState([])
  const [enableColours, setEnableColours] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleUVA = async () => {
    try {
      // Replace with your actual backend endpoint
      const response = await axios.get('http://localhost:3000/initiate-uva', {
        params: {
          opponent: opponent,
          question: question,
          side: (side == "for" ? "against" : "for")
          }
      })

      console.log(side)
      
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

  const handleAVA = async () => {
    var ai_resp;
    try {
      // Replace with your actual backend endpoint
      const response = await axios.get('http://localhost:3000/initiate-ava', {
        params: {
          player1: player1,
          player2: player2,
          player3: player3,
          player4: player4,
          question: question,
        }
      })

      console.log(side)
      
      if (response.status === 200) {
        setShowOptions(false)
        setShowChat(true)
        setChat(prev => [...prev, { sender: response.data.sender , text: response.data.message }])
        ai_resp = response.data.message
        setCurrentPlayer(response.data.sender)
      } else {
        setError('Server error has occurred.')
      }
    } catch (err) {
      console.error('Error starting debate:', err)
      setError('Internal server error occurred. Please try again.')
    } 

    console.log("Test")


    // for(let i=0; i<20; i++){
    //   await new Promise(resolve => setTimeout(resolve, 5000));
    //   try {
    //     const response = await axios.get('http://localhost:3000/debate', {
    //       params: {
    //         message: ai_resp,
    //         opponent: (i%2 == 0 ? player2 : player1),
    //       }
    //     })
    //     ai_resp = response.data.message
    //     setChat(prev => [...prev, { sender: response.data.sender, text: ai_resp}])
    //   } catch (err) {
    //     console.error('Error sending message:', err)
    //     setError('Internal server error occurred. Please try again.')
    //   } 

    // }
    // setChatLoading(false)
  }

      
    
  


  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (teams == "uva"){
      handleUVA()
    }
    else{
      handleAVA()
    }
  }

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    setChatLoading(true);
    var query;
    var nextTeam;
    var nextPlayer;
    if (teams == "uva"){
      setChat(prev => [...prev, { sender: 'user', text: userInput }])
      query = userInput;
      nextTeam = opponent;
      setUserInput("");
    }
    else {
      const activePlayers = [player1, player2, player3, player4].filter(Boolean);
      const currentIndex = activePlayers.indexOf(currentPlayer);
      const nextIndex = (currentIndex + 1) % activePlayers.length;
      nextPlayer = activePlayers[nextIndex];
      nextTeam = ((currentPlayer == player1 || currentPlayer == player3) ? player2 : player1)
      
      if((teamSetup == "1v2" || teamSetup == "2v1") && chat.length > 1){
        query = chat[chat.length - 2].text;
      }
      else{
        query = chat[chat.length - 1].text;
      }
    }

    try {
      const response = await axios.get("http://localhost:3000/debate", {
        params: {
          message: query+"("+currentPlayer+")",
          opponent: nextTeam,
        }
      })

      nextTeam = nextPlayer
      setCurrentPlayer(nextPlayer);

      if (response.status == 200) {
        setChat(prev => [...prev, { sender: nextTeam, text: response.data.message }])
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
          {showOptions && (<form onSubmit={handleSubmit} className="flex flex-row gap-6 justify-center">
            <div className="flex flex-col gap-2">
              <label className="label">Teams</label>
              <select 
                name="teams"
                value={teams}
                onChange={(e) => setTeams(e.target.value)}
                className="select select-bordered w-full max-w-xs"
                required
              >
                <option value="" disabled>Choose teams</option>
                <option value="uva">You vs AI</option>
                <option value="ava">AI vs AI</option>
              </select>
            </div>
            {teams == "ava" && (
              <div className="flex flex-col items-center gap-2">
                <label className="label">Enable Colours</label>
                <label className="label cursor-pointer gap-2">
                  <span className="label-text">Off</span>
                  <input 
                    type="checkbox" 
                    className="toggle toggle-primary" 
                    checked={enableColours}
                    onChange={(e) => setEnableColours(e.target.checked)}
                  />
                  <span className="label-text">On</span>
                </label>
              </div>
            )}
            {teams == "ava" && (<div className="flex flex-col gap-2">
              <label className="label">Team Setup (For vs Against)</label>
              <select 
                name="teamSetup"
                value={teamSetup}
                onChange={(e) => setTeamSetup(e.target.value)}
                className="select select-bordered w-full max-w-xs"
                required
              >
                <option value="" disabled>Choose team setup</option>
                <option value="1v1">1v1</option>
                <option value="1v2">1v2</option>
                <option value="2v1">2v1</option>
                <option value="2v2">2v2</option>
              </select>
            </div>)}
            <div className="flex flex-col gap-2">
              <label className="label">{teams == "uva" || teams == "" ? "Opponent Name" : "AI Opponent Names"}</label>
              <div className="flex flex-col gap-2">
                {teams == "ava" && (
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500">Team 1 (For)</span>
                  </div>
                )}
                <input 
                  type="text" 
                  name="opponentName"
                  value={`${teams == "uva" || teams == "" ? opponent : player1}`}
                  onChange={(e) => {
                    if (teams === "uva" || teams === "") {
                      setOpponent(e.target.value);
                    } else {
                      setPlayer1(e.target.value);
                    }
                  }}
                  placeholder="Socrates" 
                  className="input input-bordered w-full max-w-xs" 
                  required
                />
                {(teamSetup == "2v1"  || teamSetup == "2v2") && (
                  <input 
                  type="text" 
                  name="opponentName"
                  value={player3}
                  onChange={(e) => setPlayer3(e.target.value)}
                  placeholder="Plato" 
                  className="input input-bordered w-full max-w-xs" 
                  required
                />)}
              </div>
              {teams == "ava" && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500">Team 2 (Against)</span>
                  </div>
                  <input 
                  type="text" 
                  name="opponentName"
                  value={player2}
                  onChange={(e) => setPlayer2(e.target.value)}
                  placeholder="Aristotle"
                  className="input input-bordered w-full max-w-xs" 
                  required
                />
                {(teamSetup === "2v2" || teamSetup === "1v2") && (
                  <input 
                    type="text" 
                    name="opponentName"
                    value={player4}
                    onChange={(e) => setPlayer4(e.target.value)}
                    placeholder="Pythagoras" 
                    className="input input-bordered w-full max-w-xs" 
                    required
                  />
                )}
                </div>)}
            </div>
            <div className="flex flex-col gap-2">
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
            {teams != "ava" && (<div className="flex flex-col gap-2">
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
            </div>)}
            <div className="flex flex-col gap-2">
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
          { showChat && (<div className="border w-3/4 mx-auto flex flex-col rounded-lg" style={{ height: '85vh' }}>
            {/* question */}
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold">{question}</h2>
            </div>
            {/* messages */}
            <div className="flex-1 overflow-y-auto p-4">
              <ChatMessages chat={chat} teams={teams} player1={player1} player2={player2} player3={player3} player4={player4} enableColours={enableColours}/>
            </div>

            {/* input */}
            <div className="p-4 border-t">
              {teams != "ava" && (<div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Type your message..." 
                  className="input input-bordered flex-1" 
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  required
                />
                <button className="btn btn-primary" onClick={handleChatSubmit} disabled={chatLoading}>Send</button>
              </div>)}
              {teams == "ava" && (<div>
                <button className="btn btn-primary" onClick={handleChatSubmit} disabled={chatLoading}>Continue</button>
              </div>)}
            </div>
          </div>)}


      </div>
    </div>
  )
}

export default App
