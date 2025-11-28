"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";



export default function SignupPage() {
    const [form, setForm] = useState({
        user_email: "",
        password: "",
    });
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState("");

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setLoading(true);
        setMsg("");

        try {
            const res = await fetch("/api/signin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                setMsg(data.error || "Something went wrong");
            } else {
                setMsg(data.message || "Signin successful");
                router.push("/");
            }
        } catch (err) {
            setMsg("Network error");
        }
        setLoading(false);
    };

    return (
        <div className="flex justify-center items-center min-h-screen">
            <Card className="w-full max-w-md shadow-xl border border-white/10 bg-[#1e1e1e]">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold text-center">
                        Log in
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        

                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                name="user_email"
                                placeholder="you@example.com"
                                value={form.user_email}
                                onChange={handleChange}
                                className="bg-[#2b2b2b] border-gray-700"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Password</Label>
                            <Input
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={handleChange}
                                className="bg-[#2b2b2b] border-gray-700"
                                required
                            />
                        </div>

                        {msg && (
                            <p
                                className={`text-sm ${msg.includes("successful") ? "text-green-500" : "text-red-500"
                                    }`}
                            >
                                {msg}
                            </p>
                        )}

                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? "Creating..." : "Sign In"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
