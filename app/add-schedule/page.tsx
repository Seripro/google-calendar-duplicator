"use client";

import { formType } from "@/types/formType";
import { newEventType } from "@/types/newEvent";
import { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

function Page() {
  const { status } = useSession();
  const router = useRouter();
  const { register, handleSubmit } = useForm<formType>();
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);
  const onSubmit: SubmitHandler<formType> = async (data) => {
    console.log(data);
    if (data.startDay > data.endDay) {
      setError("終了日は開始日以降に設定してください");
      return;
    }
    const endDate = new Date(data.endDay);
    endDate.setDate(endDate.getDate() + 1);
    let newEvent: newEventType = {
      summary: data.summary,
      start: {
        date: data.startDay,
        dateTime: `${data.startDay}T${data.startDayTime}:00+09:00`,
      },
      end: {
        date: endDate.toISOString().split("T")[0],
        dateTime: `${data.endDay}T${data.endDayTime}:00+09:00`,
      },
    };
    console.log(newEvent.end.date);
    if (data.startDayTime && data.endDayTime) {
      newEvent = {
        summary: data.summary,
        start: {
          date: null,
          dateTime: `${data.startDay}T${data.startDayTime}:00+09:00`,
        },
        end: {
          date: null,
          dateTime: `${data.endDay}T${data.endDayTime}:00+09:00`,
        },
      };
    } else {
      newEvent = {
        summary: data.summary,
        start: {
          date: data.startDay,
          dateTime: null,
        },
        end: {
          date: endDate.toISOString().split("T")[0],
          dateTime: null,
        },
      };
    }

    try {
      const res = await fetch("/api/calendar/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newEvent: newEvent,
        }),
      });
      const d = await res.json();
      if (d.success) {
        console.log("成功");
      } else {
        console.log("失敗");
      }
    } catch (e) {
      console.log(e);
    }
  };

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        読み込み中...
      </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-8 md:p-24 bg-gray-50">
      <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              タイトル
            </label>
            <input
              type="text"
              id="title"
              {...register("summary", { required: false })}
              placeholder="タイトルを入力してください"
              className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="start-day"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                開始日
              </label>
              <input
                type="text"
                id="start-day"
                {...register("startDay", { required: true })}
                placeholder="2026-06-07"
                className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label
                htmlFor="end-day"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                終了日
              </label>
              <input
                type="text"
                id="end-day"
                {...register("endDay", { required: true })}
                placeholder="2026-06-08"
                className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="start-day-time"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                開始時間
                <span className="ml-2 text-xs text-gray-400 font-normal">
                  任意
                </span>
              </label>
              <input
                type="text"
                id="start-day-time"
                {...register("startDayTime", { required: false })}
                placeholder="17:00"
                className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
            <div>
              <label
                htmlFor="end-day-time"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                終了時間
                <span className="ml-2 text-xs text-gray-400 font-normal">
                  任意
                </span>
              </label>
              <input
                type="text"
                id="end-day-time"
                {...register("endDayTime", { required: false })}
                placeholder="18:00"
                className="w-full border border-gray-300 rounded-lg p-2.5 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <input
              type="submit"
              value="予定を登録する"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition shadow cursor-pointer"
            />
          </div>
        </form>

        {error && (
          <div className="mt-4 p-4 rounded-lg text-center font-medium bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}
      </div>
    </main>
  );
}

export default Page;
