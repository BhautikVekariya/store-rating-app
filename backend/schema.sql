CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(60)  NOT NULL CHECK (char_length(name) >= 20),
  email      VARCHAR(255) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  address    VARCHAR(400) NOT NULL DEFAULT '',
  role       VARCHAR(10)  NOT NULL CHECK (role IN ('admin','user','owner')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stores (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(60)  NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  address    VARCHAR(400) NOT NULL DEFAULT '',
  owner_id   INT UNIQUE REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ratings (
  id         SERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  store_id   INT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  rating     SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, store_id)
);

CREATE INDEX IF NOT EXISTS idx_ratings_store ON ratings(store_id);
