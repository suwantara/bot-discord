#!/bin/bash

# Setup environment
echo "Setting up environment..."
if [ ! -f .env ]; then
    echo "Creating .env file from environment variables..."
    env | grep -E '^(DISCORD_|BOT_|CLIENT_|GUILD_|NODE_)' > .env
fi

# Install dependencies
echo "Installing dependencies..."
npm install --production

# Start the application
echo "Starting Discord bot..."
npm start
