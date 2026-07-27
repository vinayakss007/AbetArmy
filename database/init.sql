-- Initialize the agent_fleet database
-- This script creates the initial database schema and sample data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create schemas for better organization
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS agents;
CREATE SCHEMA IF NOT EXISTS monitoring;
CREATE SCHEMA IF NOT EXISTS billing;

-- Set search path
SET search_path TO core, agents, monitoring, billing, public;