import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/client";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_name, user_email, password } = body;

    if (!user_name || !user_email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const supabase = createClient();
    // insert into supabase
    const { data, error } = await supabase.from("Testing Table").insert([
      {
        user_name,
        user_email,
        password: hashedPassword,
      },
    ]);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Signup successful", user: data },
      { status: 200 }
    );

  } catch (err: any) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
