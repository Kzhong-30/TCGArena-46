export const CITIES = [
  '北京',
  '上海',
  '广州',
  '深圳',
  '杭州',
  '成都',
  '武汉',
  '西安',
];

export const RENT_RANGES: [number, number][] = [
  [0, 1000],
  [1000, 2000],
  [2000, 3000],
  [3000, 5000],
  [5000, 8000],
  [8000, 10000],
  [10000, Infinity],
];

export const AREA_RANGES: [number, number][] = [
  [0, 30],
  [30, 50],
  [50, 80],
  [80, 120],
  [120, 150],
  [150, 200],
  [200, Infinity],
];

export const FACILITIES = [
  { key: 'hasParking', label: '车位', icon: 'Car' },
  { key: 'hasElevator', label: '电梯', icon: 'Elevator' },
  { key: 'hasBalcony', label: '阳台', icon: 'Trees' },
  { key: 'hasGym', label: '健身房', icon: 'Dumbbell' },
  { key: 'hasPool', label: '泳池', icon: 'Waves' },
  { key: 'furnished', label: '家具', icon: 'Sofa' },
  { key: 'petsAllowed', label: '宠物', icon: 'Dog' },
  { key: 'smokingAllowed', label: '吸烟', icon: 'Cigarette' },
];

export const BEDROOM_OPTIONS = [1, 2, 3, 4, 5];

export const BATHROOM_OPTIONS = [1, 2, 3];

export const ORIENTATIONS = [
  '东',
  '南',
  '西',
  '北',
  '东南',
  '东北',
  '西南',
  '西北',
];

export const RENT_PERIODS = [
  { value: 'MONTHLY', label: '月付' },
  { value: 'QUARTERLY', label: '季付' },
  { value: 'HALF_YEARLY', label: '半年付' },
  { value: 'YEARLY', label: '年付' },
];

export const USER_ROLES = [
  { value: 'TENANT', label: '租客' },
  { value: 'LANDLORD', label: '房东' },
  { value: 'ADMIN', label: '管理员' },
];

export const PROPERTY_TYPES = [
  { value: 'APARTMENT', label: '公寓' },
  { value: 'HOUSE', label: '独栋别墅' },
  { value: 'VILLA', label: '联排别墅' },
  { value: 'STUDIO', label: '开间' },
  { value: 'LOFT', label: 'LOFT' },
  { value: 'DORMITORY', label: '宿舍' },
];

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  PENDING: '待确认',
  CONFIRMED: '已确认',
  REJECTED: '已拒绝',
  CANCELLED: '已取消',
  COMPLETED: '已完成',
  RESCHEDULED: '已改期',
};

export const PROPERTY_STATUS_LABELS: Record<string, string> = {
  PENDING: '待审核',
  APPROVED: '已发布',
  REJECTED: '已拒绝',
  RENTED: '已出租',
  INACTIVE: '已下架',
};

export const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  RENTED: 'bg-blue-100 text-blue-700',
  INACTIVE: 'bg-gray-100 text-gray-700',
};

export const MAP_CENTER = {
  lat: 31.2304,
  lng: 121.4737,
};

export const BOOKING_TIME_SLOTS = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];
