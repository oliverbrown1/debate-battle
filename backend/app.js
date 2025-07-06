require('dotenv').config()
const GoogleGemini = require('@google/genai')
const express = require('express')
const app = express()
const port = 3000
const ai = new GoogleGemini.GoogleGenAI({});
const cors = require('cors')

app.use(cors())

async function main() {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Explain how AI works in a few words",
    });
    console.log(response.text);
}

app.get('/', (req, res) => {
  res.send('Hello World!')
  // main()
})

app.get('/initiate', async (req, res) => {
  try{
    const gemini_response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Hi",
    });
    res.status(200).json({message: gemini_response.text, sender: req.opponent})
  } catch (err) {
    console.error('Error getting Gemini response:', err)
    res.status(500).json({message: 'Internal server error occurred. Please try again.'})
  }
})

app.get('/debater', (req, res) => {
  res.status(200).json({message: "test", sender: "AI"})
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
