CREATE TABLE "departments" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"property_id" varchar(36) NOT NULL,
	"name" text NOT NULL,
	"code" varchar(16) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"name" text NOT NULL,
	"legal_registration" text,
	"tax_identifier" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "outlets" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"property_id" varchar(36) NOT NULL,
	"department_id" varchar(36),
	"name" text NOT NULL,
	"type" varchar(32) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"organization_id" varchar(36) NOT NULL,
	"name" text NOT NULL,
	"code" varchar(10) NOT NULL,
	"city" text NOT NULL,
	"address" text,
	"phone" varchar(32),
	"email" varchar(128),
	"accounting_currency" varchar(3) DEFAULT 'XOF' NOT NULL,
	"timezone" varchar(64) DEFAULT 'Africa/Porto-Novo' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" varchar(64) NOT NULL,
	"country" varchar(2) DEFAULT 'BJ' NOT NULL,
	"default_currency" varchar(3) DEFAULT 'XOF' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tenants_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"role_id" varchar(36) NOT NULL,
	"property_id" varchar(36),
	"is_temporary" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"code" varchar(64) NOT NULL,
	"description" text NOT NULL,
	CONSTRAINT "permissions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"role_id" varchar(36) NOT NULL,
	"permission_code" varchar(64) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"name" text NOT NULL,
	"code" varchar(32) NOT NULL,
	"description" text,
	"max_discount_percent" varchar(5) DEFAULT '0' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"email" varchar(128) NOT NULL,
	"password_hash" text NOT NULL,
	"full_name" text NOT NULL,
	"phone" varchar(32),
	"active" boolean DEFAULT true NOT NULL,
	"mfa_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "guests" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"full_name" text NOT NULL,
	"email" varchar(128),
	"phone" varchar(32) NOT NULL,
	"id_number" varchar(64),
	"nationality" varchar(64) DEFAULT 'Béninoise',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_plans" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"property_id" varchar(36) NOT NULL,
	"room_type_id" varchar(36) NOT NULL,
	"name" text NOT NULL,
	"price_xof" integer NOT NULL,
	"cancellation_policy" text,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"property_id" varchar(36) NOT NULL,
	"guest_id" varchar(36) NOT NULL,
	"unit_id" varchar(36),
	"room_type_id" varchar(36) NOT NULL,
	"rate_plan_id" varchar(36),
	"check_in_date" varchar(10) NOT NULL,
	"check_out_date" varchar(10) NOT NULL,
	"num_guests" integer DEFAULT 1 NOT NULL,
	"total_amount_xof" integer NOT NULL,
	"status" varchar(32) DEFAULT 'CONFIRMED' NOT NULL,
	"source" varchar(32) DEFAULT 'DIRECT_WEB' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "room_types" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"property_id" varchar(36) NOT NULL,
	"name" text NOT NULL,
	"code" varchar(16) NOT NULL,
	"capacity" integer DEFAULT 2 NOT NULL,
	"base_price_xof" integer NOT NULL,
	"description" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stays" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"property_id" varchar(36) NOT NULL,
	"reservation_id" varchar(36) NOT NULL,
	"unit_id" varchar(36) NOT NULL,
	"guest_id" varchar(36) NOT NULL,
	"actual_check_in" timestamp with time zone DEFAULT now() NOT NULL,
	"actual_check_out" timestamp with time zone,
	"status" varchar(32) DEFAULT 'ACTIVE' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "units" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"property_id" varchar(36) NOT NULL,
	"room_type_id" varchar(36) NOT NULL,
	"unit_number" varchar(16) NOT NULL,
	"floor" varchar(16),
	"status" varchar(32) DEFAULT 'AVAILABLE' NOT NULL,
	"housekeeping_status" varchar(32) DEFAULT 'CLEAN' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dining_tables" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"property_id" varchar(36) NOT NULL,
	"outlet_id" varchar(36),
	"table_number" varchar(16) NOT NULL,
	"capacity" integer DEFAULT 4 NOT NULL,
	"zone" varchar(32) DEFAULT 'SALLE_PRINCIPALE' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_categories" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"property_id" varchar(36) NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "menu_items" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"property_id" varchar(36) NOT NULL,
	"category_id" varchar(36) NOT NULL,
	"target_station_code" varchar(16) NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price_xof" integer NOT NULL,
	"allergens" text,
	"is_available" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_lines" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"order_id" varchar(36) NOT NULL,
	"menu_item_id" varchar(36) NOT NULL,
	"name" text NOT NULL,
	"target_station_code" varchar(16) NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price_xof" integer NOT NULL,
	"total_price_xof" integer NOT NULL,
	"special_instructions" text
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"property_id" varchar(36) NOT NULL,
	"order_number" varchar(32) NOT NULL,
	"source" varchar(32) NOT NULL,
	"table_id" varchar(36),
	"unit_id" varchar(36),
	"waiter_id" varchar(36),
	"status" varchar(32) DEFAULT 'SUBMITTED' NOT NULL,
	"total_amount_xof" integer NOT NULL,
	"customer_notes" text,
	"folio_id" varchar(36),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "qr_resources" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"property_id" varchar(36) NOT NULL,
	"token" varchar(64) NOT NULL,
	"resource_type" varchar(32) NOT NULL,
	"table_id" varchar(36),
	"unit_id" varchar(36),
	"revoked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "qr_resources_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "service_stations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"property_id" varchar(36) NOT NULL,
	"name" text NOT NULL,
	"code" varchar(16) NOT NULL,
	"type" varchar(32) NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "station_tickets" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"property_id" varchar(36) NOT NULL,
	"order_id" varchar(36) NOT NULL,
	"station_code" varchar(16) NOT NULL,
	"status" varchar(32) DEFAULT 'PENDING' NOT NULL,
	"ticket_number" varchar(32) NOT NULL,
	"items_summary" text NOT NULL,
	"acknowledged_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "catering_dishes" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"property_id" varchar(36) NOT NULL,
	"menu_id" varchar(36),
	"name" text NOT NULL,
	"category" varchar(32) NOT NULL,
	"price_per_portion_xof" integer NOT NULL,
	"available_options" text,
	"allergens" text,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "catering_menus" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"property_id" varchar(36) NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price_per_person_xof" integer NOT NULL,
	"min_guests" integer DEFAULT 10 NOT NULL,
	"min_notice_hours" integer DEFAULT 48 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "catering_order_items" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"order_id" varchar(36) NOT NULL,
	"dish_id" varchar(36),
	"name" text NOT NULL,
	"quantity_portions" integer NOT NULL,
	"unit_price_xof" integer NOT NULL,
	"total_price_xof" integer NOT NULL,
	"selected_options" text
);
--> statement-breakpoint
CREATE TABLE "catering_orders" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"property_id" varchar(36) NOT NULL,
	"order_number" varchar(32) NOT NULL,
	"client_name" text NOT NULL,
	"client_phone" varchar(32) NOT NULL,
	"client_email" varchar(128),
	"event_date" varchar(10) NOT NULL,
	"event_time" varchar(8) NOT NULL,
	"delivery_location" text NOT NULL,
	"service_type" varchar(32) NOT NULL,
	"guest_count" integer NOT NULL,
	"dietary_notes" text,
	"special_instructions" text,
	"subtotal_xof" integer NOT NULL,
	"delivery_fee_xof" integer DEFAULT 0 NOT NULL,
	"total_amount_xof" integer NOT NULL,
	"status" varchar(32) DEFAULT 'DEMANDE_RECUE' NOT NULL,
	"assigned_staff" text,
	"assigned_vehicle" text,
	"folio_id" varchar(36),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipment_inspections" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"property_id" varchar(36) NOT NULL,
	"rental_id" varchar(36) NOT NULL,
	"type" varchar(16) NOT NULL,
	"inspected_by_user_id" varchar(36) NOT NULL,
	"items_checked_summary" text NOT NULL,
	"damaged_count" integer DEFAULT 0 NOT NULL,
	"lost_count" integer DEFAULT 0 NOT NULL,
	"damage_fee_assessed_xof" integer DEFAULT 0 NOT NULL,
	"comments" text,
	"inspection_date" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipment_items" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"property_id" varchar(36) NOT NULL,
	"name" text NOT NULL,
	"category" varchar(32) NOT NULL,
	"description" text,
	"photo_url" text,
	"total_stock" integer NOT NULL,
	"daily_rental_price_xof" integer NOT NULL,
	"deposit_per_unit_xof" integer DEFAULT 0 NOT NULL,
	"replacement_cost_xof" integer NOT NULL,
	"condition_status" varchar(32) DEFAULT 'EXCELLENT' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipment_rental_lines" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"rental_id" varchar(36) NOT NULL,
	"item_id" varchar(36) NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price_xof" integer NOT NULL,
	"total_price_xof" integer NOT NULL,
	"unit_deposit_xof" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipment_rentals" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"property_id" varchar(36) NOT NULL,
	"rental_number" varchar(32) NOT NULL,
	"catering_order_id" varchar(36),
	"client_name" text NOT NULL,
	"client_phone" varchar(32) NOT NULL,
	"startDate" varchar(10) NOT NULL,
	"endDate" varchar(10) NOT NULL,
	"delivery_time" varchar(8),
	"pickup_time" varchar(8),
	"event_location" text NOT NULL,
	"rental_total_xof" integer NOT NULL,
	"transport_fee_xof" integer DEFAULT 0 NOT NULL,
	"total_deposit_xof" integer NOT NULL,
	"deposit_retained_xof" integer DEFAULT 0 NOT NULL,
	"deposit_refunded_xof" integer DEFAULT 0 NOT NULL,
	"status" varchar(32) DEFAULT 'RESERVED' NOT NULL,
	"notes" text,
	"folio_id" varchar(36),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cash_drawers" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"property_id" varchar(36) NOT NULL,
	"outlet_id" varchar(36),
	"name" text NOT NULL,
	"code" varchar(16) NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cash_sessions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"property_id" varchar(36) NOT NULL,
	"drawer_id" varchar(36) NOT NULL,
	"opened_by_user_id" varchar(36) NOT NULL,
	"closed_by_user_id" varchar(36),
	"opened_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone,
	"opening_balance_xof" integer NOT NULL,
	"theoretical_balance_xof" integer DEFAULT 0 NOT NULL,
	"counted_balance_xof" integer,
	"discrepancy_xof" integer DEFAULT 0 NOT NULL,
	"discrepancy_reason" text,
	"status" varchar(16) DEFAULT 'OPEN' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "folio_lines" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"folio_id" varchar(36) NOT NULL,
	"department_code" varchar(16) NOT NULL,
	"description" text NOT NULL,
	"amount_xof" integer NOT NULL,
	"source_reference" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "folios" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"property_id" varchar(36) NOT NULL,
	"folio_number" varchar(32) NOT NULL,
	"stay_id" varchar(36),
	"guest_name" text NOT NULL,
	"total_charges_xof" integer DEFAULT 0 NOT NULL,
	"total_payments_xof" integer DEFAULT 0 NOT NULL,
	"balance_xof" integer DEFAULT 0 NOT NULL,
	"status" varchar(16) DEFAULT 'OPEN' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"property_id" varchar(36) NOT NULL,
	"invoice_number" varchar(32) NOT NULL,
	"folio_id" varchar(36) NOT NULL,
	"client_name" text NOT NULL,
	"client_tax_id" varchar(64),
	"total_amount_xof" integer NOT NULL,
	"tax_amount_xof" integer DEFAULT 0 NOT NULL,
	"issue_date" timestamp with time zone DEFAULT now() NOT NULL,
	"syscohada_exported" boolean DEFAULT false NOT NULL,
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "payment_records" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"property_id" varchar(36) NOT NULL,
	"folio_id" varchar(36),
	"cash_session_id" varchar(36),
	"recorded_by_user_id" varchar(36) NOT NULL,
	"payment_method" varchar(32) NOT NULL,
	"amount_xof" integer NOT NULL,
	"reference" varchar(64),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "discount_requests" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"property_id" varchar(36) NOT NULL,
	"requested_by_user_id" varchar(36) NOT NULL,
	"reviewed_by_user_id" varchar(36),
	"target_type" varchar(32) NOT NULL,
	"target_id" varchar(36) NOT NULL,
	"discount_type" varchar(16) NOT NULL,
	"discount_value" integer NOT NULL,
	"reason" text NOT NULL,
	"status" varchar(16) DEFAULT 'PENDING' NOT NULL,
	"review_notes" text,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "night_audits" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"property_id" varchar(36) NOT NULL,
	"audit_date" varchar(10) NOT NULL,
	"executed_by_user_id" varchar(36) NOT NULL,
	"occupied_rooms_count" integer NOT NULL,
	"total_rooms_count" integer NOT NULL,
	"occupancy_rate_percent" integer NOT NULL,
	"room_revenue_xof" integer NOT NULL,
	"fnb_revenue_xof" integer NOT NULL,
	"events_revenue_xof" integer DEFAULT 0 NOT NULL,
	"total_revenue_xof" integer NOT NULL,
	"discrepancies_count" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"is_locked" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_events" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"property_id" varchar(36),
	"user_id" varchar(36),
	"action" varchar(64) NOT NULL,
	"entity_type" varchar(32) NOT NULL,
	"entity_id" varchar(36),
	"details" text NOT NULL,
	"ip_address" varchar(45),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integration_events" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"provider" varchar(32) NOT NULL,
	"event_id" varchar(128) NOT NULL,
	"event_type" varchar(64) NOT NULL,
	"payload" text NOT NULL,
	"processed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "integration_events_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"tenant_id" varchar(36) NOT NULL,
	"provider" varchar(32) DEFAULT 'CHARIOW' NOT NULL,
	"external_subscription_id" varchar(64),
	"plan_code" varchar(32) NOT NULL,
	"status" varchar(32) DEFAULT 'ACTIVE' NOT NULL,
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"amount_xof" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outlets" ADD CONSTRAINT "outlets_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outlets" ADD CONSTRAINT "outlets_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "outlets" ADD CONSTRAINT "outlets_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_code_permissions_code_fk" FOREIGN KEY ("permission_code") REFERENCES "public"."permissions"("code") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guests" ADD CONSTRAINT "guests_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rate_plans" ADD CONSTRAINT "rate_plans_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rate_plans" ADD CONSTRAINT "rate_plans_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rate_plans" ADD CONSTRAINT "rate_plans_room_type_id_room_types_id_fk" FOREIGN KEY ("room_type_id") REFERENCES "public"."room_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_room_type_id_room_types_id_fk" FOREIGN KEY ("room_type_id") REFERENCES "public"."room_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_rate_plan_id_rate_plans_id_fk" FOREIGN KEY ("rate_plan_id") REFERENCES "public"."rate_plans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_types" ADD CONSTRAINT "room_types_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "room_types" ADD CONSTRAINT "room_types_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stays" ADD CONSTRAINT "stays_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stays" ADD CONSTRAINT "stays_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stays" ADD CONSTRAINT "stays_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stays" ADD CONSTRAINT "stays_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stays" ADD CONSTRAINT "stays_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "units" ADD CONSTRAINT "units_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "units" ADD CONSTRAINT "units_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "units" ADD CONSTRAINT "units_room_type_id_room_types_id_fk" FOREIGN KEY ("room_type_id") REFERENCES "public"."room_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dining_tables" ADD CONSTRAINT "dining_tables_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dining_tables" ADD CONSTRAINT "dining_tables_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dining_tables" ADD CONSTRAINT "dining_tables_outlet_id_outlets_id_fk" FOREIGN KEY ("outlet_id") REFERENCES "public"."outlets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_categories" ADD CONSTRAINT "menu_categories_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_categories" ADD CONSTRAINT "menu_categories_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_category_id_menu_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."menu_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_lines" ADD CONSTRAINT "order_lines_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_lines" ADD CONSTRAINT "order_lines_menu_item_id_menu_items_id_fk" FOREIGN KEY ("menu_item_id") REFERENCES "public"."menu_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_table_id_dining_tables_id_fk" FOREIGN KEY ("table_id") REFERENCES "public"."dining_tables"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_resources" ADD CONSTRAINT "qr_resources_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_resources" ADD CONSTRAINT "qr_resources_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_resources" ADD CONSTRAINT "qr_resources_table_id_dining_tables_id_fk" FOREIGN KEY ("table_id") REFERENCES "public"."dining_tables"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "qr_resources" ADD CONSTRAINT "qr_resources_unit_id_units_id_fk" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_stations" ADD CONSTRAINT "service_stations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_stations" ADD CONSTRAINT "service_stations_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "station_tickets" ADD CONSTRAINT "station_tickets_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "station_tickets" ADD CONSTRAINT "station_tickets_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "station_tickets" ADD CONSTRAINT "station_tickets_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catering_dishes" ADD CONSTRAINT "catering_dishes_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catering_dishes" ADD CONSTRAINT "catering_dishes_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catering_dishes" ADD CONSTRAINT "catering_dishes_menu_id_catering_menus_id_fk" FOREIGN KEY ("menu_id") REFERENCES "public"."catering_menus"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catering_menus" ADD CONSTRAINT "catering_menus_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catering_menus" ADD CONSTRAINT "catering_menus_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catering_order_items" ADD CONSTRAINT "catering_order_items_order_id_catering_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."catering_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catering_order_items" ADD CONSTRAINT "catering_order_items_dish_id_catering_dishes_id_fk" FOREIGN KEY ("dish_id") REFERENCES "public"."catering_dishes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catering_orders" ADD CONSTRAINT "catering_orders_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "catering_orders" ADD CONSTRAINT "catering_orders_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_inspections" ADD CONSTRAINT "equipment_inspections_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_inspections" ADD CONSTRAINT "equipment_inspections_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_inspections" ADD CONSTRAINT "equipment_inspections_rental_id_equipment_rentals_id_fk" FOREIGN KEY ("rental_id") REFERENCES "public"."equipment_rentals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_items" ADD CONSTRAINT "equipment_items_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_items" ADD CONSTRAINT "equipment_items_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_rental_lines" ADD CONSTRAINT "equipment_rental_lines_rental_id_equipment_rentals_id_fk" FOREIGN KEY ("rental_id") REFERENCES "public"."equipment_rentals"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_rental_lines" ADD CONSTRAINT "equipment_rental_lines_item_id_equipment_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."equipment_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_rentals" ADD CONSTRAINT "equipment_rentals_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_rentals" ADD CONSTRAINT "equipment_rentals_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment_rentals" ADD CONSTRAINT "equipment_rentals_catering_order_id_catering_orders_id_fk" FOREIGN KEY ("catering_order_id") REFERENCES "public"."catering_orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_drawers" ADD CONSTRAINT "cash_drawers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_drawers" ADD CONSTRAINT "cash_drawers_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_drawers" ADD CONSTRAINT "cash_drawers_outlet_id_outlets_id_fk" FOREIGN KEY ("outlet_id") REFERENCES "public"."outlets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_sessions" ADD CONSTRAINT "cash_sessions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_sessions" ADD CONSTRAINT "cash_sessions_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_sessions" ADD CONSTRAINT "cash_sessions_drawer_id_cash_drawers_id_fk" FOREIGN KEY ("drawer_id") REFERENCES "public"."cash_drawers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_sessions" ADD CONSTRAINT "cash_sessions_opened_by_user_id_users_id_fk" FOREIGN KEY ("opened_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cash_sessions" ADD CONSTRAINT "cash_sessions_closed_by_user_id_users_id_fk" FOREIGN KEY ("closed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folio_lines" ADD CONSTRAINT "folio_lines_folio_id_folios_id_fk" FOREIGN KEY ("folio_id") REFERENCES "public"."folios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folios" ADD CONSTRAINT "folios_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "folios" ADD CONSTRAINT "folios_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_folio_id_folios_id_fk" FOREIGN KEY ("folio_id") REFERENCES "public"."folios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_folio_id_folios_id_fk" FOREIGN KEY ("folio_id") REFERENCES "public"."folios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_cash_session_id_cash_sessions_id_fk" FOREIGN KEY ("cash_session_id") REFERENCES "public"."cash_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_records" ADD CONSTRAINT "payment_records_recorded_by_user_id_users_id_fk" FOREIGN KEY ("recorded_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_requests" ADD CONSTRAINT "discount_requests_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_requests" ADD CONSTRAINT "discount_requests_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_requests" ADD CONSTRAINT "discount_requests_requested_by_user_id_users_id_fk" FOREIGN KEY ("requested_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "discount_requests" ADD CONSTRAINT "discount_requests_reviewed_by_user_id_users_id_fk" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "night_audits" ADD CONSTRAINT "night_audits_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "night_audits" ADD CONSTRAINT "night_audits_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "night_audits" ADD CONSTRAINT "night_audits_executed_by_user_id_users_id_fk" FOREIGN KEY ("executed_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_events" ADD CONSTRAINT "audit_events_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE no action ON UPDATE no action;