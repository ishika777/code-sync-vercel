const dotenv = require("dotenv");
dotenv.config();
const service = require("../services/ai.service")

module.exports.askAiController = async(req, res) => {
    try {
        const {prompt} = req.body;
        const result = await service.generateResult(prompt);
        return res.status(200).json({
            success: true,
            result
        })

      } catch (error) {
        return res.status(500).json({error})
      }
};