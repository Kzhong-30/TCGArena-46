import { NextResponse } from "next/server";
import { requireRole } from "@/lib/session";
import type { PropertyType, UserRole } from "@/types";


export const dynamic = "force-dynamic";
export const revalidate = 0;

interface SmartFillRequestBody {
  city: string;
  district: string;
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  area: number;
  address?: string;
  orientation?: string;
  furnished?: boolean;
}

interface SuggestedAmenities {
  hasParking: boolean;
  hasElevator: boolean;
  hasBalcony: boolean;
  hasGarden: boolean;
  hasPool: boolean;
  hasGym: boolean;
  petsAllowed: boolean;
  smokingAllowed: boolean;
}

interface SuggestedPriceRange {
  min: number;
  max: number;
  avg: number;
}

interface SmartFillResponseData {
  suggestedTitles: string[];
  suggestedDescription: string;
  suggestedPriceRange: SuggestedPriceRange;
  suggestedDeposit: number;
  suggestedAmenities: SuggestedAmenities;
  suggestedMinimumStay: number;
  suggestedOrientation: string;
}

interface ApiSuccessResponse {
  success: true;
  data: SmartFillResponseData;
}

interface ApiErrorResponse {
  success: false;
  error: string;
}

type ApiResponse = ApiSuccessResponse | ApiErrorResponse;

type CityDistrictPrices = Record<string, Record<string, Record<string, number>>>;

