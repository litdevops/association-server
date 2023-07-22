const express = require("express");
const auth = require("../../middleware/auth");
const { getPlaceApi } = require("../../public_api/place");
const { createEmployee } = require("../../utils/profile");
// Google Auth
const router = express.Router();

router.post("/jobs/employee", [auth], async (req, res) => {
  const { current_place, body } = req;

  try {
    const employees = await createEmployee({
      body,
      user: req.user.id,
      business_profile: current_place._id,
      place: current_place.place,
    });

    console.log(employees, "this_is_employees_output");
    let output = await getPlaceApi({ _id: current_place._id });

    res.status(206).json(output);
  } catch (error) {
    console.log(error);
    res.status(error.status || 400).json({ message: error.message });
  }
});

module.exports = router;
