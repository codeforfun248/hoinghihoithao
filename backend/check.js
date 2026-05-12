const API_KEY = "GEMINI_API_KEY"; 
fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`)
  .then(res => res.json())
  .then(data => {
    console.log("CÁC MODEL BẠN ĐƯỢC PHÉP DÙNG:");
    data.models.forEach(m => console.log("- " + m.name));
  });