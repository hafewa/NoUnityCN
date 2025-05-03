"use client";

import React, { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname, useSearchParams } from "next/navigation";

type VersionDictionary = Record<string, string[]>;

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type SystemType = "Windows" | "MacOS" | "Linux";

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <Suspense fallback={<div className="fixed top-0 right-0 z-50 h-full w-80 bg-white shadow-lg flex items-center justify-center">加载中...</div>}>
      <SidebarContent isOpen={isOpen} onClose={onClose} />
    </Suspense>
  );
}

function SidebarContent({ isOpen, onClose }: SidebarProps) {
  const [versionsData, setVersionsData] = useState<Record<string, VersionDictionary>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [latestVersion, setLatestVersion] = useState<{type: string, url: string, year: number} | null>(null);
  const [ltsVersions, setLtsVersions] = useState<{url: string, year: number}[]>([]);
  const [systemType, setSystemType] = useState<SystemType>("MacOS");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentVersion = searchParams?.get("v") || "";
  const isDownloadPage = pathname?.includes("/download");
  const isComponentPage = pathname?.includes("/component");

  // 组件支持平台常量
  const ANDROID_BS = "Android";
  const IOS_BS = "iOS";
  const WEBGL_BS = "WebGL";
  const APPLETV_BS = "AppleTV";
  const LINUX_IL2CPP_BS = 'Linux-IL2CPP';
  const LINUX_MONO_BS = "Linux-Mono";
  const LINUX_SERVER_BS = "Linux-Server";
  const MAC_MONO_BS = "Mac-Mono";
  const MAC_SERVER_BS = "Mac-Server";
  const WINDOWS_IL2CPP_BS = "Windows-IL2CPP";
  const WINDOWS_SERVER_BS = "Windows-Server";
  const UWP_BS = "Universal-Windows-Platform";

  // 检测系统类型
  useEffect(() => {
    const detectSystem = () => {
      const platform = window.navigator.platform.toLowerCase();
      if (platform.includes('win')) {
        setSystemType("Windows");
      } else if (platform.includes('linux')) {
        setSystemType("Linux");
      } else {
        setSystemType("MacOS"); // 默认为 MacOS
      }
    };

    detectSystem();
  }, []);

  // 解析Unity Hub URI
  function parseUnityHubUri(uri: string): { version: string; fileId: string } | null {
    if (!uri) return null;
    const pattern = /^unityhub:\/\/([^\/]+)\/(.+)$/;
    const matches = uri.match(pattern);

    if (!matches || matches.length < 3) {
      return null;
    }

    return {
      version: matches[1],
      fileId: matches[2]
    };
  }

  // 构建直接下载链接
  function getDirectDownloadLink(version: string, platform: string) {
    const parsedUri = parseUnityHubUri(version);
    if (!parsedUri) return "#";
    return `https://download.unity3d.com/download_unity/${parsedUri.fileId}/UnitySetup${platform}-${parsedUri.version}`;
  }

  // 构建Windows组件下载链接
  function parseLinkwin(bs: string, version: string) {
    const parsedUri = parseUnityHubUri(version);
    if (!parsedUri) return "#";
    return `https://download.unity3d.com/download_unity/${parsedUri.fileId}/TargetSupportInstaller/UnitySetup-${bs}-Support-for-Editor-${parsedUri.version}.exe`;
  }

  // 构建Mac组件下载链接
  function parseLinkmac(bs: string, version: string) {
    const parsedUri = parseUnityHubUri(version);
    if (!parsedUri) return "#";
    return `https://download.unity3d.com/download_unity/${parsedUri.fileId}/MacEditorTargetInstaller/UnitySetup-${bs}-Support-for-Editor-${parsedUri.version}.pkg`;
  }

  // 构建Linux组件下载链接
  function parseLinklinux(bs: string, version: string) {
    const parsedUri = parseUnityHubUri(version);
    if (!parsedUri) return "#";
    return `https://download.unity3d.com/download_unity/${parsedUri.fileId}/LinuxEditorTargetInstaller/UnitySetup-${bs}-Support-for-Editor-${parsedUri.version}.tar.xz`;
  }

  useEffect(() => {
    if (!isDownloadPage && !isComponentPage) {
      const fetchAllVersions = async () => {
        setIsLoading(true);
        try {
          const types = ["LTS", "TECH", "BETA", "ALPHA"];
          const allData: Record<string, VersionDictionary> = {};
          
          for (const type of types) {
            try {
              const response = await fetch(`./version/${type}.json`);
              if (response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType?.includes('application/json')) {
                  allData[type] = await response.json();
                }
              }
            } catch (error) {
              console.error(`加载 ${type} 版本失败:`, error);
            }
          }
          
          if (Object.keys(allData).length === 0) {
            allData["LTS"] = { "6000": ["unityhub://6000.0.38f1/82314a941f2d"] };
          }
          
          setVersionsData(allData);

          const latest = findLatestVersion(allData);
          setLatestVersion(latest);

          const latestVersionYear = latest?.year || 0;
          const ltsVersionsList = findLtsVersions(allData["LTS"] || {}, latestVersionYear);
          setLtsVersions(ltsVersionsList);
        } catch (error) {
          console.error('加载版本失败:', error);
          setVersionsData({
            "LTS": { "6000": ["unityhub://6000.0.38f1/82314a941f2d"] }
          });
          setLatestVersion({type: "LTS", url: "unityhub://6000.0.38f1/82314a941f2d", year: 6000});
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchAllVersions();
    } else {
      setIsLoading(false);
    }
  }, [isDownloadPage, isComponentPage]);

  function findLatestVersion(allData: Record<string, VersionDictionary>): {type: string, url: string, year: number} | null {
    const typeOrder = ["LTS", "TECH", "BETA", "ALPHA"];
    
    for (const type of typeOrder) {
      const typeVersions = allData[type] || {};
      const availableYears = Object.keys(typeVersions)
        .map(Number)
        .sort((a, b) => b - a);

      if (availableYears.length === 0) continue;

      const latestYear = availableYears[0];
      const yearVersions = typeVersions[latestYear.toString()];

      if (!yearVersions || yearVersions.length === 0) continue;

      const latestUrl = yearVersions.sort((a, b) => {
        const aVer = a.split('://')[1].split('/')[0].split('.')[1];
        const bVer = b.split('://')[1].split('/')[0].split('.')[1];
        return bVer.localeCompare(aVer);
      })[0];

      return {type, url: latestUrl, year: latestYear};
    }
    
    return {type: "LTS", url: "unityhub://6000.0.38f1/82314a941f2d", year: 6000};
  }

  function findLtsVersions(ltsData: VersionDictionary, excludeYear: number): {url: string, year: number}[] {
    const result: {url: string, year: number}[] = [];
    
    const ltsYears = Object.keys(ltsData)
      .map(Number)
      .filter(year => year !== excludeYear)
      .sort((a, b) => b - a)
      .slice(0, 3);
    
    ltsYears.forEach(year => {
      const yearVersions = ltsData[year.toString()];
      if (yearVersions && yearVersions.length > 0) {
        const latestYearVersion = yearVersions.sort((a, b) => {
          const aVer = a.split('://')[1].split('/')[0].split('.')[1];
          const bVer = b.split('://')[1].split('/')[0].split('.')[1];
          return bVer.localeCompare(aVer);
        })[0];
        
        result.push({url: latestYearVersion, year});
      }
    });
    
    return result;
  }

  function getVersionName(url: string) {
    const version = url.split("://")[1].split("/")[0];
    return `Unity ${version}`;
  }

  // 渲染Windows组件列表
  const renderWindowsComponents = () => (
    <>
      <h3 className="font-medium text-sm text-gray-500">Windows组件</h3>
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start"
          href={parseLinkwin(ANDROID_BS, currentVersion)}
        >
          <Download className="w-4 h-4 mr-2" />
          Android Build Support
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          href={parseLinkwin(IOS_BS, currentVersion)}
        >
          <Download className="w-4 h-4 mr-2" />
          iOS Build Support
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          href={parseLinkwin(WEBGL_BS, currentVersion)}
        >
          <Download className="w-4 h-4 mr-2" />
          WebGL Build Support
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          href={parseLinkwin(WINDOWS_IL2CPP_BS, currentVersion)}
        >
          <Download className="w-4 h-4 mr-2" />
          Windows IL2CPP
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          href={parseLinkwin(WINDOWS_SERVER_BS, currentVersion)}
        >
          <Download className="w-4 h-4 mr-2" />
          Windows Server
        </Button>
      </div>
    </>
  );

  // 渲染MacOS组件列表
  const renderMacComponents = () => (
    <>
      <h3 className="font-medium text-sm text-gray-500">Mac组件</h3>
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start"
          href={parseLinkmac(ANDROID_BS, currentVersion)}
        >
          <Download className="w-4 h-4 mr-2" />
          Android Build Support
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          href={parseLinkmac(IOS_BS, currentVersion)}
        >
          <Download className="w-4 h-4 mr-2" />
          iOS Build Support
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          href={parseLinkmac(WEBGL_BS, currentVersion)}
        >
          <Download className="w-4 h-4 mr-2" />
          WebGL Build Support
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          href={parseLinkmac(MAC_MONO_BS, currentVersion)}
        >
          <Download className="w-4 h-4 mr-2" />
          Mac Mono
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          href={parseLinkmac(MAC_SERVER_BS, currentVersion)}
        >
          <Download className="w-4 h-4 mr-2" />
          Mac Server
        </Button>
      </div>
    </>
  );

  // 渲染Linux组件列表
  const renderLinuxComponents = () => (
    <>
      <h3 className="font-medium text-sm text-gray-500">Linux组件</h3>
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start"
          href={parseLinklinux(LINUX_IL2CPP_BS, currentVersion)}
        >
          <Download className="w-4 h-4 mr-2" />
          Linux IL2CPP
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          href={parseLinklinux(LINUX_MONO_BS, currentVersion)}
        >
          <Download className="w-4 h-4 mr-2" />
          Linux Mono
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          href={parseLinklinux(LINUX_SERVER_BS, currentVersion)}
        >
          <Download className="w-4 h-4 mr-2" />
          Linux Server
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          href={parseLinklinux(WEBGL_BS, currentVersion)}
        >
          <Download className="w-4 h-4 mr-2" />
          WebGL Build Support
        </Button>
      </div>
    </>
  );

  // 渲染版本下载选项
  const renderVersionDownload = () => {
    if (!currentVersion) return null;
    const parsedUri = parseUnityHubUri(currentVersion);
    if (!parsedUri) return null;

    return (
      <div className="space-y-4">
        <h3 className="font-medium text-sm text-gray-500">下载选项</h3>
        <Button
          variant="default"
          className="w-full justify-start bg-gray-900 hover:bg-gray-800"
          size="lg"
          href={currentVersion}
        >
          <Download className="w-5 h-5 mr-2" />
          使用 Unity Hub 下载
        </Button>

        {systemType === "Windows" && (
          <Button
            variant="secondary"
            className="w-full justify-start"
            size="lg"
            href={`${getDirectDownloadLink(currentVersion, "")}.exe`}
          >
            <Download className="w-5 h-5 mr-2" />
            Windows(x86-64)下载
          </Button>
        )}

        {systemType === "Linux" && (
          <Button
            variant="secondary"
            className="w-full justify-start"
            size="lg"
            href={`${getDirectDownloadLink(currentVersion, "")}.tar.xz`}
          >
            <Download className="w-5 h-5 mr-2" />
            Linux(x86-64)下载
          </Button>
        )}

        {systemType === "MacOS" && (
          <>
            <Button
              variant="secondary"
              className="w-full justify-start"
              size="lg"
              href={`${getDirectDownloadLink(currentVersion, "")}.dmg`}
            >
              <Download className="w-5 h-5 mr-2" />
              MacOS(x86-64)下载
            </Button>
            <Button
              variant="secondary"
              className="w-full justify-start"
              size="lg"
              href={`${getDirectDownloadLink(currentVersion, "-arm64")}.dmg`}
            >
              <Download className="w-5 h-5 mr-2" />
              MacOS(ARM64)下载
            </Button>
          </>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "fixed top-0 right-0 z-50 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out overflow-y-auto",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      <Card className="h-full border-0 rounded-none">
        <CardHeader className="flex flex-row items-center justify-between pb-2 sticky top-0 bg-white z-10">
          <CardTitle className="text-xl font-bold">
            NoUnityCN Copilot
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-4 text-center text-gray-500">加载中...</div>
          ) : isComponentPage ? (
            renderVersionDownload()
          ) : isDownloadPage ? (
            <div className="space-y-4">
              {systemType === "Windows" && renderWindowsComponents()}
              {systemType === "MacOS" && renderMacComponents()}
              {systemType === "Linux" && renderLinuxComponents()}
              
              <div className="pt-4">
                <Button
                  variant="secondary"
                  className="w-full justify-center"
                  href={`./component?v=${currentVersion}`}
                >
                  查看全部组件
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {latestVersion && (
                <>
                  <h3 className="font-medium text-sm text-gray-500">最新版本</h3>
                  <Button
                    variant="default"
                    className="w-full justify-start bg-gray-900 hover:bg-gray-800"
                    size="lg"
                    href={`./download?v=${latestVersion.url}`}
                  >
                    <Download className="w-5 h-5 mr-2" />
                    {getVersionName(latestVersion.url)}
                  </Button>
                </>
              )}
              
              {ltsVersions.length > 0 && (
                <>
                  <h3 className="font-medium text-sm text-gray-500 pt-2">常用版本</h3>
                  <div className="space-y-2">
                    {ltsVersions.map((version, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full justify-start"
                        href={`./download?v=${version.url}`}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {getVersionName(version.url)}
                      </Button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 