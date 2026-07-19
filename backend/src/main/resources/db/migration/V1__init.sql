CREATE TABLE public.cart_items (
    quantity integer NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    cart_id uuid NOT NULL,
    id uuid NOT NULL,
    variant_id uuid NOT NULL
);
CREATE TABLE public.carts (
    created_at timestamp(6) with time zone NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    id uuid NOT NULL,
    user_id uuid NOT NULL
);
CREATE TABLE public.categories (
    created_at timestamp(6) with time zone NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    id uuid NOT NULL,
    description character varying(255),
    name character varying(255) NOT NULL,
    slug character varying(255) NOT NULL
);
CREATE TABLE public.order_items (
    quantity integer NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    id uuid NOT NULL,
    order_id uuid NOT NULL,
    product_id uuid,
    seller_id uuid NOT NULL,
    variant_id uuid,
    image_url character varying(255),
    product_title character varying(255) NOT NULL,
    sku character varying(255) NOT NULL,
    variant_name character varying(255) NOT NULL
);
CREATE TABLE public.orders (
    paid boolean NOT NULL,
    shipping_fee numeric(12,2) NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    total numeric(12,2) NOT NULL,
    cancelled_at timestamp(6) with time zone,
    created_at timestamp(6) with time zone NOT NULL,
    delivered_at timestamp(6) with time zone,
    placed_at timestamp(6) with time zone,
    return_requested_at timestamp(6) with time zone,
    shipped_at timestamp(6) with time zone,
    updated_at timestamp(6) with time zone NOT NULL,
    customer_id uuid NOT NULL,
    id uuid NOT NULL,
    return_reason character varying(1000),
    currency character varying(255) NOT NULL,
    order_number character varying(255) NOT NULL,
    razorpay_order_id character varying(255),
    razorpay_payment_id character varying(255),
    return_status character varying(255) NOT NULL,
    ship_city character varying(255),
    ship_line1 character varying(255),
    ship_line2 character varying(255),
    ship_name character varying(255),
    ship_phone character varying(255),
    ship_postal_code character varying(255),
    ship_state character varying(255),
    status character varying(255) NOT NULL,
    CONSTRAINT orders_return_status_check CHECK (((return_status)::text = ANY ((ARRAY['NONE'::character varying, 'REQUESTED'::character varying, 'APPROVED'::character varying, 'REJECTED'::character varying, 'COMPLETED'::character varying])::text[]))),
    CONSTRAINT orders_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING_PAYMENT'::character varying, 'PLACED'::character varying, 'CONFIRMED'::character varying, 'SHIPPED'::character varying, 'DELIVERED'::character varying, 'CANCELLED'::character varying, 'RETURN_REQUESTED'::character varying, 'RETURNED'::character varying])::text[])))
);
CREATE TABLE public.product_images (
    "position" integer NOT NULL,
    id uuid NOT NULL,
    product_id uuid NOT NULL,
    url character varying(255) NOT NULL
);
CREATE TABLE public.product_variants (
    price numeric(12,2) NOT NULL,
    stock integer NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    id uuid NOT NULL,
    product_id uuid NOT NULL,
    color character varying(255),
    name character varying(255) NOT NULL,
    size character varying(255),
    sku character varying(255) NOT NULL
);
CREATE TABLE public.products (
    base_price numeric(12,2) NOT NULL,
    featured boolean NOT NULL,
    rating_avg numeric(3,2) NOT NULL,
    rating_count integer NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    category_id uuid,
    id uuid NOT NULL,
    seller_id uuid NOT NULL,
    description character varying(4000),
    status character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    CONSTRAINT products_status_check CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'ACTIVE'::character varying, 'ARCHIVED'::character varying])::text[])))
);
CREATE TABLE public.reviews (
    rating integer NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    id uuid NOT NULL,
    product_id uuid NOT NULL,
    user_id uuid NOT NULL,
    comment character varying(2000)
);
CREATE TABLE public.users (
    created_at timestamp(6) with time zone NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    id uuid NOT NULL,
    email character varying(255) NOT NULL,
    full_name character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(255) NOT NULL,
    shop_name character varying(255),
    status character varying(255) NOT NULL,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['CUSTOMER'::character varying, 'SELLER'::character varying, 'ADMIN'::character varying])::text[]))),
    CONSTRAINT users_status_check CHECK (((status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'BLACKLISTED'::character varying])::text[])))
);
ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_user_id_key UNIQUE (user_id);
ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);
ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);
ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT product_variants_sku_key UNIQUE (sku);
ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_product_id_user_id_key UNIQUE (product_id, user_id);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT fk5yyw1o0dor9gmxfra1dqvn4qa FOREIGN KEY (variant_id) REFERENCES public.product_variants(id);
ALTER TABLE ONLY public.carts
    ADD CONSTRAINT fkb5o626f86h46m4s7ms6ginnop FOREIGN KEY (user_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.products
    ADD CONSTRAINT fkbgw3lyxhsml3kfqnfr45o0vbj FOREIGN KEY (seller_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fkbioxgbv59vetrxe0ejfubep1w FOREIGN KEY (order_id) REFERENCES public.orders(id);
ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT fkcgy7qjc1r99dp117y9en6lxye FOREIGN KEY (user_id) REFERENCES public.users(id);
ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fkemq71edpbn9wsxnxncfn1algp FOREIGN KEY (variant_id) REFERENCES public.product_variants(id);
ALTER TABLE ONLY public.products
    ADD CONSTRAINT fkog2rp4qthbtt2lfyhfo32lsw9 FOREIGN KEY (category_id) REFERENCES public.categories(id);
ALTER TABLE ONLY public.product_variants
    ADD CONSTRAINT fkosqitn4s405cynmhb87lkvuau FOREIGN KEY (product_id) REFERENCES public.products(id);
ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT fkpcttvuq4mxppo8sxggjtn5i2c FOREIGN KEY (cart_id) REFERENCES public.carts(id);
ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT fkpl51cejpw4gy5swfar8br9ngi FOREIGN KEY (product_id) REFERENCES public.products(id);
ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT fkqnq71xsohugpqwf3c9gxmsuy FOREIGN KEY (product_id) REFERENCES public.products(id);
ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fksjfs85qf6vmcurlx43cnc16gy FOREIGN KEY (customer_id) REFERENCES public.users(id);
