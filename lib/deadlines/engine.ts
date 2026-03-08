type RecalculateDeadlineInput = {
  orderDate: Date;
  deliveryDate: Date | null;
  returnWindowDays: number | null;
  warrantyMonths: number | null;
};

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function addMonths(date: Date, months: number) {
  const copy = new Date(date);
  copy.setMonth(copy.getMonth() + months);
  return copy;
}

export function computeDeadlines(input: RecalculateDeadlineInput) {
  const returnBaseDate = input.deliveryDate ?? input.orderDate;
  const returnDeadline =
    input.returnWindowDays !== null && input.returnWindowDays !== undefined
      ? addDays(returnBaseDate, input.returnWindowDays)
      : null;
  const warrantyDeadline =
    input.warrantyMonths !== null && input.warrantyMonths !== undefined
      ? addMonths(input.orderDate, input.warrantyMonths)
      : null;

  return { returnDeadline, warrantyDeadline };
}
