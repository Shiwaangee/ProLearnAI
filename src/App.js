import React, { useState } from "react";
function App() {
  const [subjects, setSubjects] = useState("");
  const [customSubject, setCustomSubject] = useState("");

  const finalSubject = subjects === "Others" ? customSubject : subjects;

  const [mode, setMode] = useState("");

  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState([]);

  async function handleSend(){
    // add history and the current question to newhistory
    const newHistory = [...history, {role: "user", content: question}];

    // send this newhistory to api and get the response
    // add the newhistory and the response to history
    try{
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openrouter/free',
          messages: [
            // prompt
            { role: "system", content: "You are a helpful tutor." },

            ...newHistory
          ],
        }),
      });
      const data = await response.json();
      const reply = data.choices[0].message.content;
      setHistory([...newHistory, { role: "assistant", content: reply }]);
    }catch(error){
      console.error("Error fetching reply:", error);
      setHistory([...newHistory, { role: "assistant", content: "Oops, something went wrong." }]);
    }
    setQuestion("");
  }

  return (
    <div>
      <h1>ProLearnAI - Your teaching assistant</h1>
    
      <h3>Choose Subject:</h3>
      <select value = {subjects} onChange = {(e) => setSubjects(e.target.value)}>
        <option value = "" > Select a subject </option>
        <option value = "English" > English </option>
        <option value = "DSA" > DSA </option>
        <option value = "Physics" > Physics </option>
        <option value = "Others" > Others </option>
      </select>
      {subjects === "Others" ? 
        <input
          type = "text"
          placeholder = "Enter subject"
          value = {customSubject}
          onChange = {(e) => setCustomSubject(e.target.value)}
        />: null
      }

      <h3>Choose Mode:</h3>
      <label>
        <input
          type = "radio"
          value = "Exam Mode"
          checked = {mode === "Exam Mode"}
          onChange = {(e) => setMode(e.target.value)}
        />
        Exam Mode
      </label>

      <label>
        <input
          type = "radio"
          value = "Concept Mode"
          checked = {mode === "Concept Mode"}
          onChange = {(e) => setMode(e.target.value)}
        />
        Concept Mode
      </label>

      <label>
        <input
          type = "radio"
          value = "Quiz Mode"
          checked = {mode === "Quiz Mode"}
          onChange = {(e) => setMode(e.target.value)}
        />
        Quiz Mode
      </label>

      <hr/>

      <h3>Chat History:</h3>
      <div>
        {history.map((msg, i) => (
          <p key={i}>
            <strong>{msg.role}:</strong> {msg.content}
          </p>
        ))}
      </div>
      
      <button>Clear Chat</button>
      <p>Download your revision notes</p>
      <hr/>
  
      <footer>
        <p>Think ProLearnAI could be better?<a href="mailto:shiwaangee@gmail.com">Let us know</a></p>
        <p>© 2026 ProLearnAI. All rights reserved.</p>
      </footer>

      <input
        type = "text"
        placeholder = "Ask your question"
        value = {question}
        onChange = {(e) => setQuestion(e.target.value)}
      />
      <button onClick = {handleSend}>
        Send
      </button>
    </div>
  );
}

export default App;
