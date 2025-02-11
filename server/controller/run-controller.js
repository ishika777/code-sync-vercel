const dotenv = require("dotenv");
dotenv.config();
const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true';
const axios = require('axios');
 
module.exports = runCode = async(req, res) => {
    try {
        const {code, langId} = req.body;
        console.log(langId)
        const response = await axios.post(JUDGE0_API_URL, {
          language_id: langId, 
          source_code: code,
        }, {
            headers: {
              'Content-Type': 'application/json',
              'X-RapidAPI-Key': process.env.RAPID_API_KEY,
              "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
            }
          });
    
        // Send back the result
        res.json({
            stdout: response.data.stdout,
            stderr: response.data.stderr,
            status: response.data.status.description
        });
      } catch (error) {
        console.log(error.message)
      }
};