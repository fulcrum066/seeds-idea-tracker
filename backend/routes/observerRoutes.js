const express = require("express");
const router = express.Router();
const { createSubject } = require("../factory/observerFactory");

router.get("/checkStatus", (req, res, next) => {
  try {
    const statuses = createSubject.checkStatusObservers();

    for (let i = 0; i < statuses.length; i++) {
      if (statuses[i] == true){
        return res.json(true); // return ensures we stop here 
      }
    }

    return res.json(false)
  } catch (err) {
    next(err); // send error to centralized error handler
  }
});

router.post("/reset", (req, res) => {
  try {
    createSubject.notifyObservers(false);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;