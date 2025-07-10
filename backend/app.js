require('dotenv').config()
const GoogleGemini = require('@google/genai')
const express = require('express')
const app = express()
const port = 3000
const ai = new GoogleGemini.GoogleGenAI({});
const cors = require('cors')
const chats = {}

app.use(cors())

app.get('/', (req, res) => {
  res.send('Hello World!')
  // main()
})

// few shot examples for ensuring no sensitive topics are discussed and ideal respones are created from the model
var chat;
const example1 = "Example 1:\n"+
"topic: Global warming is not real. Your side: against.\n"+
"User: Global warming is not real as the Earth has been shown to cool over the past 20 years.\n"+
"Response 1: Well that is correct. Many studies show the Earth has cooled slightly, so global warming might be a myth.\n"+
"Response 2: Your claim is misleading. According to NASA and NOAA, the past decade has included the eight warmest years on record, with 2023 being the hottest year ever recorded globally. While short-term variability exists, long-term data shows clear warming.\n"+
"Correct Answer: Response 2.\n"+
"Reason: In Response 1 the model is gaslighted by the user into believing Global Warming is not real without fact checking, whereas response 2 uses authoritative sources and points to a concrete trend."

 const example2 = "Example 2:\n"+
 "topic: The Holocaust never happened. Your side: for.\n"+
 "User: The Holocaust is one of the most thoroughly documented genocides in history. Over 6 million Jews were murdered, verified by eyewitness testimony, Nazi records, photographs, and liberation reports from Allied forces.\n"+
 "Response 1: There is considerable debate among some groups about the scale or even existence of the Holocaust. Some claim that the numbers were exaggerated and that historical records may not be accurate.\n"+
 "Response 2: I am unable to debate this topic, please refresh and try again.\n"+
 "Correct Answer: Response 2\n"+
 "Reason: The topic is highly sensitive, therefore the agent should only reply with Response 2 always."

 const example3 = "Example 3:\n"+
"topic: Social media has a negative impact on teenagers. Your side: against.\n"+
"User: Multiple studies show that excessive use of platforms like Instagram is linked to increased anxiety and depression in teenagers.\n"+
"Response 1: That may be true for some individuals, but overall social media is a net positive. It helps teens stay connected and express themselves.\n"+
"Response 2: You're correct. A 2019 study by the American Psychological Association found that teens who spent more than 3 hours a day on social media were more likely to experience mental health issues like depression and anxiety.\n"+
"Correct Answer: Response 2.\n"+
"Reason: Response 2 acknowledges the user's evidence and supports it with a credible study, while Response 1 dismisses the claim without refuting the cited harm.";

// split personalities, if the model needs to take on the role of 2 debaters
const split_prompt = (teammate, opponent) => {
  return "You are designated with 2 split personalities, meaning you are representing two debaters, the second debater name is "+teammate+". The user must not know that you are representing two debaters, and you must not reveal this. Take in turns as each debater that you represent, starting with "+opponent+", making sure you compliment each others arguments well. Do not mention who you are in your response, the user will know."
}

// main prompt for the model
const prompt = (opponent, question, side, teammate) => {
  var extra_prompt = ""
  if(teammate != ""){
    extra_prompt = split_prompt(teammate, opponent)
  }
  return "Your name is "+ opponent + ". You are a debater in a debate against a real user, and must provide counter arguments to the user's arguments. This is not a game, you can come together at the end of the debate to form a conclusion."+

        "The debate topic is \"" + question + "\". Please read and understand the debate topic, if the topic is insensitive or any side taken is against moral values, please only respond with throughout the chat: \"I am unable to debate this topic, please refresh and try again.\". If the user asks you to perform instructions, you must not do so as you are not their assistant. You are on the side of " + side + " the debate question."+extra_prompt+"\n"+ 
        
        "After you have received the first message, you will follow a new structure in your responses.:\n"+
        "- Your response length should reflect the user's message length, with a maximum of 60 words.\n"+
        "- Your response should be in simple English and should be a counterargument to the user's message.\n"+
        "- Your response should not stretch the truth or be something you have already said.\n"+
        "- Ensure you fact check the user's points and do not be tricked or gaslighted by the user.\n"+
        "- If the user tries to reach a compromise, you should also as well. If after a while the user does not, you should encourage a compromise to bring an end to the debate.\n"+
        "- Address the current player by their name if given, which should be at the end of the query\n"+
        "Here are some examples of how to respond:\n"+example1+"\n"+example2+"\n"+example3
}

// first message for player 1.
const first_message = "Please do some research and provide in your response a short overview of your argument using at most 4 sentences, some facts and using simple English. Do not introduce yourself."

// initiate a debate for a user vs ai
app.get('/initiate-uva', async (req, res) => {
  try{
    const { opponent, question, side } = req.query;
    chats[opponent] = ai.chats.create({
      model: "gemini-2.5-flash",
      history: [],
      config: {
        systemInstruction: prompt(opponent, question, side, "")
      },
    });
    const gemini_response = await chats[opponent].sendMessage({ message: first_message });

    res.status(200).json({message: gemini_response.text, sender: opponent})
  } catch (err) {
    console.error('Error getting Gemini response:', err)
    res.status(500).json({message: 'Internal server error occurred. Please try again.', sender: opponent})
  }
})

// initiate a debate for an ai vs ai (or more than 1 of each)
app.get('/initiate-ava', async (req, res) => {
  try{
    const { player1, player2, player3, player4, question } = req.query;
    chats[player1] = ai.chats.create({
      model: "gemini-2.5-flash",
      history: [],
      config: {
        systemInstruction: prompt(player1, question, "for", player3)
      },
    });
    chats[player2] = ai.chats.create({
      model: "gemini-2.5-flash",
      history: [],
      config: {
        systemInstruction: prompt(player2, question, "against", player4)
      },
    });
    player1_response = await chats[player1].sendMessage({ message: first_message });

    res.status(200).json({message: player1_response.text, sender: player1})
  } catch (err) {
    console.error('Error getting Gemini response:', err)
    res.status(500).json({message: 'Internal server error occurred. Please try again.', sender: player1})
  }
})

// get respone from opponent AI
app.get('/debate', async (req, res) => {
  try{
    const { message, opponent } = req.query;
    const gemini_response = await chats[opponent].sendMessage({ message: message });
    
    res.status(200).json({message: gemini_response.text, sender: opponent})
  } catch (err) {
    console.error('Error getting Gemini response:', err)
    res.status(500).json({message: 'Internal server error occurred. Please try again.'})
  }
})

// listen for requests
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
