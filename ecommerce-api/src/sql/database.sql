-- First, ensure the uuid-ossp extension is enabled (if not already)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    contact VARCHAR(15),
    avatar_url TEXT,
    role user_role DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create vendors table
CREATE TABLE vendors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(clerk_id),
    business_name VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    address TEXT NOT NULL,
    website VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for users table
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Create indexes for vendors table
CREATE INDEX idx_vendors_user_id ON vendors(user_id);
CREATE INDEX idx_vendors_is_active ON vendors(is_active);


-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for vendors table
CREATE TRIGGER update_vendors_updated_at
    BEFORE UPDATE ON vendors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


    -- Create products table
    CREATE TABLE products (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        vendor_id UUID NOT NULL REFERENCES vendors(id),
        name VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        quantity INTEGER NOT NULL,
        categories TEXT[] NOT NULL,
        images TEXT[] NOT NULL,
        brand VARCHAR(100),
        sku VARCHAR(50),
        featured BOOLEAN DEFAULT false,
        discount_percentage DECIMAL(5,2) DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes for better performance
    CREATE INDEX idx_products_vendor_id ON products(vendor_id);
    CREATE INDEX idx_products_is_active ON products(is_active);
    CREATE INDEX idx_products_categories ON products USING gin(categories);
    CREATE INDEX idx_products_price ON products(price);
    CREATE INDEX idx_products_created_at ON products(created_at);

    -- Insert sample data for testing
    INSERT INTO products (
        vendor_id,
        name,
        description,
        price,
        quantity,
        categories,
        images,
        brand,
        sku,
        featured,
        discount_percentage
    ) VALUES (
        '123e4567-e89b-12d3-a456-426614174000', -- Replace with actual vendor_id
        'Premium Wireless Headphones',
        'High-quality wireless headphones with noise cancellation',
        199.99,
        50,
        ARRAY['Electronics', 'Audio', 'Accessories'],
        ARRAY['https://example.com/images/headphones1.jpg', 'https://example.com/images/headphones2.jpg'],
        'SoundMaster',
        'SM-WH-001',
        true,
        10.00
    );

    -- Insert more sample products
    INSERT INTO products (
        vendor_id,
        name,
        description,
        price,
        quantity,
        categories,
        images,
        brand,
        sku
    ) VALUES (
        '123e4567-e89b-12d3-a456-426614174000', -- Replace with actual vendor_id
        'Smart Watch Pro',
        'Advanced smartwatch with health monitoring features',
        299.99,
        30,
        ARRAY['Electronics', 'Wearables', 'Smart Devices'],
        ARRAY['https://example.com/images/watch1.jpg'],
        'TechWear',
        'TW-SW-002'
    );
