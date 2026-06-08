"use client";

import { formType } from "@/types/formType";
import { newEventType } from "@/types/newEvent";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

function Page() {
  const { register, handleSubmit } = useForm<formType>();
  const [error, setError] = useState<string>("");
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
  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="title">タイトル: </label>
        <input
          type="text"
          id="title"
          {...register("summary", { required: false })}
          placeholder="タイトルを入力してください"
        />
        <input type="submit" />
        <label htmlFor="start-day">開始日: </label>
        <input
          type="text"
          id="start-day"
          {...register("startDay", { required: true })}
          placeholder="2026-06-07"
        />
        <input type="submit" />
        <label htmlFor="end-day">終了日: </label>
        <input
          type="text"
          id="end-day"
          {...register("endDay", { required: true })}
          placeholder="2026-06-08"
        />
        <input type="submit" />
        <label htmlFor="start-day-time">開始時間: </label>
        <input
          type="text"
          id="start-day-time"
          {...register("startDayTime", { required: false })}
          placeholder="17:00"
        />
        <input type="submit" />
        <label htmlFor="end-day-time">終了時間: </label>
        <input
          type="text"
          id="end-day-time"
          {...register("endDayTime", { required: false })}
          placeholder="18:00"
        />
        <input type="submit" />
      </form>
      {error ? <div>{error}</div> : null}
    </div>
  );
}

export default Page;
