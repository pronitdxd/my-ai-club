import { supabase } from "@/utils/supabase";
import { NextResponse } from "next/server";

// This function runs every time the link is visited
export async function GET(request: Request) {
  try {
    // We just ask the database for 1 ID from the profiles table.
    // This counts as "Activity" for Supabase.
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .limit(1);

    if (error) throw error;

    return NextResponse.json({ 
      status: "Success", 
      message: "Database heartbeat sent to Supabase",
      timestamp: new Date().toISOString() 
    });
  } catch (err: any) {
    return NextResponse.json({ status: "Error", message: err.message }, { status: 500 });
  }
}