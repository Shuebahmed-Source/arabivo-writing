# Database Structure

## users
Stores user accounts.

Fields:
- id
- clerk_id
- created_at

## lessons
Stores lesson information.

Fields:
- id
- title
- unit
- order

## lesson_items
Stores letters or words within lessons.

Fields:
- id
- lesson_id
- arabic_text
- transliteration
- english_meaning
- order

## user_progress
Tracks lesson completion.

Fields:
- id
- user_id
- lesson_id
- completed
- score
- created_at

## user_attempts
Stores individual writing attempts.

Fields:
- id
- user_id
- lesson_item_id
- score
- created_at
