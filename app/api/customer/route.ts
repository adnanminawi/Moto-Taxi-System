import db from "@/lib/db";


export async function GET() {
    try {
        const [cus_info] = await db.query("SELECT id,name,phone FROM customer");
        return Response.json({ customers: cus_info });
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Internal server error" }, { status: 500 });
    }
}