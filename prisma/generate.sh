#!/bin/bash

# Script to generate Prisma client

echo "Generating Prisma client..."
npx prisma generate

if [ $? -eq 0 ]; then
    echo "Prisma client generated successfully."
else
    echo "Error generating Prisma client."
    exit 1
fi