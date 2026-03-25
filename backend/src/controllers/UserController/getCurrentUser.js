const User = require("../../models/User/userData")

const getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password")
        if (!user) {
            return res.status(404).json({ msg: "Not Found!" })
        }
        return res.status(200).json({ msg: "Here is the user", data: user })
    } catch (error) {
        return res.status(500).json({ msg: "Interna server error", error: error.message })
    }
}
module.exports = getCurrentUser