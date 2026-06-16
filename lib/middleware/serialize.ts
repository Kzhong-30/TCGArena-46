function parseImages(images: string | null | undefined): string[] {
  if (!images) return [];
  try {
    const parsed = JSON.parse(images);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function ensureString(value: any): string {
  return value ? String(value) : "";
}

export function serializeProperty(property: any): any {
  if (!property) return property;

  return {
    ...property,
    images: parseImages(property.images),
    type: ensureString(property.type),
    status: ensureString(property.status),
    listingStatus: ensureString(property.listingStatus),
    rentPeriod: ensureString(property.rentPeriod),
  };
}

export function serializeBooking(booking: any): any {
  if (!booking) return booking;

  return {
    ...booking,
    status: ensureString(booking.status),
  };
}

export function serializeMessage(message: any): any {
  if (!message) return message;

  return {
    ...message,
    status: ensureString(message.status),
  };
}

export function serializeComplaint(complaint: any): any {
  if (!complaint) return complaint;

  return {
    ...complaint,
    type: ensureString(complaint.type),
    status: ensureString(complaint.status),
    priority: complaint.priority ? String(complaint.priority) : null,
  };
}

export function serializeReview(review: any): any {
  if (!review) return review;

  return {
    ...review,
  };
}
