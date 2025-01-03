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
    
    -- Vendor Status Logs
    CREATE TABLE vendor_status_logs (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        vendor_id UUID REFERENCES vendors(id),
        previous_status VARCHAR(50),
        new_status VARCHAR(50),
        reason TEXT,
        changed_by VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Vendor Announcements
    CREATE TABLE vendor_announcements (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        message TEXT NOT NULL,
        valid_until TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Vendor Announcement Recipients
    CREATE TABLE vendor_announcement_recipients (
        announcement_id UUID REFERENCES vendor_announcements(id),
        vendor_id UUID REFERENCES vendors(id),
        read_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (announcement_id, vendor_id)
    );
    
    -- Add indexes
    CREATE INDEX idx_vendor_status_logs_vendor_id ON vendor_status_logs(vendor_id);
    CREATE INDEX idx_vendor_announcements_valid_until ON vendor_announcements(valid_until);
    CREATE INDEX idx_vendor_announcement_recipients_vendor_id ON vendor_announcement_recipients(vendor_id);
    
    
    -- Add location columns to vendors table
    ALTER TABLE vendors ADD COLUMN digital_address VARCHAR(20);
    ALTER TABLE vendors ADD COLUMN latitude DECIMAL(10, 8);
    ALTER TABLE vendors ADD COLUMN longitude DECIMAL(11, 8);
    ALTER TABLE vendors ADD COLUMN location_verified BOOLEAN DEFAULT false;
    
    -- Create spatial index for faster location queries
    CREATE INDEX idx_vendors_location ON vendors USING GIST (
      ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
    );
    
    -- Create chat related tables
    CREATE TABLE chat_rooms (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        vendor_id UUID NOT NULL REFERENCES vendors(id),
        last_message TEXT,
        last_message_time TIMESTAMP WITH TIME ZONE,
        user_unread_count INTEGER DEFAULT 0,
        vendor_unread_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE chat_messages (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        room_id UUID NOT NULL REFERENCES chat_rooms(id),
        sender_type VARCHAR(10) NOT NULL, -- 'user' or 'vendor'
        sender_id VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        message_type VARCHAR(20) DEFAULT 'text', -- text, image, etc.
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX idx_chat_rooms_user_vendor ON chat_rooms(user_id, vendor_id);
    CREATE INDEX idx_chat_messages_room ON chat_messages(room_id);
    
    CREATE TABLE email_logs (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        recipient TEXT NOT NULL,
        status VARCHAR(50) NOT NULL,
        error TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX idx_email_logs_status ON email_logs(status);
    CREATE INDEX idx_email_logs_created_at ON email_logs(created_at);
    
    CREATE TABLE product_reviews (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        product_id UUID NOT NULL REFERENCES products(id),
        order_id UUID NOT NULL REFERENCES orders(id),
        rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        comment TEXT,
        images TEXT[],
        is_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Wishlists
    CREATE TABLE wishlists (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        product_id UUID NOT NULL REFERENCES products(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
    );
    
    -- Notifications
    CREATE TABLE notifications (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        metadata JSONB,
        read BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Promotions
    CREATE TABLE promotions (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        vendor_id UUID NOT NULL REFERENCES vendors(id),
        name VARCHAR(100) NOT NULL,
        description TEXT,
        discount_type VARCHAR(20) NOT NULL,
        discount_value DECIMAL(10,2) NOT NULL,
        start_date TIMESTAMP WITH TIME ZONE NOT NULL,
        end_date TIMESTAMP WITH TIME ZONE NOT NULL,
        minimum_purchase DECIMAL(10,2),
        max_uses INTEGER,
        uses_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE promotion_products (
        promotion_id UUID REFERENCES promotions(id),
        product_id UUID REFERENCES products(id),
        PRIMARY KEY (promotion_id, product_id)
    );
    
    CREATE TYPE discount_type AS ENUM ('percentage', 'fixed');
    CREATE TYPE promotion_status AS ENUM ('draft', 'active', 'scheduled', 'expired', 'cancelled');
    
    -- Promotions Table
    CREATE TABLE promotions (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        vendor_id UUID NOT NULL REFERENCES vendors(id),
        name VARCHAR(100) NOT NULL,
        description TEXT,
        discount_type discount_type NOT NULL,
        discount_value DECIMAL(10,2) NOT NULL,
        start_date TIMESTAMP WITH TIME ZONE NOT NULL,
        end_date TIMESTAMP WITH TIME ZONE NOT NULL,
        minimum_purchase DECIMAL(10,2),
        max_uses INTEGER,
        is_public BOOLEAN DEFAULT false,
        status promotion_status NOT NULL DEFAULT 'draft',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Promotion Products (for product-specific promotions)
    CREATE TABLE promotion_products (
        promotion_id UUID REFERENCES promotions(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (promotion_id, product_id)
    );
    
    -- Promotion Uses (tracking promotion usage)
    CREATE TABLE promotion_uses (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        promotion_id UUID REFERENCES promotions(id),
        order_id UUID REFERENCES orders(id),
        user_id VARCHAR(255) NOT NULL,
        discount_amount DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Add order-related promotion columns
    ALTER TABLE orders ADD COLUMN promotion_id UUID REFERENCES promotions(id);
    ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(10,2) DEFAULT 0;
    ALTER TABLE orders ADD COLUMN final_amount DECIMAL(10,2);
    
    -- Indexes for better performance
    CREATE INDEX idx_promotions_vendor ON promotions(vendor_id);
    CREATE INDEX idx_promotions_status ON promotions(status);
    CREATE INDEX idx_promotions_dates ON promotions(start_date, end_date);
    CREATE INDEX idx_promotion_uses_promotion ON promotion_uses(promotion_id);
    CREATE INDEX idx_promotion_uses_user ON promotion_uses(user_id);
    
    -- Trigger to automatically update status based on dates
    CREATE OR REPLACE FUNCTION update_promotion_status()
    RETURNS TRIGGER AS $$
    BEGIN
        IF NEW.end_date < CURRENT_TIMESTAMP THEN
            NEW.status = 'expired';
        ELSIF NEW.start_date > CURRENT_TIMESTAMP THEN
            NEW.status = 'scheduled';
        ELSIF NEW.start_date <= CURRENT_TIMESTAMP AND NEW.end_date >= CURRENT_TIMESTAMP THEN
            NEW.status = 'active';
        END IF;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    
    CREATE TRIGGER promotion_status_update
        BEFORE INSERT OR UPDATE ON promotions
        FOR EACH ROW
        EXECUTE FUNCTION update_promotion_status();
    
    -- Function to clean up expired promotions
    CREATE OR REPLACE FUNCTION cleanup_expired_promotions()
    RETURNS void AS $$
    BEGIN
        UPDATE promotions
        SET status = 'expired'
        WHERE status = 'active'
        AND end_date < CURRENT_TIMESTAMP;
    END;
    $$ LANGUAGE plpgsql;