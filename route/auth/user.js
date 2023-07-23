const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../../middleware/auth");
const {
  getBody,
  getRandomInt,
  createToken,
  sendError,
} = require("../../utils/api");
const Phone = require("../../models/auth/Phone");
const User = require("../../models/auth/User");
const Profile = require("../../models/auth/Profile");
const Action = require("../../models/analytics/Action");
const ErrorLog = require("../../models/analytics/ErrorLog");
const sanitized = require("../../utils/sanitized");
const { phone: phoneValidator } = require("phone");
const {
  smsTransporter,
  emailTransporter,
} = require("../../middleware/message");
const Manager = require("../../models/business/manager");
const BusinessProfile = require("../../models/business/BusinessProfile");

// Google Auth
const router = express.Router();

// CONSTANTS
const JWT_SECRET = process.env.JWT_SECRET;
const TWILIO_LOCAL_PHONE_NUMBER = process.env.TWILIO_LOCAL_PHONE_NUMBER;
const template_confirmation = "confirmation";
const template_forgot_password = "recovery_code";

router.get("/", (req, res) => res.send("Test Pass"));

router.patch("/account_update/", [auth], async (req, res) => {
  const BODY = req.body;
  const dict_key = "account_update";

  try {
    let error_list = [];
    let got_body = await getBody(dict_key, BODY);
    let { current_password, new_password, email, phone, medium } = got_body;
    medium = medium || (phone && "phone") || (email && "email");

    let userQuery = {
      _id: req.user && req.user.id,
    };
    let user = await User.findOne(userQuery);
    let existing_phone = phone && (await User.findOne({ phone }));
    let existing_email = email && (await User.findOne({ email }));

    if (!req.user || !req.user.id) {
      let msg = `Invalid Credentials While Updating Account`;
      error_list.push(msg);
      res.status(400).json({ errors: error_list });
      return;
    } else if (!user) {
      // see if user exists
      let msg = `Theirs no user associated with this ${medium}`;
      error_list.push(msg);
      res.status(400).json({ errors: error_list });
      return;
    } else if (
      existing_phone &&
      String(existing_phone._id) !== String(user._id)
    ) {
      let msg = `This phone number is taken`;
      error_list.push(msg);
      res.status(400).json({ errors: error_list });
    } else if (
      existing_email &&
      String(existing_email._id) !== String(user._id)
    ) {
      let msg = `This email address is taken`;
      error_list.push(msg);
      res.status(400).json({ errors: error_list });
    } else {
      const isMatch =
        current_password &&
        (await bcrypt.compare(current_password, user.password));
      if (!isMatch) {
        let msg = `Invalid Credentials While Updating Account`;
        error_list.push(msg);
        res.status(400).json({ errors: error_list });
        return;
      }

      let found_profile = await Profile.findOne({
        user: user._id,
        current: true,
      });

      let got_profile_body = await getBody("update_profile", got_body);
      let got_user_body = await getBody("update_user", got_body);

      // replace the information appropriately

      const user_entries = Object.entries(got_user_body);
      const profile_entries = Object.entries(got_profile_body);

      user_entries.forEach((element) => {
        // replace the user data with the authorized body data

        if ([element[0]]) {
          user[element[0]] = element[1];
        }
      });

      // hash the new user password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      user.prev_passwords.push(user.password);

      // update the profile
      profile_entries.forEach((element) => {
        // replace the user data with the authorized body data
        if ([element[0]]) {
          found_profile[element[0]] = element[1];
        }
      });

      await found_profile.save();
      await user.save();

      // the the profile that is authorized to be send back to the users
      const current_profile = await getBody("current_profile", found_profile);

      const payload = {
        user: {
          id: user.id,
        },
        profile: current_profile,
      };

      jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: 3600000 },
        async (err, token) => {
          if (err) throw err;
          res.json({
            token,
            ...payload,
          });
        }
      );
    }
  } catch (err) {
    res
      .status(500)
      .json({ errors: [{ msg: "Server error while loging in." }] });
  }
});

