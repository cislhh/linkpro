import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 开始创建测试数据...");

  // 清理现有数据
  await prisma.link.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // 创建测试用户 1 - Aurora 主题
  const hashedPassword = await bcrypt.hash("password123", 10);
  
  const user1 = await prisma.user.create({
    data: {
      email: "demo@linkpro.com",
      username: "demo",
      name: "Demo User",
      bio: "这是一个演示账户，展示 LinkPro 的功能",
      password: hashedPassword,
      theme: "aurora",
      links: {
        create: [
          {
            title: "GitHub",
            url: "https://github.com/demo",
            icon: "github",
            order: 0,
            isActive: true,
          },
          {
            title: "Twitter",
            url: "https://twitter.com/demo",
            icon: "twitter",
            order: 1,
            isActive: true,
          },
          {
            title: "个人博客",
            url: "https://blog.demo.com",
            icon: "globe",
            order: 2,
            isActive: true,
          },
          {
            title: "LinkedIn",
            url: "https://linkedin.com/in/demo",
            icon: "linkedin",
            order: 3,
            isActive: false,
          },
        ],
      },
    },
  });

  console.log(`✅ 创建用户: ${user1.username} (${user1.email})`);

  // 创建测试用户 2 - Cyber 主题
  const user2 = await prisma.user.create({
    data: {
      email: "cyber@linkpro.com",
      username: "cyberpunk",
      name: "Cyber Punk",
      bio: "赛博朋克风格爱好者 🌃",
      password: hashedPassword,
      theme: "cyber",
      links: {
        create: [
          {
            title: "Discord",
            url: "https://discord.gg/cyber",
            icon: "discord",
            order: 0,
            isActive: true,
          },
          {
            title: "Twitch",
            url: "https://twitch.tv/cyberpunk",
            icon: "twitch",
            order: 1,
            isActive: true,
          },
          {
            title: "YouTube",
            url: "https://youtube.com/@cyberpunk",
            icon: "youtube",
            order: 2,
            isActive: true,
          },
        ],
      },
    },
  });

  console.log(`✅ 创建用户: ${user2.username} (${user2.email})`);

  // 创建测试用户 3 - Glass 主题
  const user3 = await prisma.user.create({
    data: {
      email: "glass@linkpro.com",
      username: "glassmorphism",
      name: "Glass Designer",
      bio: "UI/UX 设计师，热爱玻璃拟态设计",
      password: hashedPassword,
      theme: "glass",
      links: {
        create: [
          {
            title: "Dribbble",
            url: "https://dribbble.com/glass",
            icon: "dribbble",
            order: 0,
            isActive: true,
          },
          {
            title: "Behance",
            url: "https://behance.net/glass",
            icon: "behance",
            order: 1,
            isActive: true,
          },
          {
            title: "Figma Community",
            url: "https://figma.com/@glass",
            icon: "figma",
            order: 2,
            isActive: true,
          },
          {
            title: "Instagram",
            url: "https://instagram.com/glass_design",
            icon: "instagram",
            order: 3,
            isActive: true,
          },
          {
            title: "Email",
            url: "mailto:glass@design.com",
            icon: "mail",
            order: 4,
            isActive: true,
          },
        ],
      },
    },
  });

  console.log(`✅ 创建用户: ${user3.username} (${user3.email})`);

  // 输出统计信息
  const userCount = await prisma.user.count();
  const linkCount = await prisma.link.count();

  console.log("\n📊 数据库统计:");
  console.log(`   用户数量: ${userCount}`);
  console.log(`   链接数量: ${linkCount}`);
  console.log("\n🎉 测试数据创建完成!");
  console.log("\n📝 测试账户信息:");
  console.log("   邮箱: demo@linkpro.com / cyber@linkpro.com / glass@linkpro.com");
  console.log("   密码: password123");
}

main()
  .catch((e) => {
    console.error("❌ 错误:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
