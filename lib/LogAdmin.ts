   import db from "@/lib/db";

   export async function logAdmin(
     action: string,
     targetType: "ride" | "driver" | "customer",
     targetId: number | null,
     details?: string
   ) {
     try {
       await db.query(
         "INSERT INTO admin_log (action, target_type, target_id, details) VALUES (?, ?, ?, ?)",
         [action, targetType, targetId, details ?? null]
       );
     } catch (error) {
       console.error("logAdmin failed:", error);
     }
   }