"use client";

import { Button } from "@/components/ui/button";

export default function ShowData() {
    const fetchData = async () => {
        const fakeData = {
            username: "Akshay_Your_Bro",
            question: "Summarise my problems and give pros/cons and next suggested question",
            sub_limit: 200
        };

        try {
            const res = await fetch("https://recommend-rf4a.onrender.com/recommend", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(fakeData)
            });

            const data = await res.json();
            console.log("API RESPONSE =>", data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    return (
        <section className="mt-20 flex items-center justify-center" >
            <Button onClick={fetchData} variant={"secondary"}>Click me</Button>
        </section>
    );
}
