const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ragpickerSchema = new Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { data: Buffer, contentType: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  address: { type: String, required: true },
  contactNumber: { type: String, required: true },
  gender: { type: String, required: true },
  upiId: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  totalJobs: { type: Number }, // Added totalJobs as a number
  jobsAssigned: { type: Boolean }, // Added jobsAssigned as a boolean
  ratings: { type: Number }, // Added ratings as a number
});

const Ragpicker = mongoose.model('Ragpicker', ragpickerSchema);
module.exports = Ragpicker;
