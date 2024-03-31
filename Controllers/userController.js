const bcrypt = require("bcrypt");
const _ = require("lodash");
const axios = require("axios");
const otpGenerator = require('otp-generator');

const { User } = require('../Model/userModel');
const Otp = require('../Model/otpModel');


module.exports.signUp = async (req, res) => {
    if (!req.body.number) {
        return res.status(400).json({ message: "Enter Mobile no" });
    }
    const user = await User.findOne({
        number: req.body.number
    });

    console.log(user);
    if (user) return res.status(400).send("User already registered!");

    const OTP = otpGenerator.generate(6, {
        digits: true, alphabets: false, upperCase: false, specialChars: false
    });
    console.log("OTP", OTP);
    const number = req.body.number;
    const greenwebsms = new URLSearchParams();
    greenwebsms.append('token', '05fa33c4cb50c35f4a258e85ccf50509');
    greenwebsms.append('to', `+${number}`);
    greenwebsms.append('message', `Verification Code ${OTP}`);

    await axios.post('http://api.greenweb.com.bd/api.php', greenwebsms)

    const otp = await Otp({
        number: number,
        otp: OTP
    });

    await otp.save();
    res.status(200).send({ message: "Otp send successfully!", otp });
}

// for the respective OTP this is alone is running
module.exports.otpcheck = async (req, res) => {

    const otpHolder = await Otp.find({
        number: req.body.number
    });

    // when OTP is wrong
    if (otpHolder[otpHolder.length - 1].otp !== req.body.otp) return res.status(400).send("Enter Correct OTP!");

    const rightOtpFind = otpHolder[otpHolder.length - 1];
    if (rightOtpFind.number === req.body.number) {

        return res.status(200).send({
            message: "OTP is correct!"
        });
    }
}

// updating user profile data in User model
module.exports.profileUpload = async (req, res) => {

    const userNumber = await Otp.find({
        number: req.body.number
    });

    console.log(userNumber);

    // when mobile no is wrong
    if (userNumber.length == 0) return res.status(400).send("Invaild mobile number!");

    const rightOtpFind = userNumber[userNumber.length - 1];

    if (rightOtpFind.number === req.body.number) {
        const user = new User(_.pick(req.body, ["number", "firstName", "lastName", "isLogin"]));
        const token = user.generateJWT();
        const result = await user.save();
        return res.status(200).send({
            message: "User Registration Successfull!",
            token: token,
            data: result
        });
    }
    // else {
    //     return res.status(400).send("Your OTP was wrong!");
    // }

}