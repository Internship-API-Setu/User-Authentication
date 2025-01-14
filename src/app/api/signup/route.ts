import User from "@/Models/userModels";
import connection from "@/db/config";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, password, dob, gender, website } = body;

  if (!name || !email || !password || !dob || !gender) {
    return NextResponse.json({ msg: "Invalid fields" }, { status: 400 });
  }

  // Normalize gender to lowercase
  const normalizedGender = gender.toLowerCase();
  if (!["male", "female", "other"].includes(normalizedGender)) {
    return NextResponse.json({ msg: "Invalid gender value" }, { status: 400 });
  }

  await connection();
  const isUserAlreadyPresent = await User.findOne({ email });
  if (isUserAlreadyPresent) {
    return NextResponse.json({ msg: "User is already present" }, { status: 409 });
  }

  try {
    // Hash password with bcrypt
    const hashPassword = await bcrypt.hash(password, 10);

    // Save user to database
    const user = new User({
      email,
      password: hashPassword,
      name,
      dob,
      gender: normalizedGender,
      website,
    });
    await user.save();

    // Generate JWT token
    const privateKey = process.env.JWT_SECRET || "default_secret_key";
    const token = jwt.sign({ email, name }, privateKey);

    // Send response with token
    const response = NextResponse.json({ msg: "User created successfully", success: true }, { status: 201 });
    response.cookies.set("token", token, {
      httpOnly: true,
    });
    return response;

  } catch (err) {
    console.error("Error during signup:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
