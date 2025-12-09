import type { DrizzleQueryError } from "drizzle-orm";

import { and, eq } from "drizzle-orm";
import { customAlphabet } from "nanoid";
import slugify from "slug";

import db from "~/lib/db";
import { InsertLocation, location } from "~/lib/db/schema";

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 5);

export default defineEventHandler(async (event) => {
  if (!event.context.user) {
    return sendError(event, createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    }));
  }

  const result = await readValidatedBody(event, InsertLocation.safeParse);

  if (!result.success) {
    const statusMessage = result
      .error
      .issues
      .map(issue => `${issue.path.join("")}: ${issue.message}`)
      .join("; ");

    const data = result
      .error
      .issues
      .reduce((errors, issue) => {
        errors[issue.path.join("")] = issue.message;
        return errors;
      }, {} as Record<string, string>);

    return sendError(event, createError({
      statusCode: 422,
      statusMessage,
      data,
    }));
  }

  const existingRows = await db.select().from(location).where(and(
    eq(location.name, result.data.name),
    eq(location.userId, event.context.user.id),
  )).limit(1);
  const existingLocation = existingRows[0] ?? null;

  if (existingLocation) {
    return sendError(event, createError({
      statusCode: 409,
      statusMessage: "You already have a location with this name.",
    }));
  }

  let slug = slugify(result.data.name);

  const slugRows = await db.select().from(location).where(eq(location.slug, slug)).limit(1);
  let existing = slugRows.length > 0;

  while (existing) {
    const id = nanoid();
    const idSlug = `${slug}-${id}`;
    const idRows = await db.select().from(location).where(eq(location.slug, idSlug)).limit(1);
    existing = idRows.length > 0;
    if (!existing) {
      slug = idSlug;
    }
  }

  try {
    const [created] = await db.insert(location).values({
      ...result.data,
      slug: slugify(result.data.name),
      userId: event.context.user.id,
    }).returning();
    return created;
  }
  catch (e) {
    const error = e as DrizzleQueryError;
    if (error.cause && error.cause.message === "SQLITE_CONSTRAINT: SQLite error: UNIQUE constraint failed: location.slug") {
      return sendError(event, createError({
        statusCode: 409,
        statusMessage: "Slug must be unique (the location name is used to generate the slug).",
      }));
    }
    throw error;
  }
});