const PRICE_PER_SQM: CityDistrictPrices = {
  北京: {
    朝阳区: { STUDIO: 120, APARTMENT: 100, HOUSE: 95, VILLA: 130, LOFT: 110, DORMITORY: 60, OFFICE: 150, COMMERCIAL: 200 },
    海淀区: { STUDIO: 130, APARTMENT: 110, HOUSE: 105, VILLA: 140, LOFT: 120, DORMITORY: 65, OFFICE: 160, COMMERCIAL: 210 },
    西城区: { STUDIO: 140, APARTMENT: 120, HOUSE: 115, VILLA: 150, LOFT: 130, DORMITORY: 70, OFFICE: 170, COMMERCIAL: 220 },
    东城区: { STUDIO: 135, APARTMENT: 115, HOUSE: 110, VILLA: 145, LOFT: 125, DORMITORY: 68, OFFICE: 165, COMMERCIAL: 215 },
    丰台区: { STUDIO: 90, APARTMENT: 75, HOUSE: 70, VILLA: 100, LOFT: 85, DORMITORY: 45, OFFICE: 110, COMMERCIAL: 150 },
    石景山区: { STUDIO: 85, APARTMENT: 70, HOUSE: 65, VILLA: 95, LOFT: 80, DORMITORY: 42, OFFICE: 105, COMMERCIAL: 145 },
    通州区: { STUDIO: 80, APARTMENT: 65, HOUSE: 60, VILLA: 90, LOFT: 75, DORMITORY: 40, OFFICE: 100, COMMERCIAL: 140 },
    顺义区: { STUDIO: 85, APARTMENT: 70, HOUSE: 75, VILLA: 110, LOFT: 80, DORMITORY: 42, OFFICE: 100, COMMERCIAL: 140 },
  },
  上海: {
    浦东新区: { STUDIO: 130, APARTMENT: 110, HOUSE: 105, VILLA: 145, LOFT: 120, DORMITORY: 65, OFFICE: 160, COMMERCIAL: 210 },
    徐汇区: { STUDIO: 135, APARTMENT: 115, HOUSE: 110, VILLA: 150, LOFT: 125, DORMITORY: 68, OFFICE: 165, COMMERCIAL: 215 },
    长宁区: { STUDIO: 130, APARTMENT: 110, HOUSE: 105, VILLA: 145, LOFT: 120, DORMITORY: 65, OFFICE: 160, COMMERCIAL: 210 },
    静安区: { STUDIO: 140, APARTMENT: 120, HOUSE: 115, VILLA: 155, LOFT: 130, DORMITORY: 70, OFFICE: 170, COMMERCIAL: 220 },
    黄浦区: { STUDIO: 145, APARTMENT: 125, HOUSE: 120, VILLA: 160, LOFT: 135, DORMITORY: 72, OFFICE: 175, COMMERCIAL: 230 },
    普陀区: { STUDIO: 100, APARTMENT: 85, HOUSE: 80, VILLA: 115, LOFT: 95, DORMITORY: 50, OFFICE: 120, COMMERCIAL: 160 },
    虹口区: { STUDIO: 105, APARTMENT: 90, HOUSE: 85, VILLA: 120, LOFT: 100, DORMITORY: 52, OFFICE: 125, COMMERCIAL: 165 },
    杨浦区: { STUDIO: 100, APARTMENT: 85, HOUSE: 80, VILLA: 115, LOFT: 95, DORMITORY: 50, OFFICE: 120, COMMERCIAL: 160 },
  },
  广州: {
    天河区: { STUDIO: 90, APARTMENT: 75, HOUSE: 70, VILLA: 105, LOFT: 85, DORMITORY: 45, OFFICE: 110, COMMERCIAL: 150 },
    越秀区: { STUDIO: 85, APARTMENT: 70, HOUSE: 65, VILLA: 100, LOFT: 80, DORMITORY: 42, OFFICE: 105, COMMERCIAL: 145 },
    海珠区: { STUDIO: 80, APARTMENT: 65, HOUSE: 60, VILLA: 95, LOFT: 75, DORMITORY: 40, OFFICE: 100, COMMERCIAL: 140 },
    荔湾区: { STUDIO: 75, APARTMENT: 60, HOUSE: 55, VILLA: 90, LOFT: 70, DORMITORY: 38, OFFICE: 95, COMMERCIAL: 135 },
    白云区: { STUDIO: 65, APARTMENT: 52, HOUSE: 48, VILLA: 80, LOFT: 60, DORMITORY: 32, OFFICE: 80, COMMERCIAL: 115 },
    番禺区: { STUDIO: 60, APARTMENT: 48, HOUSE: 45, VILLA: 75, LOFT: 55, DORMITORY: 30, OFFICE: 75, COMMERCIAL: 110 },
  },
  深圳: {
    南山区: { STUDIO: 140, APARTMENT: 120, HOUSE: 115, VILLA: 160, LOFT: 130, DORMITORY: 70, OFFICE: 170, COMMERCIAL: 220 },
    福田区: { STUDIO: 135, APARTMENT: 115, HOUSE: 110, VILLA: 155, LOFT: 125, DORMITORY: 68, OFFICE: 165, COMMERCIAL: 215 },
    罗湖区: { STUDIO: 120, APARTMENT: 100, HOUSE: 95, VILLA: 140, LOFT: 110, DORMITORY: 60, OFFICE: 145, COMMERCIAL: 190 },
    宝安区: { STUDIO: 95, APARTMENT: 80, HOUSE: 75, VILLA: 115, LOFT: 90, DORMITORY: 48, OFFICE: 115, COMMERCIAL: 155 },
    龙岗区: { STUDIO: 85, APARTMENT: 70, HOUSE: 65, VILLA: 105, LOFT: 80, DORMITORY: 42, OFFICE: 105, COMMERCIAL: 145 },
    龙华区: { STUDIO: 90, APARTMENT: 75, HOUSE: 70, VILLA: 110, LOFT: 85, DORMITORY: 45, OFFICE: 110, COMMERCIAL: 150 },
  },
  杭州: {
    西湖区: { STUDIO: 90, APARTMENT: 75, HOUSE: 70, VILLA: 110, LOFT: 85, DORMITORY: 45, OFFICE: 110, COMMERCIAL: 150 },
    上城区: { STUDIO: 95, APARTMENT: 80, HOUSE: 75, VILLA: 115, LOFT: 90, DORMITORY: 48, OFFICE: 115, COMMERCIAL: 155 },
    拱墅区: { STUDIO: 85, APARTMENT: 70, HOUSE: 65, VILLA: 105, LOFT: 80, DORMITORY: 42, OFFICE: 105, COMMERCIAL: 145 },
    滨江区: { STUDIO: 100, APARTMENT: 85, HOUSE: 80, VILLA: 120, LOFT: 95, DORMITORY: 50, OFFICE: 120, COMMERCIAL: 160 },
    余杭区: { STUDIO: 70, APARTMENT: 55, HOUSE: 50, VILLA: 85, LOFT: 65, DORMITORY: 35, OFFICE: 85, COMMERCIAL: 120 },
    萧山区: { STUDIO: 75, APARTMENT: 60, HOUSE: 55, VILLA: 90, LOFT: 70, DORMITORY: 38, OFFICE: 90, COMMERCIAL: 125 },
  },
  成都: {
    锦江区: { STUDIO: 60, APARTMENT: 50, HOUSE: 45, VILLA: 75, LOFT: 55, DORMITORY: 30, OFFICE: 75, COMMERCIAL: 100 },
    青羊区: { STUDIO: 58, APARTMENT: 48, HOUSE: 43, VILLA: 72, LOFT: 53, DORMITORY: 29, OFFICE: 72, COMMERCIAL: 98 },
    武侯区: { STUDIO: 62, APARTMENT: 52, HOUSE: 47, VILLA: 78, LOFT: 58, DORMITORY: 31, OFFICE: 78, COMMERCIAL: 105 },
    成华区: { STUDIO: 55, APARTMENT: 45, HOUSE: 40, VILLA: 68, LOFT: 50, DORMITORY: 27, OFFICE: 68, COMMERCIAL: 92 },
    高新区: { STUDIO: 70, APARTMENT: 58, HOUSE: 53, VILLA: 85, LOFT: 65, DORMITORY: 35, OFFICE: 85, COMMERCIAL: 115 },
    天府新区: { STUDIO: 65, APARTMENT: 54, HOUSE: 49, VILLA: 80, LOFT: 60, DORMITORY: 32, OFFICE: 80, COMMERCIAL: 108 },
  },
};

