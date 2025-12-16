import { and, eq } from "drizzle-orm";
import { customAlphabet } from "nanoid";

import type { InsertLocation } from "../schema";

import db from "..";
import { location } from "../schema";

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 5);

export async function findLocations(userId: number) {
  return db.select().from(location).where(eq(location.userId, userId));
}

export async function findLocationByName(existing: InsertLocation, userId: number) {
  const existingRows = await db.select().from(location).where(and(
    eq(location.name, existing.name),
    eq(location.userId, userId),
  )).limit(1);
  const existingLocation = existingRows[0] ?? null;
  return existingLocation;
}

export async function findLocationBySlug(slug: string) {
  const slugRows = await db.select().from(location).where(eq(location.slug, slug)).limit(1);
  return slugRows.length > 0;
}

export async function findUniqueSlug(slug: string) {
  let existing = !!(await findLocationBySlug(slug));

  while (existing) {
    const id = nanoid();
    const idSlug = `${slug}-${id}`;
    existing = !!(await findLocationBySlug(idSlug));
    if (!existing) {
      return idSlug;
    }
  }

  return slug;
}

export async function insertLocation(insertable: InsertLocation, slug: string, userId: number) {
  const [created] = await db.insert(location).values({
    ...insertable,
    slug,
    userId,
  }).returning();
  return created;
}
