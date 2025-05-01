export default function Forbidden() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <h1 className="text-6xl font-bold">Forbidden 访问被禁止</h1>
            <h2 className="text-2xl font-semibold mt-4">发生了什么？</h2>
            <p className="text-gray-600 mt-2">您当前的地区暂时不被NoUnityCN支持</p>
            <p className="text-gray-600 mt-2">对于您所在的地区，请访问https://unity.cn/</p>
        </div>
    )
}
