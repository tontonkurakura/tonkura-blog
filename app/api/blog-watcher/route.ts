import { watchNewFiles } from "@/utils/fileWatcher";
import { NextResponse } from "next/server";

// グローバル変数でウォッチャーの状態を管理
let isWatcherStarted = false;

export async function GET() {
  if (!isWatcherStarted) {
    watchNewFiles();
    isWatcherStarted = true;
    return NextResponse.json({ status: "started" });
  }
  return NextResponse.json({ status: "already_running" });
}
