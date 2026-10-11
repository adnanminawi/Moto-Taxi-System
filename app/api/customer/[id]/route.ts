import db from "@/lib/db";


export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const [one_cust] = await db.query("SELECT id, name, phone FROM customer Where id =?",
      [id]);
    return Response.json({ Customer_Profile: one_cust });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const { name, phone } = await request.json();

    await db.query(
      "UPDATE customer SET name = ?, phone = ? WHERE id = ?",
      [name, phone, id]
    );

    return Response.json({
      message: "Customer updated successfully",
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}