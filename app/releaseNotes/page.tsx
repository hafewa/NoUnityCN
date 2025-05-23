"use server";

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import fetch from 'node-fetch';
import { micromark } from 'micromark';

// 获取 Unity 版本发布信息
async function fetchReleaseNotes(version: string) {
    const url = `https://services.api.unity.com/unity/editor/release/v1/releases?version=${encodeURIComponent(version)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API 请求失败: ${res.status}`);
    return await res.json();
}


// 获取 Markdown 文件内容
async function fetchMarkdownContent(url: string): Promise<string | null> {
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Next.js Server Component'
            }
        });
        if (!res.ok) return null;
        return await res.text();
    } catch (e) {
        console.error('获取 Markdown 出错:', e);
        return null;
    }
}

function parseUnityHubUri(uri: string) {
    const pattern = /^unityhub:\/\/([^\/]+)\/(.+)$/;
    const matches = uri.match(pattern);
    if (!matches || matches.length < 3) return null;
    return { version: matches[1] };
}

export default async function releaseNotesPage({ searchParams }: { searchParams: { v?: string | string[] } }) {
    const versionParam = Array.isArray(searchParams.v) ? searchParams.v[0] : searchParams.v;
    const parsed = versionParam ? parseUnityHubUri(versionParam) : null;

    let htmlContent = null;
    let fallbackUrl = null;

    if (parsed && parsed.version) {
        try {
            const data = await fetchReleaseNotes(parsed.version);
            if (data.results?.length > 0) {
                const releaseNote = data.results[0].releaseNotes;
                if (releaseNote.type === 'MD') {
                    const mdText = await fetchMarkdownContent(releaseNote.url);
                    if (mdText) {
                        htmlContent = micromark(mdText);
                        fallbackUrl = releaseNote.url;
                    } else {
                        fallbackUrl = releaseNote.url;
                    }
                }
            }
        } catch (e) {
            console.error('处理出错:', e);
        }

        if (htmlContent) {
            return (
                <div className="min-h-screen flex flex-col">
                    <SiteHeader />
                    <div className="flex flex-col items-center justify-center min-h-screen py-4 px-4 text-center">
                        {versionParam ? (<h1 className="text-4xl font-bold mb-4">Release Notes - {parsed.version}</h1>) : (<h1 className="text-4xl font-bold mb-4">Release Notes</h1>)}
                        <hr/>
                        <div align="left" dangerouslySetInnerHTML={{ __html: htmlContent }} />
                        <br/>
                        <hr/>
                        <p className="text-sm text-gray-500 mt-8">
                            <a href={fallbackUrl} target="_blank" rel="noopener noreferrer">{fallbackUrl}</a>
                        </p>
                    </div>
                    <SiteFooter />
                </div>
            );
        } else if (fallbackUrl) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen py-4 px-4 text-center">
                    <h1 className="text-4xl font-bold mb-4">无法加载发布说明</h1>
                    <p className="mb-4">服务器未能加载内容</p>
                    <a
                        href="https://github.com/NoUnityCN/NoUnityCN/issues/new"
                        rel="noopener noreferrer"
                        target="_blank"
                        className="text-blue-600 underline"
                    >
                        通过 Github 向开发者反馈
                    </a>

                    {/*<a*/}
                    {/*    href={fallbackUrl}*/}
                    {/*    target="_blank"*/}
                    {/*    rel="noopener noreferrer"*/}
                    {/*    className="text-blue-600 underline"*/}
                    {/*>*/}
                    {/*    单击尝试下载原始文件*/}
                    {/*</a>*/}
                </div>
            );
        } else {
            return (
                <div className="min-h-screen flex flex-col">
                    <SiteHeader />
                    <div className="flex flex-col items-center justify-center min-h-screen py-4 px-4 text-center">
                        <h1 className="text-4xl font-bold mb-4">无效的请求</h1>
                        <p>未找到对应版本的发布说明</p>
                    </div>
                    <SiteFooter />
                </div>
            );
        }
    }

    return (
        <div className="min-h-screen flex flex-col">
            <SiteHeader />
            <div className="flex flex-col items-center justify-center min-h-screen py-4 px-4 text-center">
                <h1 className="text-4xl font-bold mb-4">400 Bad Request</h1>
                <p>你来到了一片没有知识的荒原</p>
            </div>
            <SiteFooter />
        </div>
    );
}