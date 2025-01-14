import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Welcome</h1>
      <div className="space-y-4">
        <Link href="/signup">
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Sign Up</button>
        </Link>
        <Link href="/login">
          <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Login</button>
        </Link>
        <Link href="/admin">
          <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Admin Portal</button>
        </Link>
      </div>
    </div>
  );
}
