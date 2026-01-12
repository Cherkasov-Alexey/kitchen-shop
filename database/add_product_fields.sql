-- Добавление недостающих полей в таблицу products

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS specifications TEXT,
ADD COLUMN IF NOT EXISTS warranty TEXT,
ADD COLUMN IF NOT EXISTS images TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT (NOW() AT TIME ZONE 'UTC' + INTERVAL '3 hour');

-- Обновление существующих записей с изображениями
UPDATE products SET images = 'images/holodilnik_1/holodilnik_1_1.png,images/holodilnik_1/holodilnik_1_2.png,images/holodilnik_1/holodilnik_1_3.png' WHERE id = 1;
UPDATE products SET images = 'images/kofemashina_1/kofemashina_1_1.png,images/kofemashina_1/kofemashina_1_2.png,images/kofemashina_1/kofemashina_1_3.png' WHERE id = 2;
UPDATE products SET images = 'images/posudomoechnaya_1/posudomoechnaya_1_1.png,images/posudomoechnaya_1/posudomoechnaya_1_2.png,images/posudomoechnaya_1/posudomoechnaya_1_3.png' WHERE id = 3;
UPDATE products SET images = 'images/holodilnik_2/holodilnik_2_1.png,images/holodilnik_2/holodilnik_2_2.png,images/holodilnik_2/holodilnik_2_3.png' WHERE id = 4;
UPDATE products SET images = 'images/holodilnik_3/holodilnik_3_1.png,images/holodilnik_3/holodilnik_3_2.png,images/holodilnik_3/holodilnik_3_3.png' WHERE id = 5;
UPDATE products SET images = 'images/kofemashina_2/kofemashina_2_1.png,images/kofemashina_2/kofemashina_2_2.png,images/kofemashina_2/kofemashina_2_3.png' WHERE id = 6;
UPDATE products SET images = 'images/kofemashina_3/kofemashina_3_1.png,images/kofemashina_3/kofemashina_3_2.png,images/kofemashina_3/kofemashina_3_3.png' WHERE id = 7;
UPDATE products SET images = 'images/posudomoechnaya_2/posudomoechnaya_2_1.png,images/posudomoechnaya_2/posudomoechnaya_2_2.png,images/posudomoechnaya_2/posudomoechnaya_2_3.png' WHERE id = 8;
UPDATE products SET images = 'images/posudomoechnaya_3/posudomoechnaya_3_1.png,images/posudomoechnaya_3/posudomoechnaya_3_2.png,images/posudomoechnaya_3/posudomoechnaya_3_3.png' WHERE id = 9;

-- Добавление описаний и характеристик
UPDATE products SET 
    description = 'Современный холодильник с инновационными технологиями сохранения свежести продуктов. No Frost система предотвращает образование льда.',
    specifications = 'Объем: 310 л, Энергопотребление: 203 кВтч/год, Класс энергопотребления: A++, Размеры: 185×60×65 см',
    warranty = 'Гарантия производителя 3 года. Бесплатное сервисное обслуживание.'
WHERE id = 1;

UPDATE products SET 
    description = 'Автоматическая кофемашина с технологией LatteCrema для идеального капучино. Простое управление одной кнопкой.',
    specifications = 'Мощность: 1450 Вт, Давление: 15 бар, Емкость резервуара: 1.8 л, Автоматическое приготовление',
    warranty = 'Гарантия 2 года. Официальная гарантия производителя.'
WHERE id = 2;

UPDATE products SET 
    description = 'Посудомоечная машина с технологией AirDry для естественной сушки посуды. 13 комплектов посуды.',
    specifications = 'Количество комплектов: 13, Расход воды: 9.9 л, Уровень шума: 44 дБ, Класс энергопотребления: A+++',
    warranty = 'Гарантия 3 года. Круглосуточная поддержка.'
WHERE id = 3;

UPDATE products SET 
    description = 'Холодильник премиум-класса с инверторным компрессором и технологией Door Cooling+.',
    specifications = 'Объем: 384 л, Энергопотребление: 248 кВтч/год, Класс: A++, Размеры: 190×68×73 см',
    warranty = 'Расширенная гарантия 5 лет на компрессор.'
WHERE id = 4;

UPDATE products SET 
    description = 'Элегантный холодильник Side-by-Side с зоной свежести и диспенсером для воды и льда.',
    specifications = 'Объем: 545 л, Технология No Frost, Диспенсер воды, Размеры: 178×91×72 см',
    warranty = 'Гарантия 3 года, расширенная до 10 лет на компрессор.'
WHERE id = 5;

UPDATE products SET 
    description = 'Компактная кофемашина с капучинатором и возможностью приготовления двух чашек одновременно.',
    specifications = 'Мощность: 1260 Вт, Давление: 15 бар, Емкость: 1.2 л, Керамические жернова',
    warranty = 'Гарантия 2 года от производителя.'
WHERE id = 6;

UPDATE products SET 
    description = 'Продвинутая кофемашина с сенсорным управлением и функцией One Touch Cappuccino.',
    specifications = 'Мощность: 1850 Вт, Давление: 19 бар, 15 программ, Подключение к воде',
    warranty = 'Гарантия 2 года, сервисное обслуживание включено.'
WHERE id = 7;

UPDATE products SET 
    description = 'Встраиваемая посудомоечная машина с технологией PowerDry и программой TimeLight.',
    specifications = 'Количество комплектов: 14, Расход воды: 8.5 л, Уровень шума: 42 дБ, Класс: A+++',
    warranty = 'Гарантия 3 года.'
WHERE id = 8;

UPDATE products SET 
    description = 'Полноразмерная посудомоечная машина с технологией AquaStop и защитой от протечек.',
    specifications = 'Количество комплектов: 12, Расход воды: 10 л, Уровень шума: 46 дБ, 6 программ',
    warranty = 'Гарантия 2 года с возможностью продления.'
WHERE id = 9;
