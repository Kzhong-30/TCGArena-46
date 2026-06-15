"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import {
  Home,
  MapPin,
  Wrench,
  Image,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import ImageUpload from "./ImageUpload";
import { PropertyType, RentPeriod } from "@/types";
import { cn } from "@/lib/utils";

const propertySchema = z.object({
  title: z.string().min(5, "标题至少5个字符").max(100, "标题最多100个字符"),
  description: z.string().min(20, "描述至少20个字符").max(2000, "描述最多2000个字符"),
  type: z.enum(["APARTMENT", "HOUSE", "VILLA", "STUDIO", "LOFT", "DORMITORY", "OFFICE", "COMMERCIAL"]),
  area: z.number().min(1, "面积必须大于0").max(10000, "面积不能超过10000平米"),
  bedrooms: z.number().int().min(0, "卧室数量不能为负数").max(20, "卧室数量不能超过20"),
  bathrooms: z.number().int().min(0, "卫生间数量不能为负数").max(20, "卫生间数量不能超过20"),
  floor: z.number().int().optional(),
  totalFloors: z.number().int().optional(),
  orientation: z.string().optional(),
  furnished: z.boolean().default(false),
  hasParking: z.boolean().default(false),
  hasElevator: z.boolean().default(false),
  hasBalcony: z.boolean().default(false),
  hasGarden: z.boolean().default(false),
  hasPool: z.boolean().default(false),
  hasGym: z.boolean().default(false),
  petsAllowed: z.boolean().default(false),
  smokingAllowed: z.boolean().default(false),
  address: z.string().min(5, "地址至少5个字符"),
  city: z.string().min(1, "请选择城市"),
  district: z.string().min(1, "请选择区域"),
  province: z.string().min(1, "请选择省份"),
  zipCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  price: z.number().min(1, "租金必须大于0").max(1000000, "租金不能超过100万"),
  rentPeriod: z.enum(["MONTHLY", "QUARTERLY", "YEARLY", "DAILY"]).default("MONTHLY"),
  deposit: z.number().optional(),
  images: z.array(z.string()).min(1, "请至少上传1张图片").max(10, "最多上传10张图片"),
  videoUrl: z.string().url("请输入有效的视频链接").optional().or(z.literal("")),
  virtualTourUrl: z.string().url("请输入有效的VR链接").optional().or(z.literal("")),
  availableFrom: z.string().optional(),
  minimumStay: z.number().int().min(1, "最短租期至少1个月").optional(),
  maximumStay: z.number().int().optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

const steps = [
  { id: 1, name: "基本信息", icon: Home },
  { id: 2, name: "位置信息", icon: MapPin },
  { id: 3, name: "配套设施", icon: Wrench },
  { id: 4, name: "图片上传", icon: Image },
  { id: 5, name: "租金配置", icon: DollarSign },
];

interface PropertyWizardProps {
  initialData?: Partial<PropertyFormData>;
  propertyId?: string;
  mode?: "create" | "edit";
}

export default function PropertyWizard({ initialData, propertyId, mode = "create" }: PropertyWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      type: "APARTMENT",
      area: 0,
      bedrooms: 0,
      bathrooms: 0,
      furnished: false,
      hasParking: false,
      hasElevator: false,
      hasBalcony: false,
      hasGarden: false,
      hasPool: false,
      hasGym: false,
      petsAllowed: false,
      smokingAllowed: false,
      address: "",
      city: "",
      district: "",
      province: "",
      price: 0,
      rentPeriod: "MONTHLY",
      images: [],
      videoUrl: "",
      virtualTourUrl: "",
      minimumStay: 1,
    },
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = methods;

  const watchImages = watch("images");

  const validateCurrentStep = async () => {
    const stepFields: Record<number, (keyof PropertyFormData)[]> = {
      1: ["title", "description", "type", "area", "bedrooms", "bathrooms"],
      2: ["address", "city", "district", "province"],
      3: [],
      4: ["images"],
      5: ["price", "rentPeriod"],
    };

    const fieldsToValidate = stepFields[currentStep];
    if (fieldsToValidate.length === 0) return true;

    const isValid = await trigger(fieldsToValidate as any);
    return isValid;
  };

  const nextStep = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) {
      toast.error("请完善当前步骤的信息");
      return;
    }
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: PropertyFormData) => {
    setIsSubmitting(true);
    try {
      if (mode === "create") {
        await axios.post("/api/landlord/properties", data);
        toast.success("房源发布成功，等待审核");
        router.push("/landlord/properties");
      } else if (mode === "edit" && propertyId) {
        await axios.put(`/api/landlord/properties/${propertyId}`, data);
        toast.success("房源更新成功");
        router.push("/landlord/properties");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "提交失败，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">房源标题</label>
              <input
                type="text"
                {...register("title")}
                placeholder="例如：朝阳区精装两居室 近地铁"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">房源描述</label>
              <textarea
                {...register("description")}
                rows={4}
                placeholder="详细描述房源情况，包括装修风格、周边配套等"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">房源类型</label>
                <select
                  {...register("type")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="APARTMENT">公寓</option>
                  <option value="HOUSE">住宅</option>
                  <option value="VILLA">别墅</option>
                  <option value="STUDIO">单间</option>
                  <option value="LOFT">LOFT</option>
                  <option value="DORMITORY">宿舍</option>
                  <option value="OFFICE">写字楼</option>
                  <option value="COMMERCIAL">商铺</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">面积 (㎡)</label>
                <input
                  type="number"
                  {...register("area", { valueAsNumber: true })}
                  placeholder="例如：80"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.area && <p className="mt-1 text-sm text-red-500">{errors.area.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">卧室数量</label>
                <input
                  type="number"
                  {...register("bedrooms", { valueAsNumber: true })}
                  placeholder="例如：2"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.bedrooms && <p className="mt-1 text-sm text-red-500">{errors.bedrooms.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">卫生间数量</label>
                <input
                  type="number"
                  {...register("bathrooms", { valueAsNumber: true })}
                  placeholder="例如：1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.bathrooms && <p className="mt-1 text-sm text-red-500">{errors.bathrooms.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">楼层</label>
                <input
                  type="number"
                  {...register("floor", { valueAsNumber: true })}
                  placeholder="例如：5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">总楼层</label>
                <input
                  type="number"
                  {...register("totalFloors", { valueAsNumber: true })}
                  placeholder="例如：20"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">朝向</label>
                <select
                  {...register("orientation")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">请选择</option>
                  <option value="南">南</option>
                  <option value="北">北</option>
                  <option value="东">东</option>
                  <option value="西">西</option>
                  <option value="东南">东南</option>
                  <option value="西南">西南</option>
                  <option value="东北">东北</option>
                  <option value="西北">西北</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">省份</label>
                <input
                  type="text"
                  {...register("province")}
                  placeholder="例如：北京市"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.province && <p className="mt-1 text-sm text-red-500">{errors.province.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">城市</label>
                <input
                  type="text"
                  {...register("city")}
                  placeholder="例如：北京市"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">区域</label>
                <input
                  type="text"
                  {...register("district")}
                  placeholder="例如：朝阳区"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.district && <p className="mt-1 text-sm text-red-500">{errors.district.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">详细地址</label>
              <input
                type="text"
                {...register("address")}
                placeholder="例如：建国路88号院1号楼"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">邮政编码</label>
              <input
                type="text"
                {...register("zipCode")}
                placeholder="例如：100000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">纬度</label>
                <input
                  type="number"
                  step="0.00000001"
                  {...register("latitude", { valueAsNumber: true })}
                  placeholder="例如：39.9042"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">经度</label>
                <input
                  type="number"
                  step="0.00000001"
                  {...register("longitude", { valueAsNumber: true })}
                  placeholder="例如：116.4074"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">房屋配套</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { key: "furnished", label: "精装修" },
                  { key: "hasParking", label: "停车位" },
                  { key: "hasElevator", label: "电梯" },
                  { key: "hasBalcony", label: "阳台" },
                  { key: "hasGarden", label: "花园" },
                  { key: "hasPool", label: "游泳池" },
                  { key: "hasGym", label: "健身房" },
                ].map((item) => (
                  <label key={item.key} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      {...register(item.key as keyof PropertyFormData)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">其他政策</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { key: "petsAllowed", label: "允许养宠物" },
                  { key: "smokingAllowed", label: "允许吸烟" },
                ].map((item) => (
                  <label key={item.key} className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      {...register(item.key as keyof PropertyFormData)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-gray-700">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">房源图片</label>
              <ImageUpload
                value={watchImages}
                onChange={(images) => setValue("images", images, { shouldValidate: true })}
                maxFiles={10}
              />
              {errors.images && <p className="mt-2 text-sm text-red-500">{errors.images.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">视频链接 (可选)</label>
                <input
                  type="url"
                  {...register("videoUrl")}
                  placeholder="例如：https://youtube.com/watch?v=..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.videoUrl && <p className="mt-1 text-sm text-red-500">{errors.videoUrl.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">VR 全景链接 (可选)</label>
                <input
                  type="url"
                  {...register("virtualTourUrl")}
                  placeholder="例如：https://..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.virtualTourUrl && <p className="mt-1 text-sm text-red-500">{errors.virtualTourUrl.message}</p>}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">月租金 (元)</label>
                <input
                  type="number"
                  {...register("price", { valueAsNumber: true })}
                  placeholder="例如：3000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">付款周期</label>
                <select
                  {...register("rentPeriod")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="MONTHLY">按月</option>
                  <option value="QUARTERLY">按季</option>
                  <option value="YEARLY">按年</option>
                  <option value="DAILY">按天</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">押金 (元)</label>
                <input
                  type="number"
                  {...register("deposit", { valueAsNumber: true })}
                  placeholder="例如：3000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">可入住日期</label>
                <input
                  type="date"
                  {...register("availableFrom")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">最短租期 (月)</label>
                <input
                  type="number"
                  {...register("minimumStay", { valueAsNumber: true })}
                  placeholder="例如：1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">最长租期 (月)</label>
                <input
                  type="number"
                  {...register("maximumStay", { valueAsNumber: true })}
                  placeholder="留空表示不限制"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isActive = currentStep === step.id;

              return (
                <div key={step.id} className="flex-1 relative">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all",
                        isCompleted
                          ? "bg-green-500 border-green-500 text-white"
                          : isActive
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-white border-gray-300 text-gray-400"
                      )}
                    >
                      {isCompleted ? <Check className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <span
                      className={cn(
                        "mt-2 text-sm font-medium",
                        isActive ? "text-blue-600" : isCompleted ? "text-green-600" : "text-gray-500"
                      )}
                    >
                      {step.name}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "absolute top-6 left-1/2 w-full h-0.5 -translate-y-1/2",
                        currentStep > step.id ? "bg-green-500" : "bg-gray-200"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl border border-gray-200 p-6 md:p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            步骤 {currentStep}: {steps[currentStep - 1].name}
          </h2>

          {renderStepContent()}

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={cn(
                "flex items-center px-6 py-3 rounded-lg font-medium transition-colors",
                currentStep === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              上一步
            </button>

            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                下一步
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Check className="w-5 h-5 mr-2" />
                )}
                {mode === "create" ? "发布房源" : "保存修改"}
              </button>
            )}
          </div>
        </form>
      </div>
    </FormProvider>
  );
}