router.get(`/load_user/`, [auth], async (req, res) => {
  let ip_address = req.connection.remoteAddress;

  let output = {
    ip_address,
  };

  try {
    let query = req.user && req.user.id;
    const user = await User.findById(query).select("-password");
    let error_list = [];

    if (user && user.verified) {
      let found_profile = await Profile.findOne({
        user: user.id,
        current: true,
      });

      let found_manager = await Manager.findOne({
        user: req.user.id,
        owned: true,
        place: found_profile.current_place,
      });

      let current_place;

      if (found_manager) {
        current_place = await BusinessProfile.findOne({
          _id: found_manager.business_profile,
        }).populate([
          { path: "logo", select: "link" },
          { path: "poster", select: "link" },
          { path: "banner", select: "link" },
        ]);
      }

      let current_profile = await getBody("current_profile", found_profile);
      current_place = await getBody("place_card", current_place);

      user.current_place = current_place;
      await user.save();

      // get current place

      const payload = {
        user: {
          id: user.id,
        },
        current_place,
        current_profile,
        access: {},
      };

      output = { ...output, ...payload };

      res.json(output);
    } else if (user && !user.verified) {
      let medium = user.email ? "email" : "phone";
      let message = `Please check your ${medium} and get the code to very this account`;

      error_list.push({ error: message, key: "email" });
      let output = { message: { form: error_list, body: req.body } };

      res.status(206).json({ page: "login", message: output });
    } else if (req.forgot_password) {
      let { email, phone } = req.forgot_password || {};
      let page = "recovery_check";
      let medium = email ? "email" : "phone";
      let message = `Please check your ${medium} and get the code to very this account`;

      error_list.push({ error: message, key: "recovery_token" });
      let output = { message: { form: error_list, body: req.body } };
      // find the user using the email
      let user = await User.findOne({ [medium]: email || phone });
      if (!user) {
        // throw error

        page = "login";

        res.status(206).json({ page, message: output.message });
      } else {
        if (user.recovery_token_matches) {
          page = "password_reset";
        }

        res.status(206).json({ page, message: output.message });
      }
    } else {
      let message = `Unauthorized User`;

      error_list.push({ error: message });

      throw {
        status: 206,
        message: { page: "login", form: error_list },
      };
    }
  } catch (error) {
    console.log(error);
    res.status(error.status || 500).json({ message: error.message });
  }
});

router.post("/password_reset/", [auth], async (req, res) => {
  const BODY = req.body;
  const dict_key = "password_reset";
  let page = "dashboard";

  try {
    let error_list = [];

    let got_body = await getBody(dict_key, BODY);
    let { password, confirm_password } = got_body;

    if (!req.forgot_password) {
      let message = `You must first validate your password reset token`;
      error_list.push({ error: message });
      throw {
        status: 403,
        message: {
          page: "forgot_password",
          message: { form: error_list, body: req.body },
        },
      };
    }

    const { email, phone } = req.forgot_password;
    let medium = email ? "email" : "phone";
    if (!email && !phone) {
      let message = `Invalid ${medium}.`;
      error_list.push({ error: message });
      throw {
        status: 501,
        message: {
          page: "forgot_password",
          message: { form: error_list, body: req.body },
        },
      };
    }

    let user = await User.findOne({ [medium]: email || phone });
    // see if user exists
    if (!user) {
      let message = `Theirs no user with this token`;
      error_list.push({ error: message });
      throw {
        status: 501,
        message: {
          page: "forgot_password",
          message: { form: error_list, body: req.body },
        },
      };
    } else if (!user.recovery_token_matches) {
      let message = `You must first validate your password reset token`;
      error_list.push({ error: message });
      throw {
        status: 403,
        message: { page: "forgot_password", form: error_list },
      };
    } else if (confirm_password && password !== confirm_password) {
      let message = "Password must match confirmed password";
      error_list.push({ error: message, key: "confirm_password" });

      throw {
        status: 403,
        message: {
          page: "forgot_password",
          message: { form: error_list, body: req.body },
        },
      };
    } else {
      // remove verification token
      user.recovery_token_matches = false;
      user.recovery_token = null;
      // todo: send email and text message letting the user know that their validatio has pass
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
      let found_profile = await Profile.findOne({
        user: user._id,
        current: true,
      });
      let current_profile = await getBody("current_profile", found_profile);

      // send token to automaticly log users in

      const payload = {
        user: {
          id: user.id,
        },
        profile: current_profile,
        forgot_password: null,
      };

      await createToken({ payload, error_list, res });
      return;
    }
  } catch (error) {
    res.status(error.status || 500).json(error.message);
  }
});