const COMMUNITY_KEYWORDS: Record<string, Record<string, string[]>> = {
  北京: {
    朝阳区: ["国贸", "CBD", "望京", "三里屯", "双井", "大望路", "工体", "朝阳公园"],
    海淀区: ["中关村", "五道口", "西二旗", "上地", "学院路", "知春路", "万柳", "苏州街"],
    西城区: ["金融街", "西单", "西直门", "德胜门", "月坛", "阜成门", "宣武门"],
    东城区: ["王府井", "东直门", "东单", "朝阳门", "建国门", "崇文门", "天坛"],
    丰台区: ["方庄", "丽泽", "马家堡", "草桥", "角门", "宋家庄"],
    石景山区: ["八角", "古城", "鲁谷", "苹果园", "八宝山"],
    通州区: ["通州北关", "武夷花园", "梨园", "果园", "九棵树"],
    顺义区: ["后沙峪", "天竺", "中央别墅区", "顺义城区", "马坡"],
  },
  上海: {
    浦东新区: ["陆家嘴", "张江", "世纪公园", "金桥", "花木", "联洋", "碧云"],
    徐汇区: ["徐家汇", "漕河泾", "衡山路", "田林", "龙华", "万体馆"],
    长宁区: ["古北", "虹桥", "中山公园", "天山", "新华路", "江苏路"],
    静安区: ["南京西路", "静安寺", "曹家渡", "闸北公园", "大宁"],
    黄浦区: ["外滩", "人民广场", "豫园", "淮海路", "打浦桥"],
    普陀区: ["长寿路", "曹杨", "真如", "长风", "万里"],
    虹口区: ["四川北路", "北外滩", "鲁迅公园", "曲阳", "凉城"],
    杨浦区: ["五角场", "复旦", "同济", "鞍山", "控江"],
  },
  广州: {
    天河区: ["珠江新城", "天河城", "体育西", "天河北", "岗顶", "石牌桥"],
    越秀区: ["北京路", "环市东", "东山口", "淘金", "公园前"],
    海珠区: ["客村", "江南西", "琶洲", "广州塔", "滨江东"],
    荔湾区: ["上下九", "西关", "中山八", "芳村", "西门口"],
    白云区: ["新市", "三元里", "同和", "梅花园", "白云新城"],
    番禺区: ["汉溪长隆", "市桥", "大石", "番禺广场", "大学城"],
  },
  深圳: {
    南山区: ["科技园", "后海", "前海", "蛇口", "华侨城", "西丽"],
    福田区: ["福田CBD", "华强北", "车公庙", "梅林", "景田", "竹子林"],
    罗湖区: ["东门", "国贸", "翠竹", "笋岗", "莲塘", "布心"],
    宝安区: ["宝安中心", "西乡", "固戍", "龙华", "石岩"],
    龙岗区: ["龙岗中心城", "布吉", "坂田", "横岗", "平湖"],
    龙华区: ["龙华", "民治", "观澜", "大浪", "福城"],
  },
  杭州: {
    西湖区: ["西湖", "文三路", "古墩路", "紫金港", "蒋村", "留下"],
    上城区: ["湖滨", "武林广场", "钱江新城", "城站", "四季青"],
    拱墅区: ["拱宸桥", "申花", "运河", "大关", "和睦"],
    滨江区: ["滨江", "钱江三桥", "江南大道", "闻涛路", "彩虹城"],
    余杭区: ["未来科技城", "良渚", "瓶窑", "闲林", "五常"],
    萧山区: ["萧山", "钱江世纪城", "北干", "金城路", "市心"],
  },
  成都: {
    锦江区: ["春熙路", "太古里", "IFS", "三圣乡", "沙河堡"],
    青羊区: ["宽窄巷子", "骡马市", "金沙", "光华", "草堂"],
    武侯区: ["桐梓林", "科华", "红牌楼", "武侯祠", "玉林"],
    成华区: ["建设路", "万年场", "东郊记忆", "猛追湾", "昭觉寺"],
    高新区: ["金融城", "大源", "世纪城", "天府一二三街", "中和"],
    天府新区: ["兴隆湖", "麓湖", "南湖", "锦江生态带", "正兴"],
  },
};

