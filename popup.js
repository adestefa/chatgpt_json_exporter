document.getElementById("exportBtn").addEventListener("click", () => {
    // Query the current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      // Execute a function in that tab's context
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: exportChatGPTSession // the function we'll define below
      });
    });
  });
  
  /**
   * 
   * ChatGPT Exporter
   * Anthony DeStefano
   * 12/20/2024 10:36 PM
   * 
   * 
   * This function runs *in the context of the webpage* (the ChatGPT tab).
   * We collect data and trigger the download. 
   * 1. collect all prompts on page
   * 2. collect all responses on page
   * 3. combine prompts, responses into one JSON object
   * 4. add name and description fields along with date
   * 5. prompt the user to save the file locally with name prefilled
   * 6. save the JSON file to the local file system
   *  
   * session: [
   *    {
   *        "prompt" : "<prompt>",
   *        "response" : "<response>"
   *    },
   *    {
   *        "prompt" : "<prompt>",
   *        "response" : "<response>"
   *    },
   *    ...
   * ],
   * "name" : "name of file provide by user",
   * "desc" : "description/reason for this session provided by user",
   * "date" : "date this file was saved"
   * 
   * 
   */
  function exportChatGPTSession() {
    console.log("ChatGPT Extractor v1.0 running...");
  
    // 1) Prompt user for a session name
    const sessionName = prompt("Enter session name for this ChatGPT session:");
    const sessionDesc = prompt("Enter session description for this ChatGPT session:");



    // 2) Collect ChatGPT data
    const prompts = document.querySelectorAll('.whitespace-pre-wrap');
    const responses = document.querySelectorAll('.markdown');
    const data_final = { session: [] };
  
    const len = Math.min(prompts.length, responses.length);
    for (let i = 0; i < len; i++) {
      let promptText = prompts[i].innerText;
      let responseText = responses[i].innerText;
      data_final.session.push({
        prompt: promptText,
        response: responseText
      });
    }
  
    // 3) Add name field
    data_final.name = sessionName || "Untitled ChatGPT Session";
    data_final.desc = sessionDesc || "TBD";
  
    // 4) Add date field (formatted as YYYY:MM:DD:HH:MM)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hour = String(now.getHours()).padStart(2, "0");
    const minute = String(now.getMinutes()).padStart(2, "0");
    data_final.date = `${year}:${month}:${day}:${hour}:${minute}`;
  
    // 5) Convert object to JSON
    const jsonText = JSON.stringify(data_final, null, 2);
  
    // 6) Create a Blob and prompt file download
    const blob = new Blob([jsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
  
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    // Optionally name the file using the session name
    a.download = (sessionName || "chat_export") + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  
    console.log("ChatGPT Exporter: " + sessionName + " File saved successfully!");
  }