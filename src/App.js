import React, { useState } from "react";
function App() {
  const [subjects, setSubjects] = useState("");
  const [customSubject, setCustomSubject] = useState("");

  const finalSubject = subjects === "Others" ? customSubject : subjects;
  
  // const [question, setQuestion] = useState("");
  // const [display, setDisplay] = useState([]);
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


      <hr/>

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
      />
    </div>
  );
}

export default App;
