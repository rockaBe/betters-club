var secrets = require('../config/secrets');
var app_settings = require('../config/app_settings');
var nodemailer = require("nodemailer");
var smtpTransport = nodemailer.createTransport('SMTP', {
  service: 'Gmail',
  auth: {
       user: secrets.gmail.user,
       pass: secrets.gmail.password
  }
});

/**
 * GET /contact
 * Contact form page.
 */

exports.getFeedback = function(req, res) {
  res.render('feedback', {
    title: 'Contact'
  });
};

/**
 * POST /contact
 * Send a contact form via Nodemailer.
 * @param email
 * @param name
 * @param message
 */

exports.postFeedback = function(req, res) {
  req.assert('name', 'Name cannot be blank').notEmpty();
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('message', 'Message cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/feedback');
  }

  var from = req.body.email;
  var name = 'Name:\t' + req.body.name;
  var body = 'Body:\n\n' + req.body.message;
  var to = app_settings.contact_email;
  var subject = app_settings.project_name + ' | Feedback Form';

  var mailOptions = {
    to: to,
    from: from,
    subject: subject,
    text: body + '\n\n' + name + '\nEmail:\t ' + from
  };

  smtpTransport.sendMail(mailOptions, function(err) {
    if (err) {
      req.flash('errors', { msg: err.message });
      return res.redirect('/feedback');
    }
    req.flash('success', { msg: 'Email has been sent successfully!' });
    res.redirect('/feedback');
  });
};
