/**
 * 客户端程序
 * 重定向到对应版本发行说明页面
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter} from "next/navigation";

export default function ComponentPage({searchParams,}: {
    searchParams?: { [key: string]: string | string[] | undefined };
})  {
    const version = searchParams?.v;
    const uriString = Array.isArray(version)
        ? version[0]
        : version;

    // 提取基础版本号
    // unityhub://6000.0.49f1/840e0a9776d9 -> 6000.0.49f1 -> 6000.0.49
    // unityhub://6000.2.0b1/d17678da8412 -> 6000.2.0b1 -> 6000.2.0b1
    function parseUnityHubUri(uri: string): { version: string | null } | null {
        // unityhub://6000.0.49f1/840e0a9776d9 -> 6000.0.49f1       matches[1]
        //                                     -> 840e0a9776d9      matches[2]
        const pattern = /^unityhub:\/\/([^\/]+)\/(.+)$/;
        const matches = uri.match(pattern);

        if (!matches || matches.length < 3) {
            return null;
        }

        // 6000.0.49f1 -> 6000.0.49
        const baseVersionMatch = matches[1].match(/^(\d+\.\d+\.\d+)([a-z]*)\d*$/i);
        let baseVersion = baseVersionMatch?.[1] ?? null;

        // 6000.2.0b1 -> 6000.2.0b1
        if (baseVersionMatch?.[2] === "a" || baseVersionMatch?.[2] === "b" || baseVersionMatch?.[2] === "p") {
            baseVersion = matches[1];
        }

        return {
            version: baseVersion,
        };
    }



    const versionShow = uriString ? parseUnityHubUri(uriString) : null;

    const router = useRouter();
    const [countdown, setCountdown] = useState(5); // 倒计时

    useEffect(() => {
        if (!versionShow) return;
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    router.push(`https://unity.com/releases/editor/whats-new/${versionShow.version}#notes`);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [versionShow, router]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            {versionShow ? (
                <><h1 className="text-6xl font-bold">303 See Other</h1>
                    <h2 className="text-2xl font-semibold mt-4"> 即将在 {countdown} 秒后重定向到 {versionShow.version} 的发行版本说明界面</h2></>
            ) : (
                <><h1 className="text-6xl font-bold">400 Bad Request</h1>
                    <p className="text-gray-600 mt-2">你来到了一片没有知识的荒原。</p></>
            )}
        </div>
    );
}