router.post("/recovery_check/", [auth], async (req, res) => {
  const BODY = req.body;
  const dict_key = "recovery_check";

  try {
    let error_list = [];

    if (!req.forgot_password) {
      // send error
    }

    const { email, phone } = req.forgot_password;
    let got_body = await getBody(dict_key, BODY);
    let { recovery_token } = got_body;

    let userQuery = {
      $or: [],
      recovery_token,
    };

    phone && userQuery.$or.push({ phone });
    email && userQuery.$or.push({ email });

    let user = await User.findOne(userQuery);

    // see if user exists
    if (!user) {
      let message = `Recovery Token Validation Failed`;
      error_list.push({ error: message, key: "recovery_token" });
      let output = { message: { form: error_list, body: req.body } };

      res.status(403).json({ page: "recovery_check", message: output.message });

      return;
    } else {
      // save the user forgot password verification code
      user.recovery_token_matches = true;
      // todo: send email and text message letting the user know that their validatio has pass
      await user.save();
      const message = {
        info: "recovery code matches",
      };

      res.status(206).json({
        message,
        page: "password_reset",
      });
    }
  } catch (err) {
    console.error(err, "login 2 error");
    res
      .status(500)
      .json({ errors: [{ msg: "Server error while loging in." }] });
  }
});

router.post("/forgot_password/", [auth], async (req, res) => {
  const BODY = req.body;
  const dict_key = "forgot_password";
  let confirmation_code = getRandomInt(100001, 999999);

  try {
    let got_body = await getBody(dict_key, BODY);
    let { email, phone } = got_body;
    let error_list = [];
    let page = "forgot_password";
    let status = 201;

    let userQuery = {
      $or: [],
    };

    let medium = email ? "email" : "phone";

    phone && userQuery.$or.push({ phone });
    email && userQuery.$or.push({ email });

    let user = await User.findOne(userQuery);
    // see if user exists
    if (!user) {
      let message = `Theirs no user associated with this ${medium}`;
      error_list.push({ error: message, key: medium });
      status = 403;
    } else {
      // save the user forgot password verification code
      user.recovery_token = confirmation_code;
      page = "recovery_check";
      status = 206;

      let message = `Please check your ${medium} for your verification code`;
      error_list.push({ error: message, key: medium });
      await user.save();

      const payload = {
        forgot_password: {
          email: email || user.email,
          phone: phone || user.phone,
          confirmation_code,
        },
      };
      await createToken({ page, payload, error_list, res });

      // send token via email or sms
      await SendVerificationCode({
        email: email || user.email,
        phone: phone || user.phone,
        confirmation_code,
        template: template_forgot_password,
      });
      return;
    }

    if (error_list[0]) {
      let error_config = {
        status,
        message: {
          page,
          message: { form: error_list, body: req.body },
        },
        config: {
          user,
        },
      };
      throw error_config;
    }
  } catch (error) {
    await sendError({ error, res });
  }
});

router.post("/resent_code/", async (req, res) => {
  const BODY = req.body;
  const dict_key = "resent_code";

  try {
    let got_body = await getBody(dict_key, BODY);
    let { email, phone, type } = got_body;
    let error_list = [];

    let medium = email ? "email" : "phone";
    let userQuery = {
      [medium]: email || phone,
    };

    let user = await User.findOne(userQuery);
    // see if user exists
    if (!user) {
      let message = `Theirs no user associated with this ${medium}`;

      error_list.push({ error: message, key: medium });

      throw {
        status: 403,
        message: {
          page: "register",
          message: { form: error_list, body: req.body },
        },
      };
    } else if (!user[type]) {
      let message = `Their no ${type} associated with this account. Please go through forgot password`;

      error_list.push({ error: message, key: medium });

      throw {
        status: 403,
        message: {
          page: "forgot_password",
          message: { form: error_list, body: req.body },
        },
      };
    } else {
      // save the user forgot password verification code
      let confirmation_code = user[type];
      await user.save();
      // send token via email or sms
      await SendVerificationCode({
        email: email || user.email,
        phone: phone || user.phone,
        confirmation_code,
        template: template_forgot_password,
      });
      let message = `Please check your ${medium} for your verification code`;

      res.status(203).json({ message, page: type });
    }
  } catch (error) {
    res.status(error.status || 500).json(error.message);
  }
});

