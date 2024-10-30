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

    -- Subscription Plans Table
    CREATE TABLE subscription_plans (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        description TEXT,
        price_monthly DECIMAL(10,2) NOT NULL,
        price_yearly DECIMAL(10,2) NOT NULL,
        product_limit INTEGER,
        features JSONB,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Vendor Subscriptions Table
    CREATE TABLE vendor_subscriptions (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        vendor_id UUID NOT NULL REFERENCES vendors(id),
        plan_id UUID NOT NULL REFERENCES subscription_plans(id),
        status VARCHAR(20) NOT NULL, -- active, expired, cancelled
        billing_cycle VARCHAR(10) NOT NULL, -- monthly, yearly
        start_date TIMESTAMP WITH TIME ZONE NOT NULL,
        end_date TIMESTAMP WITH TIME ZONE NOT NULL,
        last_payment_date TIMESTAMP WITH TIME ZONE,
        next_payment_date TIMESTAMP WITH TIME ZONE,
        paystack_subscription_code VARCHAR(100),
        paystack_email_token VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Subscription Transactions Table
    CREATE TABLE subscription_transactions (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        vendor_subscription_id UUID NOT NULL REFERENCES vendor_subscriptions(id),
        vendor_id UUID NOT NULL REFERENCES vendors(id),
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'NGN',
        paystack_reference VARCHAR(100) NOT NULL,
        status VARCHAR(20) NOT NULL, -- success, failed, pending
        payment_method VARCHAR(50),
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    
    INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, product_limit, features) VALUES
    (
        'Free',
        'Basic features with limited product listings',
        0,
        0,
        15,
        '{"support": "email", "features": ["Basic analytics", "Standard support"]}'
    ),
    (
        'Basic',
        'Enhanced features with more product listings',
        5000,
        50000,
        30,
        '{"support": "email,chat", "features": ["Advanced analytics", "Priority support", "Custom shop URL"]}'
    ),
    (
        'Premium',
        'Full access to all features with unlimited products',
        10000,
        100000,
        NULL, -- NULL means unlimited
        '{"support": "email,chat,phone", "features": ["Premium analytics", "24/7 support", "Custom shop URL", "Featured listings"]}'
    );
    
-- Delivery Zones Table
    CREATE TABLE delivery_zones (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        region VARCHAR(100) NOT NULL,
        base_fee DECIMAL(10,2) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Vendor Delivery Settings
    CREATE TABLE vendor_delivery_settings (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        vendor_id UUID REFERENCES vendors(id),
        zone_id UUID REFERENCES delivery_zones(id),
        additional_fee DECIMAL(10,2) DEFAULT 0,
        minimum_order_amount DECIMAL(10,2),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    
    -- Shopping Cart
    CREATE TABLE shopping_carts (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Cart Items
    CREATE TABLE cart_items (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        cart_id UUID REFERENCES shopping_carts(id),
        product_id UUID REFERENCES products(id),
        quantity INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Orders
    CREATE TABLE orders (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        delivery_fee DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        delivery_address TEXT NOT NULL,
        contact_phone VARCHAR(20) NOT NULL,
        payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
        payment_reference VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Order Items (Products from different vendors)
    CREATE TABLE order_items (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        order_id UUID REFERENCES orders(id),
        vendor_id UUID REFERENCES vendors(id),
        product_id UUID REFERENCES products(id),
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        delivery_fee DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        tracking_number VARCHAR(100),
        estimated_delivery_date TIMESTAMP WITH TIME ZONE,
        actual_delivery_date TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Vendor Settlements
    CREATE TABLE vendor_settlements (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        vendor_id UUID REFERENCES vendors(id),
        order_item_id UUID REFERENCES order_items(id),
        amount DECIMAL(10,2) NOT NULL,
        fee DECIMAL(10,2) NOT NULL,
        net_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        payment_reference VARCHAR(100),
        paid_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Delivery Tracking
    CREATE TABLE delivery_tracking (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        order_item_id UUID REFERENCES order_items(id),
        status VARCHAR(50) NOT NULL,
        location TEXT,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Add location columns to vendors table
    ALTER TABLE vendors ADD COLUMN digital_address VARCHAR(20);
    ALTER TABLE vendors ADD COLUMN latitude DECIMAL(10, 8);
    ALTER TABLE vendors ADD COLUMN longitude DECIMAL(11, 8);
    ALTER TABLE vendors ADD COLUMN location_verified BOOLEAN DEFAULT false;
    ALTER TABLE vendors ADD COLUMN shop_images TEXT[];
    ALTER TABLE vendors ADD COLUMN opening_hours JSONB;
    ALTER TABLE vendors ADD COLUMN shop_category VARCHAR(100);
    ALTER TABLE vendors ADD COLUMN shop_tags TEXT[];
    ALTER TABLE vendors ADD COLUMN average_rating DECIMAL(3,2);
    ALTER TABLE vendors ADD COLUMN total_ratings INTEGER DEFAULT 0;
    
    -- Create shop reviews table
    CREATE TABLE shop_reviews (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        vendor_id UUID REFERENCES vendors(id),
        user_id VARCHAR(255) NOT NULL,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        review_text TEXT,
        images TEXT[],
        is_verified_purchase BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Create vendor operating hours table
    CREATE TABLE vendor_operating_hours (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        vendor_id UUID REFERENCES vendors(id),
        day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6),
        open_time TIME,
        close_time TIME,
        is_closed BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );