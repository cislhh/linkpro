/**
 * Clear Skills Modules Script
 *
 * Utility script to delete all skills modules from the database.
 * This is useful for cleaning up dirty data.
 *
 * Usage:
 *   npx tsx scripts/clear-skills-modules.ts
 *
 * Environment variables required:
 *   - DATABASE_URL
 */

import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import * as path from "path";

// Load environment variables
const envPath = path.join(process.cwd(), ".env");
dotenv.config({ path: envPath });

const prisma = new PrismaClient();

async function clearSkillsModules() {
  try {
    console.log("🗑️  Starting to clear skills modules...\n");

    // First, count how many skills modules exist
    const count = await prisma.pageModule.count({
      where: { type: "skills" },
    });

    if (count === 0) {
      console.log("✅ No skills modules found in database.");
      return;
    }

    console.log(`📊 Found ${count} skills module(s) in database.\n`);

    // Show some samples before deletion
    const samples = await prisma.pageModule.findMany({
      where: { type: "skills" },
      take: 3,
      select: {
        id: true,
        userId: true,
        data: true,
        createdAt: true,
      },
    });

    if (samples.length > 0) {
      console.log("Sample data to be deleted:");
      samples.forEach((module, index) => {
        console.log(`  ${index + 1}. ID: ${module.id}`);
        console.log(`     User: ${module.userId}`);
        console.log(`     Data: ${JSON.stringify(module.data)}`);
        console.log(`     Created: ${module.createdAt}`);
        console.log();
      });
    }

    // Confirm deletion
    console.log("⚠️  This will delete ALL skills modules from the database.");
    console.log("Press Ctrl+C to cancel, or wait 3 seconds to continue...\n");

    await new Promise(resolve => setTimeout(resolve, 3000));

    // Delete all skills modules
    const result = await prisma.pageModule.deleteMany({
      where: { type: "skills" },
    });

    console.log(`✅ Successfully deleted ${result.count} skills module(s).`);

  } catch (error) {
    console.error("❌ Error clearing skills modules:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
clearSkillsModules();