const FEATURE_TEMPLATES = [
  "精装好房",
  "南北通透",
  "近地铁",
  "拎包入住",
  "采光极佳",
  "配套齐全",
  "交通便利",
  "学区房",
  "电梯房",
  "新装修",
  "家电齐全",
  "随时看房",
];

const CITY_LATITUDES: Record<string, { latitude: number; suggestedOrientations: string[] }> = {
  北京: { latitude: 39.9, suggestedOrientations: ["南北通透", "南", "东南", "西南"] },
  上海: { latitude: 31.2, suggestedOrientations: ["南", "东南", "南北通透", "东"] },
  广州: { latitude: 23.1, suggestedOrientations: ["东南", "南", "东", "南北通透"] },
  深圳: { latitude: 22.5, suggestedOrientations: ["东南", "东", "南", "南北通透"] },
  杭州: { latitude: 30.3, suggestedOrientations: ["南", "东南", "南北通透", "东"] },
  成都: { latitude: 30.7, suggestedOrientations: ["南", "东南", "南北通透", "西南"] },
};

function getRandomElements<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

function getLayoutLabel(bedrooms: number, bathrooms: number): string {
  if (bedrooms === 0 && bathrooms === 0) return "开间";
  if (bedrooms === 1) return "一居";
  if (bedrooms === 2) return "两居";
  if (bedrooms === 3) return "三居";
  if (bedrooms >= 4) return `${bedrooms}居`;
  return `${bedrooms}室${bathrooms}卫`;
}

function getPropertyTypeLabel(type: PropertyType): string {
  const labels: Record<PropertyType, string> = {
    APARTMENT: "公寓",
    HOUSE: "住宅",
    VILLA: "别墅",
    STUDIO: "开间",
    LOFT: "LOFT",
    DORMITORY: "宿舍",
    OFFICE: "写字楼",
    COMMERCIAL: "商铺",
  };
  return labels[type];
}

function getCommunityKeywords(city: string, district: string): string[] {
  return COMMUNITY_KEYWORDS[city]?.[district] || [];
}

function generateSuggestedTitles(body: SmartFillRequestBody): string[] {
  const { city, district, bedrooms, bathrooms, area, furnished, propertyType } = body;
  const titles: string[] = [];
  const layoutLabel = getLayoutLabel(bedrooms, bathrooms);
  const communities = getCommunityKeywords(city, district);
  const districtPrefix = district || city;
  const communityOptions = communities.length > 0 ? communities : [districtPrefix];

  const template1 = (community: string, feature: string) =>
    `${districtPrefix}${community}旁 ${furnished ? "精装" : ""}${layoutLabel} ${area}平米 ${feature}`;

  const template2 = (community: string, feature: string) =>
    `${community} ${getPropertyTypeLabel(propertyType)} ${bedrooms}室${bathrooms}卫 ${feature} | 近地铁`;

  const template3 = (community: string, feature: string) =>
    `【${feature}】${districtPrefix}${community} ${layoutLabel} 家电齐全 随时入住`;

  const template4 = (community: string, feature: string) =>
    `${city}${districtPrefix}${community} 优质房源 ${layoutLabel}${area}㎡ ${feature} 拎包即住`;

  const template5 = (community: string, feature: string) =>
    `${community}地铁口 ${furnished ? "精装修" : "简装"}${layoutLabel} ${area}平 ${feature} 采光好`;

  const templates = [template1, template2, template3, template4, template5];
  const shuffledTemplates = getRandomElements(templates, 5);
  const usedCombinations = new Set<string>();

  for (const template of shuffledTemplates) {
    const features = getRandomElements(FEATURE_TEMPLATES, 3);
    for (const feature of features) {
      const community = communityOptions[Math.floor(Math.random() * communityOptions.length)];
      const key = `${template.name}-${community}-${feature}`;
      if (!usedCombinations.has(key)) {
        usedCombinations.add(key);
        titles.push(template(community, feature));
        break;
      }
    }
    if (titles.length >= 5) break;
  }

  while (titles.length < 3) {
    const community = communityOptions[Math.floor(Math.random() * communityOptions.length)];
    const feature = FEATURE_TEMPLATES[Math.floor(Math.random() * FEATURE_TEMPLATES.length)];
    const fallback = `${districtPrefix}${community} ${layoutLabel} ${area}㎡ ${feature}`;
    if (!titles.includes(fallback)) {
      titles.push(fallback);
    }
  }

  return titles.slice(0, 5);
}

