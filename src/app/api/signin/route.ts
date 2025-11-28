import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createClient } from "@/lib/supabase/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_email, password } = body;

    if (!user_email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // fetch user from db
    const { data: users, error } = await supabase
      .from("Testing Table")
      .select("*")
      .eq("user_email", user_email)
      .limit(1);

    if (error || !users || users.length === 0) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 400 }
      );
    }

    const user = users[0];
    console.log(user);
    // check password
    const validPass = await bcrypt.compare(password, user.password);

    if (!validPass) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 400 }
      );
    }

    // create JWT session token
    const token = jwt.sign(
      {
        id: user.id,
        user_email: user.user_email,
        user_name: user.user_name,
      },
      process.env.JWT_SECRET!, // must be defined in .env
      { expiresIn: "7d" }
    );
    const cookieStore = await cookies();
    // store cookie
    cookieStore.set("session", token, {
      httpOnly: true,
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return NextResponse.json(
      { message: "Login successful", user: { id: user.id, email: user.user_email } },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
