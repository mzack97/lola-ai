// LOLA AI — database schema (PostgreSQL, Drizzle ORM)
import { pgTable, pgEnum, text, timestamp, integer, boolean, primaryKey, index, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { randomUUID } from "crypto";

const id = () => text("id").primaryKey().$defaultFn(() => randomUUID());
const created = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

export const roleEnum = pgEnum("role", ["STUDENT", "TEACHER", "ADMIN"]);
export const userStatusEnum = pgEnum("user_status", ["ACTIVE", "BLOCKED"]);
export const enrollStatusEnum = pgEnum("enroll_status", ["PENDING", "APPROVED", "REJECTED"]);

export const users = pgTable("users", {
  id: id(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull().unique(), // +998XXXXXXXXX — login
  passwordHash: text("password_hash").notNull(),
  birthDate: timestamp("birth_date", { mode: "date" }),
  region: text("region"),
  district: text("district"),
  role: roleEnum("role").notNull().default("STUDENT"),
  status: userStatusEnum("status").notNull().default("ACTIVE"),
  createdAt: created(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(), // random token (hashed) from cookie
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: created(),
}, (t) => [index("sessions_user_idx").on(t.userId)]);

export const categories = pgTable("categories", {
  id: id(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  order: integer("order").notNull().default(0),
});

export const courses = pgTable("courses", {
  id: id(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  categoryId: text("category_id").references(() => categories.id, { onDelete: "set null" }),
  summary: text("summary").notNull().default(""),
  description: text("description").notNull().default(""),
  coverUrl: text("cover_url"),
  format: text("format").notNull().default("Onlayn · Google Meet"),
  startDate: timestamp("start_date", { mode: "date" }),
  schedule: text("schedule").notNull().default(""),
  capacity: integer("capacity").notNull().default(30),
  autoApprove: boolean("auto_approve").notNull().default(false),
  published: boolean("published").notNull().default(false),
  createdAt: created(),
});

export const courseTeachers = pgTable("course_teachers", {
  courseId: text("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  teacherId: text("teacher_id").notNull().references(() => users.id, { onDelete: "cascade" }),
}, (t) => [primaryKey({ columns: [t.courseId, t.teacherId] })]);

export const enrollments = pgTable("enrollments", {
  id: id(),
  courseId: text("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  studentId: text("student_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: enrollStatusEnum("status").notNull().default("PENDING"),
  decidedById: text("decided_by_id").references(() => users.id, { onDelete: "set null" }),
  decidedAt: timestamp("decided_at", { withTimezone: true }),
  createdAt: created(),
}, (t) => [uniqueIndex("enroll_course_student").on(t.courseId, t.studentId)]);

export const sections = pgTable("sections", {
  id: id(),
  courseId: text("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  order: integer("order").notNull().default(0),
  visible: boolean("visible").notNull().default(true),
  createdAt: created(),
});

export const lessons = pgTable("lessons", {
  id: id(),
  sectionId: text("section_id").notNull().references(() => sections.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  meetUrl: text("meet_url").notNull(),
  createdById: text("created_by_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: created(),
});

export const messages = pgTable("messages", {
  id: id(),
  sectionId: text("section_id").notNull().references(() => sections.id, { onDelete: "cascade" }),
  authorId: text("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  pinned: boolean("pinned").notNull().default(false),
  createdAt: created(),
}, (t) => [index("messages_section_idx").on(t.sectionId, t.createdAt)]);

export const materials = pgTable("materials", {
  id: id(),
  sectionId: text("section_id").notNull().references(() => sections.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  url: text("url").notNull(),
  isFile: boolean("is_file").notNull().default(false),
  uploadedById: text("uploaded_by_id").references(() => users.id, { onDelete: "set null" }),
  createdAt: created(),
});

export const news = pgTable("news", {
  id: id(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull().default(""),
  body: text("body").notNull().default(""),
  coverUrl: text("cover_url"),
  published: boolean("published").notNull().default(false),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: created(),
});

export const landingBlocks = pgTable("landing_blocks", {
  id: id(),
  key: text("key").notNull().unique(), // hero, about, freelance, marketplace, contacts
  title: text("title").notNull(),
  text: text("text").notNull().default(""),
  imageUrl: text("image_url"),
  order: integer("order").notNull().default(0),
  visible: boolean("visible").notNull().default(true),
});

export const teamMembers = pgTable("team_members", {
  id: id(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  photoUrl: text("photo_url"),
  order: integer("order").notNull().default(0),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

/* relations */
export const usersRel = relations(users, ({ many }) => ({ teaching: many(courseTeachers), enrollments: many(enrollments) }));
export const coursesRel = relations(courses, ({ one, many }) => ({
  category: one(categories, { fields: [courses.categoryId], references: [categories.id] }),
  teachers: many(courseTeachers), enrollments: many(enrollments), sections: many(sections),
}));
export const categoriesRel = relations(categories, ({ many }) => ({ courses: many(courses) }));
export const courseTeachersRel = relations(courseTeachers, ({ one }) => ({
  course: one(courses, { fields: [courseTeachers.courseId], references: [courses.id] }),
  teacher: one(users, { fields: [courseTeachers.teacherId], references: [users.id] }),
}));
export const enrollmentsRel = relations(enrollments, ({ one }) => ({
  course: one(courses, { fields: [enrollments.courseId], references: [courses.id] }),
  student: one(users, { fields: [enrollments.studentId], references: [users.id] }),
}));
export const sectionsRel = relations(sections, ({ one, many }) => ({
  course: one(courses, { fields: [sections.courseId], references: [courses.id] }),
  lessons: many(lessons), messages: many(messages), materials: many(materials),
}));
export const lessonsRel = relations(lessons, ({ one }) => ({ section: one(sections, { fields: [lessons.sectionId], references: [sections.id] }) }));
export const messagesRel = relations(messages, ({ one }) => ({
  section: one(sections, { fields: [messages.sectionId], references: [sections.id] }),
  author: one(users, { fields: [messages.authorId], references: [users.id] }),
}));
export const materialsRel = relations(materials, ({ one }) => ({ section: one(sections, { fields: [materials.sectionId], references: [sections.id] }) }));

export type User = typeof users.$inferSelect;
export type Course = typeof courses.$inferSelect;
