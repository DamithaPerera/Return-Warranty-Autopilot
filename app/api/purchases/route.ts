import { NextResponse } from "next/server";
import { getPurchases } from "@/lib/db/queries";

export async function GET() {
  const purchases = await getPurchases();

  return NextResponse.json(
    purchases.map((purchase) => ({
      ...purchase,
      totalAmount: Number(purchase.totalAmount),
      items: purchase.items.map((item) => ({
        ...item,
        unitPrice: Number(item.unitPrice)
      }))
    }))
  );
}
