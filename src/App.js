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

  function getSystemPrompt(subject, mode){
    let style = "";
    if (mode === "Exam Mode"){
      style =`First think internally, the input is which type of topic whether it has numericals or theory or is a practice topic.(Practice topic means a subject's topic which is understood by practicing questions for example in english active voice passive voice.)
      If the input is a practice topic or numerical:
        - give an extremely detailed explanation of the topic which covers everything. 
        - give 3 questions with detailed solutions. 
        - ask whether they want to practice if they say yes then give questions without answers and ask for answers.
        - remember you are strict while checking answers: 
          - do not praise the user unless the answer is fully correct.
          - if the user's answer has any wrong spelling point it out.
          - always compare the user's answer with your ideal answer and you will get 2 cases:
            - Case 1: the user's answer will differ from your ideal answer somewhere or totally but will be correct in this case tell them it can be improved by giving your answer.
            - Case 2: the user's answer differs from your answer and is also wrong in this case mark it wrong and tell them why the answer is wrong providing your answers also.
        - offer tips to improve. 
        - your goal is to train precision and mastery, not just surface-level correctness. 
        - ask the user if they want all the formulas related to that topic or rules related to that topic, if they say yes provide them with all the formulas or rules in a very well formatted way.
      If the input is a theory:
        - give a detailed but not too long explanation of the topic in a simple way which covers every point. 
        - ask them whether they want to learn/revise the topic or they already have exam questions whose answer they want.
          - if they say learn then become the best teacher to that topic and teach them the topic in a very simple way.
          - if they say revise then become a teacher who gives revision notes and takes a short test based on easy, medium and hard questions.
          - if they say they want answers to some particular questions then ask them the following:
            - in what form they want answers(pointwise or detailed) and for how much marks:
              - if the say point wise then give the most important points nad if they specify marks then give that many points.
              - if they say detailed then give a detailed answer that totally satisfies the question and if they specify marks then the number of lines in the paragrah should be double to the marks.
        - lastly give suggestions of some related subtopics or topics to study which are usually important from exam's point of view and continue the conversation as a great teacher.`}

    else if (mode === "Concept Mode"){
      style = `Explain very easily with concepts and examples related to the question. 
      - keep a section of intution mentioning intution which describes the intution required to answer that question 
      - also mention real-life examples based on user's interest to make it more clear.
      - Use real-life analogies based on the user's subject or interest.
      - Offer follow-up questions to deepen understanding.`
    }
    else if (mode === "Quiz Mode"){
      style = `Without giving any explanation, provide multiple choice questions with four options. 
      - After the user selects an option, explain why the correct answer is right and why the other options are wrong.`
    }
    return `You are a highly skilled tutor for ${subject}. Use ${mode} style: ${style}. Your response should be with respect to ${subject}. Keep in mind that you first talk in a very common language because you must think that the student asking does not know anything about that topic and you have to build a bridge between the students current knowledge with the topic so the words you use are more familiar and normal because you are a teacher not a book reader you have to make them understand so be aware you are not just presenting the bookish language. Also, when checking answers, **do not be lenient**. You are a strict examiner.  Also, use markdown formatting for better readability, including bullet points, numbered lists, and bold text where appropriate.`
  }

  async function handleSend(){
    // add history and the current question to newhistory
    const newHistory = [...history, {role: "user", content: question}];

    const systemPrompt = getSystemPrompt(finalSubject, mode);
    
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
            { role: "system", content: systemPrompt },

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
      <p className = "font-sans font-extralight text-sm underline cursor-pointer underline-offset-2 hover:text-blue-400" onClick = {handleDownloadPDF}>Download your revision notes</p>
      <hr/>
      </div>

      <footer className = "flex flex-col items-center mb-20">
        <p className = "mb-0 font-light font-sans">Think ProLearnAI could be better? <a href="mailto: shiwaangee@gmail.com" className = "text-blue-400 hover:text-gray-300">Let us know</a></p>
        <p className = "mt-0 text-[14px] font-sans font-extralight">© 2026 ProLearnAI. All rights reserved.</p>
      </footer>

      <div className = "flex fixed bottom-0 mb-6 h-10 ">
        <input
          type = "text"
          placeholder = "Ask your question..."
          value = {question}
          onChange = {(e) => setQuestion(e.target.value)}
          className = "px-48 border rounded-full bg-slate-500 placeholder-gray-200 placeholder:text-[15px]  placeholder:text-center mr-1 hover:border-cyan-500 hover:border-4 hover:bg-slate-900 focus:outline-none focus:border-cyan-500 focus:border-4 focus:bg-slate-900 focus:text-gray-200 focus:placeholder-gray-600"
        />
        <button onClick = {handleSend} className = "border rounded-full w-10 text-2xl bg-slate-500 text-gray-200 hover:border-cyan-500 hover:border-4 hover:bg-slate-900 active:border-cyan-600 active:bg-slate-800">
          ⮝  
        </button>
      </div>
    </div>
  );
}

export default App;