function generateSuggestedDescription(body: SmartFillRequestBody): string {
  const { bedrooms, bathrooms, area, orientation, furnished, city, district } = body;

  const paragraphs: string[] = [];

  const introLayout = `本房源为${bedrooms}室${bathrooms}卫，建筑面积约${area}平米。${orientation ? `房屋${orientation}朝向，` : ""}整体户型方正，布局合理，采光通风效果良好，居住舒适度高。`;

  const typeDesc = getPropertyTypeLabel(body.propertyType);
  const intro = `欢迎浏览本${typeDesc}房源！${introLayout}`;
  paragraphs.push(intro);

  const decoratedParagraph = furnished
    ? `房屋为精装修，装修风格简约现代，品牌家电家具配备齐全。厨房配备整体橱柜、烟机灶具；卫生间干湿分离，热水器、马桶、洗手台齐全；卧室配有舒适大床和衣柜，客厅带有沙发、茶几、电视等，真正实现拎包入住。`
    : `房屋为简装状态，基础装修完好，墙面地面整洁。厨卫基础设施齐全，可根据个人喜好添置家具家电，打造属于自己的温馨空间。`;
  paragraphs.push(decoratedParagraph);

  const communityKeywords = getCommunityKeywords(city, district);
  const nearbyKeywords = communityKeywords.length > 0
    ? communityKeywords.slice(0, 3).join("、")
    : "周边";

  const surroundingParagraph = `周边配套完善，${nearbyKeywords}等区域近在咫尺。生活方面，步行可达多家大型超市、菜市场、便利店；医疗资源丰富，附近有社区医院和三甲医院；教育配套齐全，从幼儿园到中小学一应俱全。休闲娱乐方面，周边有公园、商场、电影院，满足您的各种生活需求。`;
  paragraphs.push(surroundingParagraph);

  const transportParagraph = `交通出行便利，步行几分钟即可到达地铁站和公交站点，多条公交线路覆盖全城，自驾出行也十分便捷，周边道路畅通，距离主干道仅数分钟车程，通勤上下班轻松无忧。`;
  paragraphs.push(transportParagraph);

  const landlordParagraph = `房东直租，无中介费！本人房东，为人诚恳热情，房屋管理规范。希望租客爱惜房屋、按时付租，无不良嗜好。欢迎来电咨询或预约实地看房，非诚勿扰，期待与您的合作！`;
  paragraphs.push(landlordParagraph);

  return paragraphs.join("\n\n");
}

function calculateSuggestedPriceRange(body: SmartFillRequestBody): SuggestedPriceRange {
  const { city, district, propertyType, bedrooms, area, furnished } = body;

  const cityPrices = PRICE_PER_SQM[city];
  if (!cityPrices) {
    const fallbackAvg = 50 * area;
    return {
      min: Math.round(fallbackAvg * 0.85 / 100) * 100,
      max: Math.round(fallbackAvg * 1.15 / 100) * 100,
      avg: Math.round(fallbackAvg / 100) * 100,
    };
  }

  const districtPrices = cityPrices[district];
  const defaultPrices: Record<string, number> = { STUDIO: 70, APARTMENT: 60, HOUSE: 55, VILLA: 80, LOFT: 65, DORMITORY: 35, OFFICE: 90, COMMERCIAL: 120 };
  const priceTable = districtPrices || defaultPrices;

  let basePerSqm = priceTable[propertyType] || 60;

  if (bedrooms >= 4) basePerSqm *= 1.25;
  else if (bedrooms === 3) basePerSqm *= 1.15;
  else if (bedrooms === 2) basePerSqm *= 1.08;
  else if (bedrooms === 1) basePerSqm *= 1.0;
  else basePerSqm *= 0.95;

  if (furnished) basePerSqm *= 1.15;

  const avgPrice = Math.round(basePerSqm * area / 100) * 100;
  const minPrice = Math.round(avgPrice * 0.88 / 100) * 100;
  const maxPrice = Math.round(avgPrice * 1.12 / 100) * 100;

  return { min: minPrice, max: maxPrice, avg: avgPrice };
}

