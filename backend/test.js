const express = require("express");
const axios = require("axios");

const app = express();

app.get("/test-ai", async (req, res) => {

  try {

    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCNDrARfgZjz3TxKa27wbajCNz4n42P-LM",
      {
        contents: [
          {
            parts: [
              {
                text: "Say hello"
              }
            ]
          }
        ]
      }
    );

    res.json(response.data);

  } catch (err) {

    console.log(err.response?.data || err.message);

    res.status(500).json({
      error: err.response?.data || err.message
    });

  }

});

app.listen(5000, () => {
  console.log("Server running");
});