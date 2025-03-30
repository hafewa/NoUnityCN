"use client";
import { Download, Share, Box, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useEffect, useState } from 'react';
import { Input } from "@/components/ui/input";
import { Analytics } from "@vercel/analytics/react";

type VersionDictionary = Record<string, string[]>;

export default function Page() {
  const [versionsData, setVersionsData] = useState<Record<string, VersionDictionary>>({});
  const [showAllVersions, setShowAllVersions] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState("all");
  const [versionType, setVersionType] = useState("LTS");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{type: string, url: string}>>([]);

  useEffect(() => {
    const fetchAllVersions = async () => {
      try {
        const types = ["LTS", "TECH", "BETA", "ALPHA"];
        const allData: Record<string, VersionDictionary> = {};
        
        for (const type of types) {
          try {
            const response = await fetch(`./version/${type}.json`);
            if (response.ok) {
              const contentType = response.headers.get('content-type');
              if (contentType?.includes('application/json')) {
                const data = await response.json();
                allData[type] = data;
              }
            }
          } catch (error) {
            console.error(`加载 ${type} 版本失败:`, error);
          }
        }
        
        // 确保至少有一些数据
        if (Object.keys(allData).length === 0) {
          allData["LTS"] = { "6000": ["unityhub://6000.0.38f1/82314a941f2d"] };
        }
        
        setVersionsData(allData);
      } catch (error) {
        console.error('加载版本失败:', error);
        setVersionsData({
          "LTS": { "6000": ["unityhub://6000.0.38f1/82314a941f2d"] }
        });
      }
    };
    
    fetchAllVersions();
  }, []);

  // 当前选中类型的版本数据
  const versions = versionsData[versionType] || {};

  // 全局搜索处理
  useEffect(() => {
    if (searchQuery) {
      setIsSearching(true);
      const results: Array<{type: string, url: string}> = [];
      
      // 搜索所有类型中的版本
      const typeOrder = ["LTS", "TECH", "BETA", "ALPHA"];
      
      for (const type of typeOrder) {
        const typeVersions = versionsData[type] || {};
        
        for (const year in typeVersions) {
          for (const url of typeVersions[year]) {
            const versionName = getVersionName(url);
            if (versionName.toLowerCase().includes(searchQuery.toLowerCase())) {
              results.push({ type, url });
            }
          }
        }
      }

      // 对结果进行排序：按主版本号排序（点前面的数字）
      results.sort((a, b) => {
        const aVersion = a.url.split("://")[1].split("/")[0];
        const bVersion = b.url.split("://")[1].split("/")[0];
        
        // 主版本号排序（点前面的数字），大的排在前面
        const aMain = parseInt(aVersion.split(".")[0]);
        const bMain = parseInt(bVersion.split(".")[0]);
        if (aMain !== bMain) return bMain - aMain;
        
        // 主版本号相同时按类型排序
        const typeIndexA = typeOrder.indexOf(a.type);
        const typeIndexB = typeOrder.indexOf(b.type);
        if (typeIndexA !== typeIndexB) return typeIndexA - typeIndexB;
        
        // 最后按子版本号排序
        const aRev = aVersion.split(".")[1];
        const bRev = bVersion.split(".")[1];
        return bRev.localeCompare(aRev);
      });
      
      setSearchResults(results);
    } else {
      setIsSearching(false);
    }
  }, [searchQuery, versionsData]);

  function getLatestVersion(type: string = "LTS"): string {
    const typeVersions = versionsData[type] || {};
    // 获取所有年份并按数字降序排列
    const availableYears = Object.keys(typeVersions)
        .map(Number)
        .sort((a, b) => b - a);

    if (availableYears.length === 0) return "unityhub://6000.0.38f1/82314a941f2d";

    // 取最大年份的版本列表（将数字转回字符串key）
    const latestYear = availableYears[0].toString();
    const yearVersions = typeVersions[latestYear];

    if (!yearVersions || yearVersions.length === 0) {
      return "unityhub://6000.0.38f1/82314a941f2d";
    }

    // 根据版本号排序
    return yearVersions.sort((a, b) => {
      const aVer = a.split('/')[2].split('.')[1];
      const bVer = b.split('/')[2].split('.')[1];
      return bVer.localeCompare(aVer);
    })[0];
  }

  function getVersionName(url: string) {
    const version = url.split("://")[1].split("/")[0];
    return `Unity ${version}`;
  }

  // 过滤当前选中类型的版本列表
  const filterVersions = (versions: string[]) => {
    if (!searchQuery) return versions;
    return versions.filter(url => 
      getVersionName(url).toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // 渲染版本项
  const renderVersionItem = (url: string, type?: string) => (
    <div className="overflow-x-auto" key={`${type || versionType}-${url}`}>
      <li className="flex gap-2">
        <Button
          variant="secondary"
          className="flex-grow"
          size="lg"
          href={`./download?v=${url}`}
        >
          <Download className="w-5 h-5 mr-2"/>
          {type ? <><span className="font-bold">[{type}]</span> {getVersionName(url)} </> : getVersionName(url)}下载
        </Button>
        <Button
          className="flex-initial"
          size="lg"
          href={`./component?v=${url}`}
        >
          <Box className="w-5 h-5 mr-2"/>
          添加组件
        </Button>
      </li>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* 标题区域 */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">下载 Unity</h2>
            <p className="text-lg text-gray-600">选择适合您的版本开始创作</p>
          </div>

          {/* 版本类型切换 */}
          <div className="flex justify-center space-x-4 mb-8">
            {[
              { id: "LTS", name: "长期支持" },
              { id: "TECH", name: "技术支持" },
              { id: "BETA", name: "测试版" },
              { id: "ALPHA", name: "预览版" }
            ].map((type) => (
              <Button
                key={type.id}
                variant={versionType === type.id ? "default" : "outline"}
                onClick={() => {
                  setVersionType(type.id);
                  setSelectedVersion("all"); // 切换版本类型时重置为所有版本
                  if (searchQuery) {
                    setSearchQuery(""); // 清除搜索
                  }
                }}
              >
                {type.name}
              </Button>
            ))}
          </div>

          {/* 下载卡片 */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* 版本信息 */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl">
                  {versionType === "LTS" && "长期支持版本"}
                  {versionType === "TECH" && "技术支持版本"}
                  {versionType === "BETA" && "测试版本"}
                  {versionType === "ALPHA" && "预览版本"}
                </CardTitle>
                <Badge>{versionType}</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{getVersionName(getLatestVersion(versionType))}</p>
                <div className="space-y-4">
                  <Button className="w-full" size="lg" href={`./download?v=${getLatestVersion(versionType)}`}>
                    <Download className="w-5 h-5 mr-2"/>
                    立刻下载
                  </Button>
                  <Button variant="secondary" className="w-full" size="lg" href={`./component?v=${getLatestVersion(versionType)}`}>
                    <Box className="w-5 h-5 mr-2"/>
                    添加组件
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Hub */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl">团结引擎</CardTitle>
                <Badge>中国</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">下载Unity的中国版本</p>
                <p className="text-gray-600 mb-4">请注意：您可以将您的项目从Unity迁移到团结引擎，但目前不支持从团结引擎迁移到Unity。</p>
                <div className="space-y-4">
                  <Button variant="secondary" className="w-full" size="lg" href="https://unity.cn/releases">
                    <Share className="w-5 h-5 mr-2"/>
                    前往官网
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 所有版本下载 */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>
                {isSearching 
                  ? `全局搜索结果 "${searchQuery}"`
                  : `所有${versionType === "LTS" ? "长期支持" : 
                         versionType === "TECH" ? "技术支持" : 
                         versionType === "BETA" ? "测试" : 
                         versionType === "ALPHA" ? "预览" : ""}版本`
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* 搜索框 */}
              <div className="relative mb-6">
                <Input
                  type="text"
                  placeholder="全局搜索版本..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
            
              {!isSearching && (
                <div className="flex space-x-4 mb-4 overflow-x-auto flex-nowrap pb-2">
                  <Button
                    key="all"
                    variant={selectedVersion === "all" ? "default" : "outline"}
                    onClick={() => setSelectedVersion("all")}
                  >
                    所有版本
                  </Button>
                  {Object.keys(versions)
                    .sort((a, b) => parseInt(b) - parseInt(a)) // 对年份进行排序
                    .map((year) => (
                      <Button
                        key={year}
                        variant={selectedVersion === year ? "default" : "outline"}
                        onClick={() => setSelectedVersion(year)}
                      >
                        {year} 系列
                      </Button>
                    ))}
                </div>
              )}
              
              <ul className="space-y-4">
                {isSearching ? (
                  // 全局搜索结果
                  <>
                    {searchResults.length > 0 ? (
                      searchResults
                        .slice(0, showAllVersions ? undefined : 10)
                        .map(item => renderVersionItem(item.url, item.type))
                    ) : (
                      <li className="text-center text-gray-500 py-4">
                        没有找到匹配的版本
                      </li>
                    )}
                    
                    {!showAllVersions && searchResults.length > 10 && (
                      <li>
                        <Button
                          variant="ghost"
                          className="w-full"
                          onClick={() => setShowAllVersions(true)}
                        >
                          显示更多搜索结果 ({searchResults.length - 10} 个) ↓
                        </Button>
                      </li>
                    )}
                  </>
                ) : (
                  // 常规版本列表（按当前选中类型）
                  <>
                    {selectedVersion === "all"
                      ? Object.keys(versions)
                        .sort((a, b) => parseInt(b) - parseInt(a))
                        .flatMap(year => versions[year])
                        .filter(url => !searchQuery || getVersionName(url).toLowerCase().includes(searchQuery.toLowerCase()))
                        .slice(0, showAllVersions ? undefined : 5) // 控制显示数量
                        .map(url => renderVersionItem(url))
                      : filterVersions(versions[selectedVersion] || []).map(url => renderVersionItem(url))}
                    
                    {/* 添加更多版本按钮 */}
                    {!showAllVersions && selectedVersion === "all" && (
                      Object.keys(versions)
                        .flatMap(year => versions[year])
                        .filter(url => !searchQuery || getVersionName(url).toLowerCase().includes(searchQuery.toLowerCase()))
                        .length > 5
                    ) && (
                      <li>
                        <Button
                          variant="ghost"
                          className="w-full"
                          onClick={() => setShowAllVersions(true)}
                        >
                          显示更多版本 ↓
                        </Button>
                      </li>
                    )}
                    
                    {/* 没有匹配的版本时显示提示 */}
                    {((selectedVersion === "all" && 
                      Object.keys(versions)
                        .flatMap(year => versions[year])
                        .filter(url => !searchQuery || getVersionName(url).toLowerCase().includes(searchQuery.toLowerCase()))
                        .length === 0) || 
                      (selectedVersion !== "all" && filterVersions(versions[selectedVersion] || []).length === 0)) && 
                      searchQuery && (
                        <li className="text-center text-gray-500 py-4">
                          没有找到匹配的版本
                        </li>
                    )}
                  </>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter/>
    </div>
  );
}