function calculateSuggestedDeposit(avgPrice: number): number {
  const depositRatio = 1 + Math.random();
  return Math.round(avgPrice * depositRatio / 100) * 100;
}

function generateSuggestedAmenities(body: SmartFillRequestBody, avgPrice: number): SuggestedAmenities {
  const { bedrooms, bathrooms, area, propertyType, furnished } = body;

  const highEnd = avgPrice >= 8000;
  const midRange = avgPrice >= 4000 && avgPrice < 8000;
  const largeArea = area >= 100;
  const isVilla = propertyType === "VILLA" || propertyType === "HOUSE";
  const isApartment = propertyType === "APARTMENT" || propertyType === "LOFT";

  return {
    hasParking: (highEnd && midRange) || largeArea || isVilla || Math.random() > 0.5,
    hasElevator: isApartment || area >= 60 || midRange || Math.random() > 0.35,
    hasBalcony: bedrooms >= 2 || largeArea || Math.random() > 0.3,
    hasGarden: isVilla || (largeArea && Math.random() > 0.5),
    hasPool: isVilla || (highEnd && Math.random() > 0.4),
    hasGym: highEnd || (midRange && Math.random() > 0.6),
    petsAllowed: furnished ? Math.random() > 0.4 : Math.random() > 0.3,
    smokingAllowed: Math.random() > 0.55,
  };
}

function getSuggestedOrientation(city: string, area: number): string {
  const cityInfo = CITY_LATITUDES[city];
  if (!cityInfo) return "南";

  const orientations = [...cityInfo.suggestedOrientations];
  if (area < 50) {
    orientations.sort((a, b) => (a === "东南" || a === "东" ? -1 : b === "东南" || b === "东" ? 1 : 0));
  } else if (area >= 100) {
    orientations.sort((a, b) => (a === "南北通透" || a === "南" ? -1 : b === "南北通透" || b === "南" ? 1 : 0));
  }

  return orientations[0];
}

export async function POST(request: Request): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await requireRole(["LANDLORD" as UserRole, "ADMIN" as UserRole]);

    const body = (await request.json()) as SmartFillRequestBody;

    if (!body.city || !body.district || !body.propertyType || body.bedrooms === undefined || body.bathrooms === undefined || !body.area) {
      return NextResponse.json(
        {
          success: false,
          error: "缺少必填字段：city, district, propertyType, bedrooms, bathrooms, area",
        },
        { status: 400 }
      );
    }

    if (body.area <= 0) {
      return NextResponse.json(
        { success: false, error: "面积必须大于0" },
        { status: 400 }
      );
    }

    if (body.bedrooms < 0 || body.bathrooms < 0) {
      return NextResponse.json(
        { success: false, error: "卧室和卫生间数量不能为负数" },
        { status: 400 }
      );
    }

    const suggestedTitles = generateSuggestedTitles(body);
    const suggestedDescription = generateSuggestedDescription(body);
    const suggestedPriceRange = calculateSuggestedPriceRange(body);
    const suggestedDeposit = calculateSuggestedDeposit(suggestedPriceRange.avg);
    const suggestedAmenities = generateSuggestedAmenities(body, suggestedPriceRange.avg);
    const suggestedMinimumStay = 1;
    const suggestedOrientation = body.orientation || getSuggestedOrientation(body.city, body.area);

    const data: SmartFillResponseData = {
      suggestedTitles,
      suggestedDescription,
      suggestedPriceRange,
      suggestedDeposit,
      suggestedAmenities,
      suggestedMinimumStay,
      suggestedOrientation,
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error in smart fill:", error);

    if (error instanceof Error && error.message.includes("redirect")) {
      return NextResponse.json(
        { success: false, error: "请先登录" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "智能填充失败",
      },
      { status: 500 }
    );
  }
}
