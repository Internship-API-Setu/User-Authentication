import mongoose from "mongoose";

interface UserInter {
  name: string;
  email: string;
  password: string;
  role?: "user" | "admin";
  dob: Date;
  gender: "male" | "female" | "other";
  website?: string;
}

const schema = new mongoose.Schema<UserInter>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    dob: {
      type: Date,
      required: true,
      validate: {
        validator: (dob: Date) => {
          const today = new Date();
          const age = today.getFullYear() - dob.getFullYear();
          return age >= 18;
        },
        message: "User must be at least 18 years old.",
      },
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "other"],
    },
    website: {
      type: String,
      validate: {
        validator: (url: string) => {
          if (url) {
            const trimmedUrl = url.trim(); // Remove leading and trailing spaces
            const urlRegex = /^(https?:\/\/)?([^\s$.?#].[^\s]*)$/i;
            return urlRegex.test(trimmedUrl); // Validate the trimmed URL
          }
          return true; // Allow empty URLs to be valid
        },
        message: "Invalid website URL.",
      },
    },
  },
  { timestamps: true }
);

const User = mongoose.models.user || mongoose.model<UserInter>("user", schema);

export default User;
