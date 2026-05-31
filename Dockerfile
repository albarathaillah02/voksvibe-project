# Menggunakan image PHP 8.2
FROM php:8.2-fpm

# Install dependencies sistem
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zip \
    unzip \
    git \
    curl

# Install PHP extensions untuk Laravel
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd pdo pdo_mysql

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Install Node.js untuk React/Inertia
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs

WORKDIR /var/www

COPY . .

# Install dependencies Laravel dan React
RUN composer install --no-dev --optimize-autoloader
RUN npm install && npm run build

# Menjalankan aplikasi
EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]