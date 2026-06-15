import {
  Home,
  Building2,
  Castle,
  Hotel,
  Warehouse,
  OfficeBuilding,
  ShoppingBag,
  BedDouble,
  Bath,
  Maximize2,
  MapPin,
  Car,
  Elevator,
  Trees,
  Waves,
  Dumbbell,
  Dog,
  Cigarette,
  Sofa,
} from "lucide-react";

export const PROPERTY_TYPES = [
  { value: "APARTMENT", label: "公寓", icon: Building2 },
  { value: "HOUSE", label: "独栋别墅", icon: Home },
  { value: "VILLA", label: "联排别墅", icon: Castle },
  { value: "STUDIO", label: "开间", icon: Hotel },
  { value: "LOFT", label: "LOFT", icon: Warehouse },
  { value: "DORMITORY", label: "宿舍", icon: Hotel },
  { value: "OFFICE", label: "写字楼", icon: OfficeBuilding },
  { value: "COMMERCIAL", label: "商铺", icon: ShoppingBag },
];

export const ORIENTATIONS = [
  { value: "南", label: "朝南" },
  { value: "北", label: "朝北" },
  { value: "东", label: "朝东" },
  { value: "西", label: "朝西" },
  { value: "南北", label: "南北通透" },
  { value: "东南", label: "朝东南" },
  { value: "西南", label: "朝西南" },
  { value: "东北", label: "朝东北" },
  { value: "西北", label: "朝西北" },
];

export const RENT_PERIODS = [
  { value: "MONTHLY", label: "月付" },
  { value: "QUARTERLY", label: "季付" },
  { value: "YEARLY", label: "年付" },
  { value: "DAILY", label: "日付" },
];

export const CITIES = [
  "北京", "上海", "广州", "深圳", "杭州", "南京", "苏州", "成都",
  "武汉", "西安", "重庆", "天津", "长沙", "郑州", "青岛", "大连",
  "宁波", "无锡", "合肥", "福州", "厦门", "济南", "沈阳", "哈尔滨"
];

export const DISTRICTS: Record<string, string[]> = {
  "北京": ["朝阳区", "海淀区", "东城区", "西城区", "丰台区", "通州区", "昌平区", "大兴区"],
  "上海": ["浦东新区", "黄浦区", "静安区", "徐汇区", "长宁区", "普陀区", "虹口区", "杨浦区"],
  "广州": ["天河区", "越秀区", "海珠区", "荔湾区", "白云区", "番禺区", "黄埔区", "花都区"],
  "深圳": ["福田区", "罗湖区", "南山区", "宝安区", "龙岗区", "龙华区", "坪山区", "光明区"],
  "杭州": ["西湖区", "上城区", "拱墅区", "滨江区", "萧山区", "余杭区", "临平区", "钱塘区"],
  "南京": ["玄武区", "秦淮区", "建邺区", "鼓楼区", "浦口区", "栖霞区", "雨花台区", "江宁区"],
  "苏州": ["姑苏区", "虎丘区", "吴中区", "相城区", "吴江区", "工业园区", "高新区"],
  "成都": ["锦江区", "青羊区", "金牛区", "武侯区", "成华区", "龙泉驿区", "青白江区", "新都区"],
  "武汉": ["江岸区", "江汉区", "硚口区", "汉阳区", "武昌区", "青山区", "洪山区", "东西湖区"],
  "西安": ["新城区", "碑林区", "莲湖区", "灞桥区", "未央区", "雁塔区", "长安区", "高新区"],
};

export const PRICE_RANGES = [
  { min: 0, max: 2000, label: "2000元以下" },
  { min: 2000, max: 4000, label: "2000-4000元" },
  { min: 4000, max: 6000, label: "4000-6000元" },
  { min: 6000, max: 8000, label: "6000-8000元" },
  { min: 8000, max: 10000, label: "8000-10000元" },
  { min: 10000, max: 15000, label: "10000-15000元" },
  { min: 15000, max: null, label: "15000元以上" },
];

export const AREA_RANGES = [
  { min: 0, max: 50, label: "50㎡以下" },
  { min: 50, max: 80, label: "50-80㎡" },
  { min: 80, max: 120, label: "80-120㎡" },
  { min: 120, max: 150, label: "120-150㎡" },
  { min: 150, max: 200, label: "150-200㎡" },
  { min: 200, max: null, label: "200㎡以上" },
];

export const BEDROOM_OPTIONS = [
  { value: 1, label: "1室" },
  { value: 2, label: "2室" },
  { value: 3, label: "3室" },
  { value: 4, label: "4室" },
  { value: 5, label: "5室及以上" },
];

export const FACILITIES = [
  { key: "furnished", label: "家具", icon: Sofa },
  { key: "hasParking", label: "停车位", icon: Car },
  { key: "hasElevator", label: "电梯", icon: Elevator },
  { key: "hasBalcony", label: "阳台", icon: Trees },
  { key: "hasGarden", label: "花园", icon: Trees },
  { key: "hasPool", label: "泳池", icon: Waves },
  { key: "hasGym", label: "健身房", icon: Dumbbell },
  { key: "petsAllowed", label: "可养宠物", icon: Dog },
  { key: "smokingAllowed", label: "可吸烟", icon: Cigarette },
];

export const PROPERTY_FEATURES = [
  { key: "bedrooms", label: "卧室", icon: BedDouble },
  { key: "bathrooms", label: "卫生间", icon: Bath },
  { key: "area", label: "面积", icon: Maximize2 },
  { key: "address", label: "地址", icon: MapPin },
];

export const BOOKING_TIME_SLOTS = [
  "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
];

export const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  RENTED: "bg-blue-100 text-blue-800",
  ACTIVE: "bg-green-100 text-green-800",
  INACTIVE: "bg-gray-100 text-gray-800",
  SOLD: "bg-purple-100 text-purple-800",
  CONFIRMED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  COMPLETED: "bg-blue-100 text-blue-800",
  RESCHEDULED: "bg-orange-100 text-orange-800",
  DELIVERED: "bg-blue-100 text-blue-800",
  READ: "bg-green-100 text-green-800",
  SENT: "bg-yellow-100 text-yellow-800",
  OPEN: "bg-red-100 text-red-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  RESOLVED: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800",
  TENANT: "bg-blue-100 text-blue-800",
  LANDLORD: "bg-purple-100 text-purple-800",
  ADMIN: "bg-red-100 text-red-800",
};

export const COMPLAINT_TYPES = [
  { value: "PROPERTY_ISSUE", label: "房源问题" },
  { value: "LANDLORD_ISSUE", label: "房东问题" },
  { value: "TENANT_ISSUE", label: "租客问题" },
  { value: "PAYMENT_ISSUE", label: "支付问题" },
  { value: "OTHER", label: "其他问题" },
];

export const PRIORITY_LEVELS = [
  { value: "LOW", label: "低" },
  { value: "MEDIUM", label: "中" },
  { value: "HIGH", label: "高" },
  { value: "URGENT", label: "紧急" },
];

export const SAMPLE_PROPERTY_IMAGES = [
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop",
];

export const MAP_CENTER = {
  lat: 39.9042,
  lng: 116.4074,
  zoom: 12,
};
