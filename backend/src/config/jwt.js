const jwt = require('jsonwebtoken');

function tokenFunction(isEmailExist) {
    return generatedToken = jwt.sign({ id: isEmailExist._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

module.exports = tokenFunction;
