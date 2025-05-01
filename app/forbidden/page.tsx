import Link from "next/link"

export default function Forbidden() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-2">
            <h1 className="text-6xl font-bold">Forbidden</h1>
            <h1 className="text-6xl font-bold">访问被禁止</h1>
            <h2 className="text-2xl font-semibold mt-4">发生了什么？</h2>
            <p className="text-gray-600 mt-2">您当前的地区暂时不被NoUnityCN支持</p>
            <p className="text-gray-600 mt-2">对于您所在的地区，请访问
                <Link href="https://unity.cn/" className="mt-4 text-blue-600 hover:text-blue-800 underline">
            https://unity.cn/
                </Link>
            </p>
            
        </div>
    )
}
