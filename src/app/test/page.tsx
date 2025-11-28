import { createClient } from "@/lib/supabase/server";

export default async function ShowData() {
    const supabase = await createClient();

    const { data: users } = await supabase.from("Testing Table").select();
    console.log(users);

    return (
        <pre>
            {JSON.stringify(users)}
        </pre>
    )
}