router.post("/login/", async (req, res) => {
  const BODY = req.body;
  const dict_key = "login";
  let new_confirmation_code = getRandomInt(100001, 999999);
  let page = "dashboard";

  try {
    let error_list = [];
    let output = [];
    let got_body = await getBody(dict_key, BODY);
    let { password, email, phone, medium } = got_body;
    medium = medium || (phone && "phone") || (email && "email");

    let userQuery = {
      $or: [],
    };

    phone && userQuery.$or.push({ phone });
    email && userQuery.$or.push({ email });

    let user = await User.findOne(userQuery);

    // see if user exists
    if (!user) {
      let message = `Theirs no user associated with this ${medium}`;
      error_list.push({ error: message, key: "email" });
      page = "login";

      throw {
        status: 403,
        message: {
          page,
          message: { form: error_list, body: req.body },
        },
      };
    } else {
      const isMatch =
        password && (await bcrypt.compare(password, user.password));

      if (!isMatch) {
        let message = `Invalid Credentials`;

        error_list.push({ error: message, key: "password" });
        page = "login";

        throw {
          status: 403,
          message: {
            page,
            message: { form: error_list, body: req.body },
          },
        };
      }
      if (!user.verified) {
        user.confirmation_code =
          user.confirmation_code || new_confirmation_code;

        await SendVerificationCode({
          email,
          phone,
          confirmation_code: user.confirmation_code,
          user_id: user.id,
          template: template_confirmation,
        });

        let message = `Please check your ${medium} to verify this account`;
        page = "verification";
      }

      let found_profile = await Profile.findOne({
        user: user._id,
        current: true,
      });

      let current_profile = await getBody("current_profile", found_profile);

      const payload = {
        user: {
          id: user.id,
        },
        profile: current_profile,
      };

      let message = `Please validate your ${medium}`;

      error_list.push({ error: message, key: medium });

      await createToken({ page, payload, error_list, res });
    }
  } catch (error) {
    res.status(error.status || 501).json(error.message);
  }
});

router.post("/verification/", [auth], async (req, res) => {
  const dict_key = "verification";
  const BODY = req.body;

  try {
    let error_list = [];
    let got_body = await getBody(dict_key, BODY);
    let { confirmation_code } = got_body;

    confirmation_code = String(confirmation_code);
    let userQuery = {
      _id: req.user.id,
    };

    let user = await User.findOne(userQuery);
    let medium = user.email ? "email" : "phone";

    let page = "login";
    let status = 201;
    if (!user) {
      let message = `Invalid Credentials`;
      error_list.push({ error: message, key: medium });
      status = 403;
      page = "login";
    } else if (user.verified) {
      let message = `User Already Verified`;
      error_list.push({ error: message, key: medium });
      status = 206;
      page = "login";
    } else if (!user.verified) {
      let matched = user.confirmation_code === confirmation_code;

      if (matched) {
        user.verified = true;
        user.confirmation_code = null;
        await user.save();
        let message = `User Verification Succeeded`;

        page = "dashboard";
        res.status(status).send({ message });
        return;
      } else {
        let message = `Invalid Code`;
        error_list.push({ error: message, key: "confirmation_code" });
        status = 403;
        page = "verification";
      }
    } else {
      let message = `User Verification Failed`;
      status = 403;
      page = "login";
      error_list.push({ error: message, key: medium });
    }

    if (error_list[0]) {
      let error_config = {
        status,
        message: {
          page,
          message: { form: error_list, body: req.body },
        },
        config: {
          user,
        },
      };
      throw error_config;
    }
  } catch (error) {
    console.log(error);
    await sendError({ error, res });
  }
});

