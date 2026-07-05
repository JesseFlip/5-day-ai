import { pgTable, text, integer, timestamp, smallint } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user ID
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
  locale: text("locale").notNull().default("en"),
  darkMode: text("dark_mode").notNull().default("system"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const modules = pgTable("modules", {
  id: integer("id").primaryKey(), // 1–5 matching course days
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  focusSummary: text("focus_summary").notNull(),
  podcastUrl: text("podcast_url").notNull(),
  whitepaperUrl: text("whitepaper_url").notNull(),
  order: integer("order").notNull(),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
});

export const steps = pgTable("steps", {
  id: text("id").primaryKey(),
  moduleId: integer("module_id").notNull().references(() => modules.id),
  type: text("type").notNull(), // 'podcast' | 'whitepaper' | 'codelab' | 'capstone'
  title: text("title").notNull(),
  description: text("description").notNull(),
  externalUrl: text("external_url"),
  estimatedMinutes: integer("estimated_minutes").notNull(),
  difficulty: text("difficulty").notNull(), // 'beginner' | 'intermediate' | 'advanced'
  order: integer("order").notNull(),
});

export const progress = pgTable("progress", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  stepId: text("step_id").notNull().references(() => steps.id),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export const tutorMessages = pgTable("tutor_messages", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  moduleId: integer("module_id").notNull().references(() => modules.id),
  role: text("role").notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const hintReveal = pgTable("hint_reveal", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  stepId: text("step_id").notNull().references(() => steps.id),
  tier: smallint("tier").notNull(), // 1–4
  revealedAt: timestamp("revealed_at").defaultNow().notNull(),
});

export const hintContent = pgTable("hint_content", {
  id: text("id").primaryKey(),
  stepId: text("step_id").notNull().references(() => steps.id),
  tier: smallint("tier").notNull(),
  content: text("content").notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
});
