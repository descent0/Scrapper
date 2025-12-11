import { supabase } from "@/lib/supabase";
import { scrapePerson } from "@/lib/sraper";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name")!;

  const { data: existing } = await supabase
    .from("people")
    .select("*")
    .eq("name", name)
    .maybeSingle();

  if (existing) return NextResponse.json(existing);

  const scraped = await scrapePerson(name);

  await supabase.from("people").insert({
    name,
    data: scraped
  });

  return NextResponse.json({ name, data: scraped });
}
