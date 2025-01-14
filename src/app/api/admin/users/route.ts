import { NextRequest, NextResponse } from "next/server";
import User from "@/Models/userModels";
import connection from "@/db/config";

export async function GET() {
  try {
    await connection();
    const users = await User.find({});
    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ msg: "Error fetching users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, dob, gender, website } = await req.json();

    // Ensure gender is in lowercase
    const normalizedGender = gender.toLowerCase();

    if (!name || !email || !password || !dob || !gender) {
      return NextResponse.json(
        { msg: "Missing required fields: name, email, password, dob, or gender." },
        { status: 400 }
      );
    }

    const newUser = new User({
      name,
      email,
      password,
      dob,
      gender: normalizedGender, // Use the normalized value
      website,
    });

    await newUser.save();

    return NextResponse.json({ msg: "User added successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error adding user:", error);
    return NextResponse.json({ msg: "Error adding user" }, { status: 500 });
  }
}

