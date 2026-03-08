import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { computeDeadlines } from "@/lib/deadlines/engine";
import { getReturnStatus, getWarrantyStatus } from "@/lib/deadlines/status";

export async function POST(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const purchase = await prisma.purchase.findUnique({
    where: { id },
    include: { items: true }
  });

  if (!purchase) {
    return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
  }

  const updated = await Promise.all(
    purchase.items.map(async (item) => {
      const deadlines = computeDeadlines({
        orderDate: purchase.orderDate,
        deliveryDate: purchase.deliveryDate,
        returnWindowDays: item.returnWindowDays,
        warrantyMonths: item.warrantyMonths
      });

      const saved = await prisma.purchaseItem.update({
        where: { id: item.id },
        data: {
          returnDeadline: deadlines.returnDeadline,
          warrantyDeadline: deadlines.warrantyDeadline
        }
      });

      const returnStatus = getReturnStatus(saved.returnDeadline);
      const warrantyStatus = getWarrantyStatus(saved.warrantyDeadline);

      return {
        itemId: saved.id,
        returnDeadline: saved.returnDeadline,
        warrantyDeadline: saved.warrantyDeadline,
        returnStatusLabel: returnStatus.statusLabel,
        warrantyStatusLabel: warrantyStatus.statusLabel
      };
    })
  );

  return NextResponse.json({
    purchaseId: purchase.id,
    recalculatedCount: updated.length,
    items: updated
  });
}
