-- Create Users Table (Admin, Cashier, Customer)
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'cashier', 'customer') NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Product Categories Table
CREATE TABLE product_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Products Table
CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL UNIQUE,
    category_id INT NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    stock_quantity INT NOT NULL CHECK (stock_quantity >= 0),
    description TEXT DEFAULT NULL,
    image_url VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES product_categories(category_id) ON DELETE CASCADE
);

ALTER TABLE products
MODIFY gst DECIMAL(5,2) NOT NULL DEFAULT 0.00 CHECK (gst >= 0 AND gst <= 300),
MODIFY c_gst DECIMAL(5,2) NOT NULL DEFAULT 0.00 CHECK (c_gst >= 0 AND c_gst <= 300),
MODIFY s_gst DECIMAL(5,2) NOT NULL DEFAULT 0.00 CHECK (s_gst >= 0 AND s_gst <= 300);

ALTER TABLE products
ADD COLUMN discount_price DECIMAL(10, 2) AS (
  ROUND(price - (price * discount / 100), 2)
) STORED;

ALTER TABLE products
ADD COLUMN discount DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (discount >= 0 AND discount <= 100);

CREATE TABLE invoices (
    invoice_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT, -- Can be null if anonymous
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    invoice_date DATE NOT NULL,
    place_of_supply VARCHAR(255),
    vehicle_number VARCHAR(50),
    
    subtotal DECIMAL(10,2),
    gst_percentage DECIMAL(5,2),
    gst_amount DECIMAL(10,2),
    cgst_amount DECIMAL(10,2),
    sgst_amount DECIMAL(10,2),
    discount_type ENUM('%', 'flat') DEFAULT '%',
    discount_value DECIMAL(10,2),
    transport_charge DECIMAL(10,2),
    total_amount DECIMAL(10,2),

    created_by INT, -- user_id of the admin or cashier
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

CREATE TABLE invoice_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    product_id INT NOT NULL,
    hsn_code VARCHAR(50),
    quantity INT NOT NULL,
    unit VARCHAR(50),
    rate DECIMAL(10,2),
    gst_percentage DECIMAL(5,2),
    base_amount DECIMAL(10,2),
    total_with_gst DECIMAL(10,2),

    FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(20),
    gst_number VARCHAR(20),
    address TEXT,
    state VARCHAR(100),
    pincode VARCHAR(10),
    place_of_supply VARCHAR(255),
    vehicle_number VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stock_movements (
    movement_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    change_type ENUM('IN', 'OUT') NOT NULL,  -- IN: Stock added, OUT: Stock reduced
    quantity_changed INT NOT NULL CHECK (quantity_changed > 0),
    old_stock INT NOT NULL CHECK (old_stock >= 0),
    new_stock INT NOT NULL CHECK (new_stock >= 0),
    reason VARCHAR(255) DEFAULT NULL,  -- e.g. "Invoice #123", "Manual restock"
    reference_id VARCHAR(100) DEFAULT NULL,  -- optional invoice_id, restock_id, etc.
    updated_by VARCHAR(100) DEFAULT NULL,  -- optional user/employee name or ID
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

CREATE TABLE company_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    company_logo VARCHAR(255), -- store image filename or path
    address TEXT,
    cell_no1 VARCHAR(15),
    cell_no2 VARCHAR(15),
    gst_no VARCHAR(20),
    pan_no VARCHAR(20),
    account_name VARCHAR(100),
    bank_name VARCHAR(100),
    branch_name VARCHAR(100),
    ifsc_code VARCHAR(20),
    account_number VARCHAR(30),
    email VARCHAR(100),
    website VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

{/* Additional Un-used table */}
{/* Additional Un-used table */}
{/* Additional Un-used table */}
{/* Additional Un-used table */}
{/* Additional Un-used table */}
{/* Additional Un-used table */}
{/* Additional Un-used table */}
{/* Additional Un-used table */}
{/* Additional Un-used table */}

ALTER TABLE products
ADD COLUMN discount_price DECIMAL(10, 2) AS (
  ROUND(price - (price * discount / 100), 2)
) STORED;

ALTER TABLE products
ADD COLUMN discount DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (discount >= 0 AND discount <= 100);