router.post("/register/", async (req, res) => {
  // CONSTANTS
  const ip_address = req.connection.remoteAddress;

  const dict_key = "register";
  const profile_key = "profile";
  const BODY = req.body;
  let confirmation_code = getRandomInt(100001, 999999);

  // will use to save errors
  let body_string = JSON.stringify(req.body);

  try {
    // UI/UX: build all errors before throwing it one by one
    let error_list = [];
    // get authorized  detail only
    let got_user_body = await getBody(dict_key, BODY);
    let { email, phone, medium, password, confirm_password } = got_user_body;

    if (confirm_password !== password) {
      let message = "Password must match confirmed password";
      await error_list.push({ error: message, key: "confirm_password" });
    }
    if (!email && !phone) {
      let message = "You must provide an email or phone number";
      await error_list.push({ error: message, key: "email" });
    }

    if (!password) {
      let message = "You must enter a password";
      await error_list.push({ error: message, key: "password" });
    }

    if (!medium) {
      medium = email ? "email" : "phone";
    }

    var email_check = await User.findOne({ ["email"]: email });
    // check if user exists
    if (email_check) {
      let message = `This email already exists (${email})`;

      error_list.push({ error: message, key: "email" });
    }

    if (phone) {
      let phone_validated = phoneValidator(phone);
      if (!phone_validated.isValid) {
        let message = `This phone number is invalid (${phone})`;
        error_list.push({ error: message, key: "phone" });
      }
    }

    // save user if theirs no errors
    if (!error_list[0]) {
      // check if user exists

      // or create a new user AND profile
      got_user_body.ip_address = ip_address;
      delete got_user_body.phone;

      let user = new User(got_user_body);
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      user.confirmation_code = confirmation_code;

      await user.save();

      let got_profile_body = await getBody(profile_key, BODY);
      got_profile_body.updated_at = Date.now();
      got_profile_body.public = true;
      got_profile_body.published = true;

      // make sure these are appropriately.
      // just incase the user pass the value themselves
      // IMPORTANT_SECURITY
      got_profile_body.ip_address = ip_address;
      got_profile_body.admin = false;
      got_profile_body.current = true;
      got_profile_body.self = true;
      got_profile_body.user = user._id;
      let profile = new Profile(got_profile_body);
      await profile.save();

      let current_profile = await getBody("current_profile", profile);

      if (phone) {
        // sanitized the phone numbers
        let phone_number = sanitized.phone(phone);

        // find the phone number

        let phone_query = {
          phone_number,
        };
        let existing_phone = await Phone.findOne(phone_query);

        // if theirs no existing number, create the number
        let phone_owner_payload = {
          user: user._id,
          profile: profile._id,
        };
        if (!existing_phone) {
          let confirmation_code = getRandomInt(100001, 999999);
          phone_owner_payload.confirmation_code = confirmation_code;
          let phone_payload = {
            phone_number: phone,
            owners: [phone_owner_payload],
          };
          existing_phone = new Phone(phone_payload);
          await existing_phone.save();
        } else {
          phone_owner_payload.confirmation_code = confirmation_code;
          existing_phone.owners.push(phone_owner_payload);
          await existing_phone.save();
        }

        user.phone = existing_phone._id;
        await user.save();

        // await SendVerificationCode({
        //   phone,
        //   confirmation_code,
        //   user_id: user.id,
        //   template: template_confirmation,
        // });
      }

      // send token via email or sms
      await SendVerificationCode({
        email,
        confirmation_code,
        user_id: user.id,
        template: template_confirmation,
      });

      await user.save();
      let message = `Please check your ${medium} for your verification code.`;

      let action_response_payload = {
        model: "User",
        actor: "system",
        model_id: profile._id,
        crud: "rest_response",
        description: "SMS User Verification (Twilio)",
        metadata: { response: message },
      };
      let action_response = new Action(action_response_payload);
      await action_response.save();
      // send the items

      error_list.push({ error: message, key: "email" });
      let output = { message: { form: error_list, body: req.body } };

      // create token

      const payload = {
        user: {
          id: user.id,
        },
        profile: current_profile,
      };

      await createToken({ page: "verification", payload, error_list, res });

      let user_action_payload = {
        model: "User",
        model_id: user._id,
        crud: "Create",
        description: "Created user",
      };

      let user_action = new Action(user_action_payload);
      await user_action.save();

      let action_profile_payload = {
        model: "Profile",
        model_id: profile._id,
        crud: "Create",
        description: "Created user profile",
      };

      let action_profile = new Action(action_profile_payload);
      await action_profile.save();
    } else {
      let error_payload = {
        description: "Create User Error",
        ip_address,
        metadata: {
          body: body_string,
          error_list: error_list,
        },
      };
      await new ErrorLog(error_payload).save();
      throw { status: 403, message: { form: error_list, body: req.body } };
    }
  } catch (error) {
    console.log(error, "authentication_error");
    let error_payload = {
      description: "Create User Error",
      ip_address,
      metadata: {
        body: body_string,
        message: error.message,
      },
    };
    await new ErrorLog(error_payload).save();

    res.status(error.status || 501).json({ message: error.message });
    return;
  }
});

const SendVerificationCode = async (input) => {
  let { email, from, phone, subject, confirmation_code, template } = input;
  if (email) {
    await emailTransporter({
      from: from || "noreply@thepromoapp.net",
      to: email,
      subject: subject || "Promo Verification Code",
      template: template || "verification",
      detail: {
        email,
        code: confirmation_code,
      },
    });
    return {
      type: "email",
    };
  }
  if (phone) {
    let payload = {
      to: phone,
      from: TWILIO_LOCAL_PHONE_NUMBER,
      template,
      payload: { code: confirmation_code },
    };
    const sendSMS = await smsTransporter(payload);
    return {
      type: "sms",
      result: JSON.stringify(sendSMS),
    };
  }
};

module.exports = router;
