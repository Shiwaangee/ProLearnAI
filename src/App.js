import React, { useState } from "react";
import './index.css';
import { jsPDF } from "jspdf";
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

 function handleDownloadPDF() {
  const doc = new jsPDF();
  doc.setFontSize(10);

  let y = 10;

  history.forEach((msg) => {
    const content = String(msg.content || "");
    const text = `${msg.role}: ${content}`;

    // Wrap text to fit within page width
    const lines = doc.splitTextToSize(text, 180);

    doc.text(lines, 10, y);
    y += lines.length * 10; // move down based on wrapped lines

    // Add new page if needed
    if (y > 280) {
      doc.addPage();
      y = 10;
    }
  });

  doc.save("notes.pdf");
}
  
  return (
    <div className = "bg-slate-900 text-gray-100 min-h-screen flex flex-col items-center">
      <div className = "pt-20 text-lg">
        <h1>ProLearnAI - Your teaching assistant</h1>    
      </div>

      <div className = "w-full max-w-[900px] mx-auto text-md">
      <h3 className = "font-sans font-extralight">Choose Subject:</h3>
      <select value = {subjects} onChange = {(e) => setSubjects(e.target.value)}
        className = "border rounded w-full h-10 bg-slate-900 text-[15px] text-gray-200 px-4"  
      >
        <option value = ""> Select a subject </option>
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
          className = "font-sans"
        />: null
      }

      <div className = "mb-6">
      <h3 className = "font-sans font-extralight">Choose Mode:</h3>
      <div className = "flex flex-col gap-2 font-sans ">
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

      </div>
      </div>
      <hr/>

      {/* <h3>Chat History:</h3> */}
      <div className = "font-sans">
        {history.map((msg, i) => (
          <div className = {msg.role === "user" ? "text-right" : "text-left"} key={i}>
            <p className = {msg.role === "user" ? "bg-cyan-500/10 p-4 inline-block rounded-lg" : "bg-yellow-500/10 p-4 inline-block rounded-lg"}>
              {msg.content}
            </p>
          </div>
        ))}
      </div>
      
      <button onClick = {() => setHistory([])} className = "font-sans font-extralight bg-slate-900 text-gray-200 mt-2 border border-gray-300 py-2 px-4">Clear Chat</button>
      <p className = "font-sans font-extralight" onClick = {handleDownloadPDF}>Download your revision notes</p>
      <hr/>
      </div>

      <footer>
        <p>Think ProLearnAI could be better?<a href="mailto: shiwaangee@gmail.com">Let us know</a></p>
        <p>© 2026 ProLearnAI. All rights reserved.</p>
      </footer>

      <div className = "flex fixed bottom-0 mb-6 h-10">
        <input
          type = "text"
          placeholder = "Ask your question..."
          value = {question}
          onChange = {(e) => setQuestion(e.target.value)}
          className = "px-48 border rounded-full bg-slate-500 placeholder-gray-200 placeholder:text-[15px]  placeholder:text-center mr-1"
        />
        <button onClick = {handleSend} className = "border rounded-full w-10 text-2xl  bg-slate-500 text-gray-200">
          ⮝  
        </button>
      </div>
    </div>
  );
}

export default App;
