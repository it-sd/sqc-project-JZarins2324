\encoding UTF8
DROP TABLE IF EXISTS character;
DROP TABLE IF EXISTS item;
DROP TABLE IF EXISTS ability;

CREATE TABLE character (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  descrip TEXT NOT NULL,
  info TEXT NOT NULL,
  image TEXT,
  ability INTEGER
);

CREATE TABLE item (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  descrip TEXT NOT NULL,
  info TEXT NOT NULL,
  image TEXT,
  ability INTEGER
);

CREATE TABLE ability (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  info TEXT NOT NULL,
  image TEXT
);

INSERT INTO character (name, descrip, info, ability)
  VALUES
  ('Tiredman', 'A tall lanky man. Always tired and wrapped in a blanket.', 'After he was sleep deprived for 3783 years, he awakened super natural powers. He uses his newfound powers to do as little work as possible.', 3);

INSERT INTO item (name, descrip, info, ability)
  VALUES
  ('Textbook', 'A shiny textbook', 'A required textbook for a specific course', 2);

INSERT INTO ability (name, info)
  VALUES
  ('None', 'Can do nothing special'),
  ('Knowledge Transfer', 'Allows the transfer of knowledge from one source to another');
  ('Telekinesis', 'Psychic ability allowing a person to influence a physical system without physical interaction.')