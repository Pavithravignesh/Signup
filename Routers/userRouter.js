const router = require('express').Router();
const { signUp, otpcheck, profileUpload } = require('../Controllers/userController');

// router.route('/signup')
//     .post(signUp);
// router.route('/signup/verify')
//     .post(otpcheck);
// router.route('/signup/profileUpload')
//     .get(profileUpload);

router.post('/signup', signUp);
router.post('/signup/verify', otpcheck);
router.post('/signup/profileUpload', profileUpload);

module.exports = router;