import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const materials = sqliteTable('materials', {
  id: text('id').primaryKey(),
  filename: text('filename').notNull(),
  contentType: text('content_type').notNull(),
  objectKey: text('object_key').notNull(),
  status: text('status').notNull().default('ready'),
  createdAt: integer('created_at').notNull(),
});

export const studySets = sqliteTable('study_sets', {
  id: text('id').primaryKey(),
  materialId: text('material_id').references(() => materials.id),
  title: text('title').notNull(),
  subject: text('subject').notNull().default('General'),
  cardsJson: text('cards_json').notNull(),
  createdAt: integer('created_at').notNull(),
});
