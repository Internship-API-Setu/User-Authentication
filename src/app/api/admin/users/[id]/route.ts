import { NextRequest, NextResponse } from "next/server";
import User from "@/Models/userModels";
import connection from "@/db/config";

// Update an existing user
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { name, email, password, dob, gender, website } = await req.json();

    // Check for missing required fields
    if (!name || !email || !password || !dob || !gender || !website) {
      return NextResponse.json(
        { msg: "Missing required fields: name, email, password, dob, or gender." },
        { status: 400 }
      );
    }

    // Validate date of birth
    const today = new Date();
    const userAge = today.getFullYear() - new Date(dob).getFullYear();
    if (userAge < 18) {
      return NextResponse.json({ msg: "User must be at least 18 years old." }, { status: 400 });
    }

    // Validate gender
    if (!["male", "female", "other"].includes(gender.toLowerCase())) {
      return NextResponse.json({ msg: "Invalid gender value." }, { status: 400 });
    }

    // Validate website URL
    if (website && !/^(https?:\/\/)?([^\s$.?#].[^\s]*)$/i.test(website.trim())) {
      return NextResponse.json({ msg: "Invalid website URL." }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, password, dob, gender, website },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ msg: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ msg: "Error updating user" }, { status: 500 });
  }
}

// Delete a user
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json({ msg: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ msg: "User deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ msg: "Error deleting user" }, { status: 500 });
  }
}
