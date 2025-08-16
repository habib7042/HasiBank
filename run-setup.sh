#!/bin/bash

# HASHI BANK Database Setup Script
# Run this script to set up your Neon.tech PostgreSQL database

# Database connection string
DB_URL="postgresql://neondb_owner:npg_7tcCWGfaJzF8@ep-spring-voice-a1mmjmkd-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

echo "Setting up HASHI BANK database..."
echo "Database URL: $DB_URL"
echo ""

# Run the SQL setup script
psql "$DB_URL" -f setup-database.sql

echo ""
echo "Database setup completed!"
echo "Your PIN is set to: 7042"
echo "Users created: Shobuj and Shitu"
echo ""
echo "You can now log in to your HASHI BANK app with PIN: 7042"