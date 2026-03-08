import { NextRequest, NextResponse } from "next/server";
import { getPurchaseById } from "@/lib/db/queries";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const purchase = await getPurchaseById(id);

  if (!purchase) {
    return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...purchase,
    totalAmount: Number(purchase.totalAmount),
    items: purchase.items.map((item) => ({
      ...item,
      unitPrice: Number(item.unitPrice)
    }))
  });
}
