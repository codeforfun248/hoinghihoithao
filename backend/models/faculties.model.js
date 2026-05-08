import mongoose from "mongoose";

const facultySchema = new mongoose.Schema({
  name: {
    type: String,
  },
});

const Faculty = mongoose.model("Faculty", facultySchema);

export default Faculty;
