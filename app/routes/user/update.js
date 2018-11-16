const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt-nodejs');

module.exports = (req, res, next) => {
  const UserModel = mongoose.model('User');

  const { user } = jwt.decode(req.headers.authorization);

  return UserModel.findOne({ _id: user.id }, (err, userObj) => {
    if (!userObj) {
      return next({ status: 401, message: 'User does not exists.' });
    }

    if (req.body.password && req.body.new_password) {
      bcrypt.compare(req.body.password, user.password, (error, result) => {
        if (!result || error) {
          return next(
            {
              status: 401,
              message: 'Authentication failed. Wrong password.',
            },
          );
        }

        return bcrypt.hash(req.body.new_password, null, null, (hashErr, hash) => {
          userObj.password = hash;

          return userObj.save(() => res.status(200).json(userObj));
        });
      });
    } else {
      userObj.firstname = req.body.firstname || userObj.firstname;
      userObj.lastname = req.body.lastname || userObj.lastname;
      userObj.email = req.body.email || userObj.email;
    }

    return userObj.save(() => res.status(200).json(userObj));
  });
};
