import { prisma } from "@/lib/db/prisma";
import { ensureDemoDataLoaded } from "@/lib/demo/load";

export async function getDashboardStats() {
  await ensureDemoDataLoaded();
  const [totalPurchases, returnItems, activeWarranties, expiredReturns] = await Promise.all([
    prisma.purchase.count(),
    prisma.purchaseItem.count({
      where: {
        returnDeadline: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      }
    }),
    prisma.purchaseItem.count({
      where: {
        warrantyDeadline: {
          gte: new Date()
        }
      }
    }),
    prisma.purchaseItem.count({
      where: {
        returnDeadline: {
          lt: new Date()
        }
      }
    })
  ]);

  return {
    totalPurchases,
    returnsClosingSoon: returnItems,
    activeWarranties,
    expiredReturns
  };
}

export async function getPurchases() {
  await ensureDemoDataLoaded();
  return prisma.purchase.findMany({
    orderBy: { orderDate: "desc" },
    include: {
      items: {
        orderBy: { createdAt: "asc" }
      }
    }
  });
}

export async function getPurchaseById(id: string) {
  await ensureDemoDataLoaded();
  return prisma.purchase.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: { createdAt: "asc" }
      },
      generatedClaims: {
        orderBy: { createdAt: "desc" }
      },
      user: true
    }
  });
}
