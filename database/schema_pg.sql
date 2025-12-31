-- PostgreSQL schema for Kitchen Shop (compatible with backend)

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  user_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC' + INTERVAL '3 hour')
);

-- Таблица категорий
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  category_name VARCHAR(255) NOT NULL UNIQUE
);

-- Таблица товаров
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  product_name VARCHAR(255) NOT NULL,
  old_price NUMERIC(10,2),
  price NUMERIC(10,2) NOT NULL,
  description TEXT,
  specifications TEXT,
  warranty TEXT,
  images TEXT,
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC' + INTERVAL '3 hour')
);

-- Таблица избранного
CREATE TABLE IF NOT EXISTS favorites (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  added_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC' + INTERVAL '3 hour'),
  UNIQUE (user_id, product_id)
);

-- Таблица корзины
CREATE TABLE IF NOT EXISTS cart (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1,
  total NUMERIC(10,2) NOT NULL,
  added_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC' + INTERVAL '3 hour'),
  UNIQUE (user_id, product_id)
);

-- Таблица заказов
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total NUMERIC(10,2) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  delivery_address TEXT,
  status VARCHAR(32) DEFAULT 'pending',
  payment_method VARCHAR(64),
  comment TEXT,
  customer_name VARCHAR(255),
  customer_phone VARCHAR(50),
  customer_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC' + INTERVAL '3 hour'),
  updated_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC' + INTERVAL '3 hour')
);

-- Товары в заказах
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(id),
  quantity INT NOT NULL,
  price NUMERIC(10,2) NOT NULL
);

-- Отзывы
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  product_id INT NOT NULL REFERENCES products(id),
  rating INT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC' + INTERVAL '3 hour')
);

-- Заполнение категорий
INSERT INTO categories (id, name) VALUES
(1, 'Холодильники'),
(2, 'Кофемашины'),
(3, 'Посудомоечные машины')
ON CONFLICT DO NOTHING;

-- Заполнение товаров (упрощённо):
INSERT INTO products (id, name, old_price, new_price, description, specifications, warranty, images, category_id) VALUES
(1, 'Холодильник Aceline B16AMG', 17999.00, 14999.00, 'Холодильник...', 'Энергопотребление: 203 кВтч/год', 'Гарантия 3 года', 'images/holodilnik_1/holodilnik_1_1.png', 1)
ON CONFLICT DO NOTHING;
