const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).send({ message: "Access Denied. No token." });

  try {
    const verified = jwt.verify(token, process.env.JWTPRIVATEKEY);
    if (verified.role !== "user") return res.status(403).send({ message: "User access only" });
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send({ message: "Invalid token" });
  }
};
