"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar, Clock, Users, MessageSquare, Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import Modal from "./Modal";
import { BOOKING_TIME_SLOTS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { BookingFormData, Property } from "@/types";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: Property;
  landlordId: string;
  onSuccess?: () => void;
}

const bookingSchema = z
  .object({
    preferredDate: z.date({
      required_error: "请选择预约日期",
    }),
    preferredTime: z.string({
      required_error: "请选择预约时间",
    }),
    alternateDate: z.date().optional(),
    alternateTime: z.string().optional(),
    message: z
      .string()
      .max(500, "留言不能超过500字")
      .optional(),
    numberOfPeople: z
      .number()
      .int("人数必须是整数")
      .min(1, "至少1人")
      .max(10, "最多10人")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.alternateDate && !data.alternateTime) {
        return false;
      }
      if (data.alternateTime && !data.alternateDate) {
        return false;
      }
      return true;
    },
    {
      message: "备选时间需要同时填写日期和时间",
      path: ["alternateTime"],
    }
  );

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function BookingModal({
  isOpen,
  onClose,
  property,
  landlordId,
  onSuccess,
}: BookingModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      numberOfPeople: 1,
    },
  });

  const preferredDate = watch("preferredDate");

  const onSubmit = async (data: BookingFormValues) => {
    setIsSubmitting(true);

    try {
      const bookingData: BookingFormData = {
        propertyId: property.id,
        preferredDate: data.preferredDate,
        preferredTime: data.preferredTime,
        alternateDate: data.alternateDate,
        alternateTime: data.alternateTime,
        message: data.message,
        numberOfPeople: data.numberOfPeople,
      };

      await axios.post("/api/bookings", bookingData);

      toast.success("预约申请已提交，房东将尽快与您联系");
      reset();
      onClose();
      onSuccess?.();
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error("请先登录后再预约");
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("提交失败，请稍后重试");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="预约看房"
      size="lg"
    >
      <div className="mb-6 p-4 bg-gray-50 rounded-xl">
        <p className="font-medium text-gray-900">{property.title}</p>
        <p className="text-sm text-gray-500 mt-1">{property.address}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            期望看房日期 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            min={formatDate(today)}
            {...register("preferredDate", {
              valueAsDate: true,
            })}
            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              errors.preferredDate ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.preferredDate && (
            <p className="mt-1 text-sm text-red-500">
              {errors.preferredDate.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-2" />
            期望看房时间 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {BOOKING_TIME_SLOTS.map((time) => (
              <button
                key={time}
                type="button"
                {...register("preferredTime")}
                onClick={() =>
                  register("preferredTime").onChange({
                    target: { value: time },
                  })
                }
                className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                  watch("preferredTime") === time
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-500"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
          {errors.preferredTime && (
            <p className="mt-1 text-sm text-red-500">
              {errors.preferredTime.message}
            </p>
          )}
        </div>

        <div className="border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-500 mb-4">以下为选填项</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                备选日期
              </label>
              <input
                type="date"
                min={formatDate(today)}
                {...register("alternateDate", {
                  valueAsDate: true,
                })}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.alternateDate ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                备选时间
              </label>
              <select
                {...register("alternateTime")}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.alternateTime ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">请选择时间</option>
                {BOOKING_TIME_SLOTS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {errors.alternateTime && (
            <p className="mt-1 text-sm text-red-500">
              {errors.alternateTime.message}
            </p>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-2" />
              看房人数
            </label>
            <input
              type="number"
              min="1"
              max="10"
              {...register("numberOfPeople", {
                valueAsNumber: true,
              })}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                errors.numberOfPeople ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.numberOfPeople && (
              <p className="mt-1 text-sm text-red-500">
                {errors.numberOfPeople.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MessageSquare className="w-4 h-4 inline mr-2" />
              留言给房东
            </label>
            <textarea
              rows={3}
              placeholder="可以告诉房东您的一些情况，比如是否有宠物、入住时间等..."
              {...register("message")}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none ${
                errors.message ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.message && (
              <p className="mt-1 text-sm text-red-500">
                {errors.message.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                提交中...
              </>
            ) : (
              "确认预约"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
