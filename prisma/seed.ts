import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";
import { serializeImages } from "../lib/utils";

const prisma = new PrismaClient();

async function main() {
  console.log("开始播种数据...");

  console.log("清空现有数据...");
  await prisma.favorite.deleteMany();
  await prisma.message.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.property.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();
  console.log("数据清空完成");

  console.log("创建用户...");
  const admin = await prisma.user.create({
    data: {
      name: "系统管理员",
      email: "admin@cityrent.com",
      password: hashSync("admin123", 10),
      role: "ADMIN",
      phone: "13800138000",
      bio: "平台系统管理员，负责审核房源、处理投诉和管理用户。",
      isActive: true,
    },
  });

  const landlord = await prisma.user.create({
    data: {
      name: "张房东",
      email: "landlord@cityrent.com",
      password: hashSync("landlord123", 10),
      role: "LANDLORD",
      phone: "13900139000",
      bio: "专业房东，拥有多套优质房源，致力于为租客提供舒适的居住环境。",
      isActive: true,
    },
  });

  const tenant = await prisma.user.create({
    data: {
      name: "王租客",
      email: "tenant@cityrent.com",
      password: hashSync("tenant123", 10),
      role: "TENANT",
      phone: "13700137000",
      bio: "IT工程师，爱干净，作息规律，工作稳定。",
      isActive: true,
    },
  });
  console.log(`用户创建完成: admin=${admin.id}, landlord=${landlord.id}, tenant=${tenant.id}`);

  console.log("创建房源...");
  const unsplashImages1 = [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
  ];

  const unsplashImages2 = [
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
  ];

  const unsplashImages3 = [
    "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
    "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800",
  ];

  const unsplashImages4 = [
    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800",
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800",
    "https://images.unsplash.com/photo-1600566753086-00f18f6c04d5?w=800",
  ];

  const unsplashImages5 = [
    "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800",
    "https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?w=800",
    "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800",
  ];

  const unsplashImages6 = [
    "https://images.unsplash.com/photo-1600047509358-9dc75507daeb?w=800",
    "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800",
    "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800",
    "https://images.unsplash.com/photo-1600047508718-3bff08918b55?w=800",
  ];

  const unsplashImages7 = [
    "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800",
    "https://images.unsplash.com/photo-1600566753326-59ea057030e6?w=800",
    "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800",
  ];

  const unsplashImages8 = [
    "https://images.unsplash.com/photo-1600585154084-4e5fe7c39198?w=800",
    "https://images.unsplash.com/photo-1600566752734-2a0cd85012fc?w=800",
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800",
  ];

  const propertiesData = [
    {
      title: "朝阳区精装修一居室 近地铁",
      description: "房屋位于朝阳区核心地段，步行5分钟即可到达地铁站。小区环境优美，配套设施齐全。房屋为精装修，家电齐全，拎包入住。周边有大型购物中心、医院、学校等配套设施，生活便利。",
      price: 5500.0,
      deposit: 11000.0,
      area: 55.0,
      bedrooms: 1,
      bathrooms: 1,
      floor: 12,
      totalFloors: 28,
      orientation: "南",
      type: "APARTMENT",
      furnished: true,
      hasParking: true,
      hasElevator: true,
      hasBalcony: true,
      hasGarden: false,
      hasPool: false,
      hasGym: true,
      petsAllowed: false,
      smokingAllowed: false,
      address: "朝阳区建国路88号",
      city: "北京",
      district: "朝阳区",
      province: "北京市",
      zipCode: "100022",
      latitude: 39.9087,
      longitude: 116.4474,
      images: serializeImages(unsplashImages1),
      landlordId: landlord.id,
      status: "APPROVED",
      listingStatus: "ACTIVE",
      rentPeriod: "MONTHLY",
      isFeatured: true,
    },
    {
      title: "海淀区中关村两居室 学区房",
      description: "位于海淀区中关村核心区域，周边教育资源丰富。房屋南北通透，采光良好。小区物业管理完善，24小时安保。临近多家知名互联网公司，通勤便利。",
      price: 8500.0,
      deposit: 17000.0,
      area: 85.0,
      bedrooms: 2,
      bathrooms: 1,
      floor: 8,
      totalFloors: 18,
      orientation: "南北",
      type: "APARTMENT",
      furnished: true,
      hasParking: true,
      hasElevator: true,
      hasBalcony: true,
      hasGarden: false,
      hasPool: false,
      hasGym: false,
      petsAllowed: true,
      smokingAllowed: false,
      address: "海淀区中关村大街1号",
      city: "北京",
      district: "海淀区",
      province: "北京市",
      zipCode: "100080",
      latitude: 39.9842,
      longitude: 116.3074,
      images: serializeImages(unsplashImages2),
      landlordId: landlord.id,
      status: "APPROVED",
      listingStatus: "ACTIVE",
      rentPeriod: "MONTHLY",
      isFeatured: true,
    },
    {
      title: "浦东新区陆家嘴精装公寓",
      description: "坐落于浦东新区陆家嘴金融中心，江景房，视野开阔。房屋装修豪华，配备高端家电。楼下就是地铁站，交通极为便利。",
      price: 12000.0,
      deposit: 24000.0,
      area: 95.0,
      bedrooms: 2,
      bathrooms: 2,
      floor: 32,
      totalFloors: 45,
      orientation: "东南",
      type: "APARTMENT",
      furnished: true,
      hasParking: true,
      hasElevator: true,
      hasBalcony: true,
      hasGarden: false,
      hasPool: true,
      hasGym: true,
      petsAllowed: false,
      smokingAllowed: false,
      address: "浦东新区陆家嘴环路1000号",
      city: "上海",
      district: "浦东新区",
      province: "上海市",
      zipCode: "200120",
      latitude: 31.2397,
      longitude: 121.4998,
      images: serializeImages(unsplashImages3),
      landlordId: landlord.id,
      status: "APPROVED",
      listingStatus: "ACTIVE",
      rentPeriod: "MONTHLY",
      isFeatured: true,
    },
    {
      title: "徐汇区温馨一居室",
      description: "徐汇区法租界附近，老上海风情。房屋虽小但五脏俱全，装修温馨舒适。周边文艺气息浓厚，咖啡馆、书店林立。",
      price: 4800.0,
      deposit: 4800.0,
      area: 42.0,
      bedrooms: 1,
      bathrooms: 1,
      floor: 3,
      totalFloors: 6,
      orientation: "南",
      type: "APARTMENT",
      furnished: true,
      hasParking: false,
      hasElevator: false,
      hasBalcony: false,
      hasGarden: false,
      hasPool: false,
      hasGym: false,
      petsAllowed: true,
      smokingAllowed: false,
      address: "徐汇区衡山路100号",
      city: "上海",
      district: "徐汇区",
      province: "上海市",
      zipCode: "200030",
      latitude: 31.2001,
      longitude: 121.4385,
      images: serializeImages(unsplashImages4),
      landlordId: landlord.id,
      status: "APPROVED",
      listingStatus: "ACTIVE",
      rentPeriod: "MONTHLY",
      isFeatured: false,
    },
    {
      title: "天河区珠江新城三居室",
      description: "广州CBD核心地段，豪华小区。房屋装修精致，采光极佳。临近珠江，傍晚可沿江散步。周边写字楼林立，上班方便。",
      price: 9500.0,
      deposit: 19000.0,
      area: 110.0,
      bedrooms: 3,
      bathrooms: 2,
      floor: 25,
      totalFloors: 39,
      orientation: "南",
      type: "APARTMENT",
      furnished: true,
      hasParking: true,
      hasElevator: true,
      hasBalcony: true,
      hasGarden: true,
      hasPool: true,
      hasGym: true,
      petsAllowed: false,
      smokingAllowed: false,
      address: "天河区珠江新城华夏路8号",
      city: "广州",
      district: "天河区",
      province: "广东省",
      zipCode: "510623",
      latitude: 23.1291,
      longitude: 113.3280,
      images: serializeImages(unsplashImages5),
      landlordId: landlord.id,
      status: "APPROVED",
      listingStatus: "ACTIVE",
      rentPeriod: "MONTHLY",
      isFeatured: true,
    },
    {
      title: "南山区科技园LOFT公寓",
      description: "深圳南山区科技园，专为IT人士打造。LOFT格局，空间利用率高。小区年轻人多，氛围活跃。步行即可到达各大互联网公司。",
      price: 6800.0,
      deposit: 13600.0,
      area: 65.0,
      bedrooms: 1,
      bathrooms: 1,
      floor: 15,
      totalFloors: 22,
      orientation: "南",
      type: "APARTMENT",
      furnished: true,
      hasParking: true,
      hasElevator: true,
      hasBalcony: false,
      hasGarden: false,
      hasPool: false,
      hasGym: true,
      petsAllowed: true,
      smokingAllowed: false,
      address: "南山区科技园科苑路16号",
      city: "深圳",
      district: "南山区",
      province: "广东省",
      zipCode: "518057",
      latitude: 22.5431,
      longitude: 113.9413,
      images: serializeImages(unsplashImages6),
      landlordId: landlord.id,
      status: "APPROVED",
      listingStatus: "ACTIVE",
      rentPeriod: "MONTHLY",
      isFeatured: false,
    },
    {
      title: "西湖区文教区精装两居",
      description: "杭州西湖区，毗邻浙江大学。文化氛围浓厚，周边配套完善。房屋保养良好，家电家具齐全，拎包入住。",
      price: 5200.0,
      deposit: 10400.0,
      area: 78.0,
      bedrooms: 2,
      bathrooms: 1,
      floor: 6,
      totalFloors: 11,
      orientation: "南北",
      type: "APARTMENT",
      furnished: true,
      hasParking: true,
      hasElevator: true,
      hasBalcony: true,
      hasGarden: false,
      hasPool: false,
      hasGym: false,
      petsAllowed: false,
      smokingAllowed: false,
      address: "西湖区文三路235号",
      city: "杭州",
      district: "西湖区",
      province: "浙江省",
      zipCode: "310012",
      latitude: 30.2741,
      longitude: 120.1551,
      images: serializeImages(unsplashImages7),
      landlordId: landlord.id,
      status: "APPROVED",
      listingStatus: "ACTIVE",
      rentPeriod: "MONTHLY",
      isFeatured: false,
    },
    {
      title: "锦江区春熙路时尚开间",
      description: "成都市中心春熙路商圈，地理位置绝佳。开间设计，现代简约风格。楼下就是地铁站，逛街购物方便至极。",
      price: 3800.0,
      deposit: 3800.0,
      area: 38.0,
      bedrooms: 1,
      bathrooms: 1,
      floor: 18,
      totalFloors: 30,
      orientation: "东",
      type: "APARTMENT",
      furnished: true,
      hasParking: true,
      hasElevator: true,
      hasBalcony: false,
      hasGarden: false,
      hasPool: false,
      hasGym: true,
      petsAllowed: false,
      smokingAllowed: false,
      address: "锦江区春熙路东段1号",
      city: "成都",
      district: "锦江区",
      province: "四川省",
      zipCode: "610016",
      latitude: 30.6570,
      longitude: 104.0650,
      images: serializeImages(unsplashImages8),
      landlordId: landlord.id,
      status: "APPROVED",
      listingStatus: "ACTIVE",
      rentPeriod: "MONTHLY",
      isFeatured: true,
    },
  ];

  const createdProperties = [];
  for (const data of propertiesData) {
    const prop = await prisma.property.create({ data });
    createdProperties.push(prop);
  }
  console.log(`房源创建完成，共 ${createdProperties.length} 个`);

  console.log("创建收藏记录...");
  await prisma.favorite.create({
    data: {
      userId: tenant.id,
      propertyId: createdProperties[0].id,
    },
  });
  await prisma.favorite.create({
    data: {
      userId: tenant.id,
      propertyId: createdProperties[2].id,
    },
  });
  console.log("收藏记录创建完成");

  console.log("创建评价记录...");
  await prisma.review.create({
    data: {
      propertyId: createdProperties[0].id,
      tenantId: tenant.id,
      rating: 5,
      cleanliness: 5,
      location: 5,
      communication: 5,
      value: 4,
      comment: "非常棒的房源！位置好，装修新，房东人也很nice。强烈推荐给大家！",
    },
  });
  await prisma.review.create({
    data: {
      propertyId: createdProperties[1].id,
      tenantId: tenant.id,
      rating: 4,
      cleanliness: 4,
      location: 5,
      communication: 4,
      value: 4,
      comment: "整体还不错，位置很好，就是价格稍微有点高。",
    },
  });
  console.log("评价记录创建完成");

  console.log("创建预约记录...");
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  await prisma.booking.create({
    data: {
      propertyId: createdProperties[0].id,
      tenantId: tenant.id,
      landlordId: landlord.id,
      preferredDate: tomorrow,
      preferredTime: "14:00",
      alternateDate: new Date(tomorrow.getTime() + 86400000),
      alternateTime: "10:00",
      message: "您好，我想预约看房，请问这个时间方便吗？",
      numberOfPeople: 2,
      status: "PENDING",
    },
  });
  console.log("预约记录创建完成");

  console.log("创建消息记录...");
  await prisma.message.create({
    data: {
      senderId: tenant.id,
      receiverId: landlord.id,
      propertyId: createdProperties[0].id,
      content: "您好，请问这个房源还在出租吗？",
      status: "SENT",
      isRead: true,
    },
  });
  await prisma.message.create({
    data: {
      senderId: landlord.id,
      receiverId: tenant.id,
      propertyId: createdProperties[0].id,
      content: "您好，房源还在出租的，请问您什么时候方便看房呢？",
      status: "SENT",
      isRead: false,
    },
  });
  console.log("消息记录创建完成");

  console.log("创建投诉记录...");
  await prisma.complaint.create({
    data: {
      title: "房源图片与实际不符",
      description: "看房后发现实际房屋情况与网上发布的图片有较大差异，部分家具已老旧损坏。",
      type: "PROPERTY",
      propertyId: createdProperties[3].id,
      complainantId: tenant.id,
      respondentId: landlord.id,
      handlerId: admin.id,
      status: "OPEN",
      priority: "MEDIUM",
    },
  });
  console.log("投诉记录创建完成");

  console.log("播种完成！");
}

main()
  .catch((e) => {
    console.error("播种过程中发生错误:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
